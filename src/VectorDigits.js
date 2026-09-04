import paper from "paper";
import { beamColor, beamWidth, gameState } from "./constants.js";
import { styleStroke, addVertexDots } from "./VertexHighlight.js";

const DIGITS_DATA = {
	0: [ [0, 0], [2, 0], [2, 4], [0, 4], [0, 0]	],
	1: [ [2, 0], [2, 4] ],
	2: [ [0, 0], [2, 0], [2, 2], [0, 2], [0, 4], [2, 4] ],
	3: [ [0, 0], [2, 0], [2, 2], [1, 2], [2, 2], [2, 4], [0, 4] ],
	4: [ [0, 0], [0, 2], [2, 2], [2, 0], [2, 4]	],
	5: [ [2, 0], [0, 0], [0, 2], [2, 2], [2, 4], [0, 4]	],
	6: [ [2, 0], [0, 0], [0, 4], [2, 4], [2, 2], [0, 2]	],
	7: [ [0, 0], [2, 0], [1, 4] ],
	8: [ [0, 0], [2, 0], [2, 4], [0, 4], [0, 0], [0, 2], [2, 2] ],
	9: [ [2, 2], [0, 2], [0, 0], [2, 0], [2, 4]	],
	S: [ [2, 0], [0, 0], [0, 2], [2, 2], [2, 4], [0, 4]	],
	C: [ [2, 0], [0, 0], [0, 4], [2, 4] ],
	O: [ [0, 0], [2, 0], [2, 4], [0, 4], [0, 0] ],
	R: [ [0, 4], [0, 0], [2, 0], [2, 2], [0, 2], [1.5,2], [2, 4] ],
	E: [ [2, 0], [0, 0], [0, 2], [1, 2], [0, 2], [0, 4], [2, 4] ],
	H: [ [2, 0], [2, 4], [2, 2], [0, 2], [0, 0], [0, 4] ],
	I: [ [1, 0], [1, 4] ],
	G: [ [2, 0], [0, 0], [0, 4], [2, 4], [2, 2], [1, 2] ],
	T: [ [0, 0], [2, 0], [1, 0], [1, 4] ],
	A: [ [0, 4], [0, 1], [1, 0], [2, 1], [2, 4], [2, 2], [0, 2] ],
	" ": [],
};

export function renderVectorString(group, str, startX, startY, digitWidth = 20, digitHeight = 40, spacing = 8) {
	const scaleX = digitWidth / 2;
	const scaleY = digitHeight / 4;
	for (let i = 0; i < str.length; i++) {
		const points = DIGITS_DATA[str[i]];
		if (!points) continue;
		const path = new paper.Path({
			strokeColor: beamColor,
			strokeWidth: beamWidth,
			strokeCap: "square",
			strokeJoin: "miter",
		});
		points.forEach((pt) => {
			path.add(
				new paper.Point(startX + i * (digitWidth + spacing) + pt[0] * scaleX, startY + pt[1] * scaleY),
			);
		});
		styleStroke(path);
		group.addChild(path);
		addVertexDots(group, path.segments.map((s) => s.point));
	}
}

export class VectorDigits {
	constructor() {
		this.group = new paper.Group();
		this.rebuild();
	}
	renderString(str, startX, startY, digitWidth = 20, digitHeight = 40, spacing = 8) {
		renderVectorString(this.group, str, startX, startY, digitWidth, digitHeight, spacing);
	}
	rebuild() {
		this.group.removeChildren();
		const viewW = paper.view.size.width;
		const padding = 30;
		const digitW = 18;
		const digitH = 30;
		const spacing = 8;
		const midTop = 6;
		const sideTop = midTop + 2 * spacing + digitH;

		const left = String(gameState.score);
		this.renderString(left, padding, sideTop, digitW, digitH, spacing);

		const center = String(Math.floor(gameState.energy));
		const centerWidth = center.length * digitW + (center.length - 1) * spacing;
		this.renderString(center, (viewW - centerWidth) / 2, midTop, digitW, digitH, spacing);

		const right = String(gameState.ships);
		const rightWidth = right.length * digitW + (right.length - 1) * spacing;
		this.renderString(right, viewW - padding - rightWidth, sideTop, digitW, digitH, spacing);
	}
	rebuildDemo() {
		this.group.removeChildren();
		const viewW = paper.view.size.width;
		const labelW = 14, labelH = 22, labelSpacing = 6;
		const digitW = 18, digitH = 30, digitSpacing = 8;
		const labelTop = 6;
		const numTop = labelTop + labelH + 2 * labelSpacing;
		const quarterW = viewW / 4;

		const leftLabel = "SCORE";
		const leftLabelWidth = leftLabel.length * labelW + (leftLabel.length - 1) * labelSpacing;
		this.renderString(leftLabel, quarterW - leftLabelWidth / 2, labelTop, labelW, labelH, labelSpacing);
		const leftNum = String(gameState.lastScore).padStart(3, "0");
		const leftNumWidth = leftNum.length * digitW + (leftNum.length - 1) * digitSpacing;
		this.renderString(leftNum, quarterW - leftNumWidth / 2, numTop, digitW, digitH, digitSpacing);

		const rightLabel = "HIGH SCORE";
		const rightLabelWidth = rightLabel.length * labelW + (rightLabel.length - 1) * labelSpacing;
		this.renderString(rightLabel, 3 * quarterW - rightLabelWidth / 2, labelTop, labelW, labelH, labelSpacing);
		const rightNum = String(gameState.highScore).padStart(3, "0");
		const rightNumWidth = rightNum.length * digitW + (rightNum.length - 1) * digitSpacing;
		this.renderString(rightNum, 3 * quarterW - rightNumWidth / 2, numTop, digitW, digitH, digitSpacing);
	}
}
