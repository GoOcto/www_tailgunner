#!/usr/bin/env bash
# Provisions the complete tailgunner high-scores backend.
#
# Architecture:
#   Browser -> API Gateway (HTTPS) -> Lambda (Node.js) -> DynamoDB
#
# What it creates (idempotent — skips anything that already exists):
#   1. DynamoDB table  tailgunner-scores   (scope PK, id SK, TTL on 'ttl')
#   2. IAM role        tailgunner-lambda   (dynamodb:PutItem/Query on the table)
#   3. Lambda function tailgunner-scores   (POST /scores, GET /scores)
#   4. API Gateway     tailgunner-api      (REST API, /scores resource, POST+GET)
#   5. Lambda permission for API Gateway to invoke the function
#
# Usage:
#   ./provision-backend.sh                        # create everything
#   TABLE_NAME=my-scores REGION=us-west-2 ./provision-backend.sh
#   ./provision-backend.sh --delete               # tear down everything
#
# After running, set API_ENDPOINT in src/HighScores.js to the printed URL.

set -euo pipefail

REGION="${REGION:-us-east-1}"
TABLE_NAME="${TABLE_NAME:-tailgunner-scores}"
LAMBDA_NAME="${LAMBDA_NAME:-tailgunner-scores}"
API_NAME="${API_NAME:-tailgunner-api}"
ROLE_NAME="${ROLE_NAME:-tailgunner-lambda}"

ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

# --- helpers ---------------------------------------------------------------

table_exists() {
    aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" >/dev/null 2>&1
}

lambda_exists() {
    aws lambda get-function --function-name "$LAMBDA_NAME" --region "$REGION" >/dev/null 2>&1
}

role_exists() {
    aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1
}

api_exists() {
    aws apigateway get-rest-apis --region "$REGION" \
        --query "items[?name=='$API_NAME'].id" --output text | grep -q .
}

get_api_id() {
    aws apigateway get-rest-apis --region "$REGION" \
        --query "items[?name=='$API_NAME'].id" --output text
}

# --- delete ----------------------------------------------------------------

if [[ "${1:-}" == "--delete" ]]; then
    echo "=== Tearing down tailgunner backend ==="

    if api_exists; then
        API_ID=$(get_api_id)
        echo "Deleting API Gateway '$API_NAME' ($API_ID)..."
        aws apigateway delete-rest-api --rest-api-id "$API_ID" --region "$REGION"
    else
        echo "API Gateway '$API_NAME' not found, skipping."
    fi

    if lambda_exists; then
        echo "Deleting Lambda '$LAMBDA_NAME'..."
        aws lambda delete-function --function-name "$LAMBDA_NAME" --region "$REGION"
    else
        echo "Lambda '$LAMBDA_NAME' not found, skipping."
    fi

    if role_exists; then
        echo "Detaching policies from IAM role '$ROLE_NAME'..."
        for policy_arn in $(aws iam list-attached-role-policies --role-name "$ROLE_NAME" \
            --query 'AttachedPolicies[].PolicyArn' --output text); do
            aws iam detach-role-policy --role-name "$ROLE_NAME" --policy-arn "$policy_arn"
        done
        echo "Deleting IAM role '$ROLE_NAME'..."
        aws iam delete-role --role-name "$ROLE_NAME"
    else
        echo "IAM role '$ROLE_NAME' not found, skipping."
    fi

    if table_exists; then
        echo "Deleting DynamoDB table '$TABLE_NAME'..."
        aws dynamodb delete-table --table-name "$TABLE_NAME" --region "$REGION"
        aws dynamodb wait table-not-exists --table-name "$TABLE_NAME" --region "$REGION"
    else
        echo "Table '$TABLE_NAME' not found, skipping."
    fi

    echo "Teardown complete."
    exit 0
fi

# --- 1. DynamoDB table ------------------------------------------------------

echo ""
echo "=== 1. DynamoDB table ==="
if table_exists; then
    echo "Table '$TABLE_NAME' already exists, skipping."
else
    echo "Creating table '$TABLE_NAME'..."
    aws dynamodb create-table \
        --table-name "$TABLE_NAME" \
        --attribute-definitions \
            AttributeName=scope,AttributeType=S \
            AttributeName=id,AttributeType=S \
        --key-schema \
            AttributeName=scope,KeyType=HASH \
            AttributeName=id,KeyType=RANGE \
        --billing-mode PAY_PER_REQUEST \
        --region "$REGION"
    aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$REGION"
fi

# Enable TTL (idempotent — skip if already enabled)
TTL_STATUS=$(aws dynamodb describe-time-to-live \
    --table-name "$TABLE_NAME" --region "$REGION" \
    --query 'TimeToLiveDescription.TimeToLiveStatus' --output text)
if [[ "$TTL_STATUS" == "ENABLED" ]]; then
    echo "TTL already enabled, skipping."
else
    echo "Enabling TTL on 'ttl' attribute..."
    aws dynamodb update-time-to-live \
        --table-name "$TABLE_NAME" \
        --time-to-live-specification "Enabled=true,AttributeName=ttl" \
        --region "$REGION" >/dev/null
fi

# --- 2. IAM role ------------------------------------------------------------

echo ""
echo "=== 2. IAM role ==="
if role_exists; then
    echo "Role '$ROLE_NAME' already exists, skipping."
else
    echo "Creating IAM role '$ROLE_NAME'..."
    aws iam create-role --role-name "$ROLE_NAME" \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {"Service": "lambda.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }]
        }' >/dev/null

    # Basic Lambda execution (CloudWatch logs)
    aws iam attach-role-policy --role-name "$ROLE_NAME" \
        --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

    # DynamoDB access scoped to just this table
    aws iam put-role-policy --role-name "$ROLE_NAME" \
        --policy-name "dynamodb-scores" \
        --policy-document "{
            \"Version\": \"2012-10-17\",
            \"Statement\": [{
                \"Effect\": \"Allow\",
                \"Action\": [\"dynamodb:PutItem\", \"dynamodb:Query\"],
                \"Resource\": \"arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${TABLE_NAME}\"
            }]
        }"
    echo "Waiting for role to propagate..."
    sleep 10
fi

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

# --- 3. Lambda function -----------------------------------------------------

echo ""
echo "=== 3. Lambda function ==="

LAMBDA_CODE=$(cat <<'LAMBDA_EOF'
import { DynamoDBClient, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";

const db = new DynamoDBClient({});
const TABLE = process.env.TABLE_NAME;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Content-Type": "application/json",
};

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod;

  if (method === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  if (method === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { score, scope, ttl, datetime } = body;
      if (typeof score !== "number" || score <= 0) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid score" }) };
      }
      if (scope !== "30d" && scope !== "alltime") {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid scope" }) };
      }
      const item = {
        scope: { S: scope },
        id: { S: `${Date.now()}#${crypto.randomUUID()}` },
        score: { N: String(score) },
        datetime: { S: datetime || new Date().toISOString() },
      };
      if (typeof ttl === "number" && ttl > 0) {
        item.ttl = { N: String(ttl) };
      }
      await db.send(new PutItemCommand({ TableName: TABLE, Item: item }));
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    } catch (err) {
      console.error("POST error:", err);
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Internal error" }) };
    }
  }

  if (method === "GET") {
    try {
      const result = {};
      for (const scope of ["30d", "ever"]) {
        const dynamoScope = scope === "30d" ? "30d" : "alltime";
        const resp = await db.send(new QueryCommand({
          TableName: TABLE,
          KeyConditionExpression: "#s = :s",
          ExpressionAttributeNames: { "#s": "scope", "#sc": "score" },
          ExpressionAttributeValues: { ":s": { S: dynamoScope } },
          ProjectionExpression: "#sc",
        }));
        const scores = (resp.Items || []).map((i) => parseInt(i.score.N, 10));
        result[scope] = scores.length > 0 ? Math.max(...scores) : 0;
      }
      return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };
    } catch (err) {
      console.error("GET error:", err);
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Internal error" }) };
    }
  }

  return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
};
LAMBDA_EOF
)

if lambda_exists; then
    echo "Lambda '$LAMBDA_NAME' already exists, updating code..."
    TMPDIR=$(mktemp -d)
    echo "$LAMBDA_CODE" > "$TMPDIR/index.mjs"
    python3 -c "import zipfile; z=zipfile.ZipFile('$TMPDIR/function.zip','w'); z.write('$TMPDIR/index.mjs','index.mjs'); z.close()"
    aws lambda update-function-code \
        --function-name "$LAMBDA_NAME" \
        --zip-file "fileb://$TMPDIR/function.zip" \
        --region "$REGION" >/dev/null
    rm -rf "$TMPDIR"
    echo "Lambda code updated."
else
    echo "Creating Lambda '$LAMBDA_NAME'..."
    TMPDIR=$(mktemp -d)
    echo "$LAMBDA_CODE" > "$TMPDIR/index.mjs"
    python3 -c "import zipfile; z=zipfile.ZipFile('$TMPDIR/function.zip','w'); z.write('$TMPDIR/index.mjs','index.mjs'); z.close()"
    aws lambda create-function \
        --function-name "$LAMBDA_NAME" \
        --runtime nodejs24.x \
        --handler index.handler \
        --role "$ROLE_ARN" \
        --zip-file "fileb://$TMPDIR/function.zip" \
        --environment "Variables={TABLE_NAME=$TABLE_NAME}" \
        --timeout 10 \
        --memory-size 128 \
        --region "$REGION" >/dev/null
    rm -rf "$TMPDIR"
    echo "Waiting for Lambda to become active..."
    aws lambda wait function-active-v2 --function-name "$LAMBDA_NAME" --region "$REGION"
fi

LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${LAMBDA_NAME}"

# --- 4. API Gateway ---------------------------------------------------------

echo ""
echo "=== 4. API Gateway ==="

if api_exists; then
    API_ID=$(get_api_id)
    echo "API '$API_NAME' already exists ($API_ID), skipping."
else
    echo "Creating API Gateway '$API_NAME'..."
    API_ID=$(aws apigateway create-rest-api \
        --name "$API_NAME" \
        --region "$REGION" \
        --query 'id' --output text)

    # Get root resource ID
    ROOT_ID=$(aws apigateway get-resources \
        --rest-api-id "$API_ID" --region "$REGION" \
        --query 'items[?path==`/`].id' --output text)

    # Create /scores resource
    RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" --parent-id "$ROOT_ID" \
        --path-part "scores" --region "$REGION" \
        --query 'id' --output text)

    LAMBDA_URI="arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations"

    # POST /scores -> Lambda
    aws apigateway put-method \
        --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID" \
        --http-method POST --authorization-type NONE --region "$REGION"

    aws apigateway put-integration \
        --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID" \
        --http-method POST --type AWS_PROXY \
        --integration-http-method POST \
        --uri "$LAMBDA_URI" --region "$REGION"

    # GET /scores -> Lambda
    aws apigateway put-method \
        --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID" \
        --http-method GET --authorization-type NONE --region "$REGION"

    aws apigateway put-integration \
        --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID" \
        --http-method GET --type AWS_PROXY \
        --integration-http-method POST \
        --uri "$LAMBDA_URI" --region "$REGION"

    # OPTIONS /scores (CORS preflight)
    aws apigateway put-method \
        --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID" \
        --http-method OPTIONS --authorization-type NONE --region "$REGION"

    aws apigateway put-integration \
        --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID" \
        --http-method OPTIONS --type AWS_PROXY \
        --integration-http-method POST \
        --uri "$LAMBDA_URI" --region "$REGION"

    # Deploy to 'prod' stage
    aws apigateway create-deployment \
        --rest-api-id "$API_ID" --stage-name prod --region "$REGION" >/dev/null

    echo "API Gateway created and deployed."
fi

# --- 5. Lambda invoke permission for API Gateway ----------------------------

echo ""
echo "=== 5. Lambda invoke permission ==="
STATEMENT_ID="apigateway-invoke"
if aws lambda get-policy --function-name "$LAMBDA_NAME" --region "$REGION" 2>/dev/null | grep -q "$STATEMENT_ID"; then
    echo "Permission already exists, skipping."
else
    echo "Adding invoke permission for API Gateway..."
    aws lambda add-permission \
        --function-name "$LAMBDA_NAME" \
        --statement-id "$STATEMENT_ID" \
        --action lambda:InvokeFunction \
        --principal apigateway.amazonaws.com \
        --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*" \
        --region "$REGION" >/dev/null
fi

# --- done -------------------------------------------------------------------

ENDPOINT="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"

echo ""
echo "========================================"
echo "  Backend ready!"
echo "========================================"
echo ""
echo "  Endpoint:  $ENDPOINT"
echo "  Table:     $TABLE_NAME"
echo "  Lambda:    $LAMBDA_NAME"
echo "  API:       $API_NAME ($API_ID)"
echo "  Region:    $REGION"
echo ""
echo "Set this in src/HighScores.js:"
echo "  const API_ENDPOINT = \"${API_ID}.execute-api.${REGION}.amazonaws.com/prod\";"
echo ""
echo "Test it (bash/macOS/Linux):"
echo "  curl -X POST $ENDPOINT/scores -H 'Content-Type: application/json' -d '{\"score\":100,\"scope\":\"30d\",\"ttl\":9999999999,\"datetime\":\"2026-09-04T11:00:00Z\"}'"
echo "  curl $ENDPOINT/scores"
echo ""
echo "Test it (Windows PowerShell -- curl.exe mangles single/double quotes, use curl.exe with a file or Invoke-RestMethod instead):"
echo "  Invoke-RestMethod -Method Post -Uri '$ENDPOINT/scores' -ContentType 'application/json' -Body '{\"score\":100,\"scope\":\"30d\",\"ttl\":9999999999,\"datetime\":\"2026-09-04T11:00:00Z\"}'"
echo "  Invoke-RestMethod -Uri '$ENDPOINT/scores'"
