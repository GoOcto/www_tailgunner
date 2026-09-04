
// Backend contract (AWS API Gateway -> Lambda -> DynamoDB):
//   POST /scores { score, scope: "30d", ttl }  -- expires via DynamoDB TTL after 30 days
//   POST /scores { score, scope: "alltime" }   -- no TTL, never expires
//   GET  /scores -> { "30d": number, "ever": number }  (max over each scope)
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const API_URL = API_ENDPOINT ? `https://${API_ENDPOINT}` : "";

const THIRTY_DAYS_SECS = 30 * 24 * 60 * 60;
const THIRTY_DAYS_MS = THIRTY_DAYS_SECS * 1000;
const KEY_30D = "tailgunner.hs_30d";
const KEY_EVER = "tailgunner.hs_ever";

// Local 30-day entry mirrors the backend TTL: stored as { s, t } and expired
// 30 days after it was set.
function readLocal30d() {
  try {
    const entry = JSON.parse(localStorage.getItem(KEY_30D) || "null");
    if (entry && typeof entry.s === "number" && Date.now() - entry.t < THIRTY_DAYS_MS) return entry.s;
  } catch {
    // corrupted entry, treat as no score
  }
  return 0;
}

function readLocalEver() {
  return parseInt(localStorage.getItem(KEY_EVER) || "0", 10);
}

export async function saveHighScore(score) {
  if (typeof score !== "number" || score <= 0) return;

  // 1. Fallback / local storage caching
  if (score > readLocal30d()) localStorage.setItem(KEY_30D, JSON.stringify({ s: score, t: Date.now() }));
  if (score > readLocalEver()) localStorage.setItem(KEY_EVER, score.toString());

  // 2. Post to AWS API Gateway: one TTL'd 30-day record, one permanent all-time record
  if (API_URL) {
	console.log('Saving score to cloud');
    const ttl = Math.floor(Date.now() / 1000) + THIRTY_DAYS_SECS;
    try {
      await fetch(`${API_URL}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, scope: "30d", ttl })
      });
      await fetch(`${API_URL}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, scope: "alltime" })
      });
    } catch (err) {
      console.warn("Could not save high score to backend, using local fallback:", err);
    }
  }
}

export async function retrieveHighScores() {
  const result = {
    "30d": readLocal30d(),
    "ever": readLocalEver()
  };

  if (API_URL) {
    try {
      const response = await fetch(`${API_URL}/scores`);
      if (response.ok) {
        const data = await response.json();
        // Expecting API payload like: { "30d": 1200, "ever": 4500 }
        if (typeof data["30d"] === "number") result["30d"] = data["30d"];
        if (typeof data["ever"] === "number") result["ever"] = data["ever"];
      }
    } catch (err) {
      console.warn("Could not retrieve high scores from backend, using local fallback:", err);
    }
  }

  return result;
}