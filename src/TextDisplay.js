import paper from "paper";
import { beamColor, beamWidth, gameState } from "./constants.js";
import { addVertexDots, styleStroke } from "./VertexHighlight.js";

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
	M: [ [0, 4], [0, 0], [1, 2], [2, 0], [2, 4] ],
	V: [ [0, 0], [1, 4], [2, 0] ],
	D: [ [0, 4], [0, 0], [1, 0], [2, 1], [2, 3], [1, 4], [0, 4] ],
	L: [ [0, 0], [0, 4], [2, 4] ],
	Y: [ [0, 0], [1, 2], [2, 0], [1, 2], [1, 4] ],
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

export class TextDisplay {
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

		const center = String(Math.ceil(gameState.energy));
		const centerWidth = center.length * digitW + (center.length - 1) * spacing;
		this.renderString(center, (viewW - centerWidth) / 2, midTop, digitW, digitH, spacing);

		const right = String(gameState.ships);
		const rightWidth = right.length * digitW + (right.length - 1) * spacing;
		this.renderString(right, viewW - padding - rightWidth, sideTop, digitW, digitH, spacing);
	}
	rebuildDemo(scores = {}) {
		this.group.removeChildren();
		const viewW = paper.view.size.width;

		const labelW = 14, labelH = 22, labelSpacing = 6;
		const miniW = 6, miniH = 12, miniSpacing = 4;
		const digitW = 18, digitH = 30, digitSpacing = 8;

		const labelTop = 10;
		const numTop = labelTop + labelH + 2*labelSpacing;
		const miniTop = numTop + (digitH-miniH);

		const score30d  = Number(scores["30d"]) || 0;
		const scoreever = Number(scores["ever"]) || 0;
		
		const columns = [
			{ label: "SCORE", mini: "", value: gameState.lastScore, center: viewW / 6 },
			{ label: "HIGH SCORE", mini: "ALL TIME", value: scoreever, center: viewW / 2 },
			{ label: "HIGH SCORE", mini: "30 DAY", value: score30d, center: (5 * viewW) / 6 },
		];
		for (const col of columns) {
			const labelWidth = col.label.length * labelW + (col.label.length - 1) * labelSpacing;
			this.renderString(col.label, col.center - labelWidth/2, labelTop, labelW, labelH, labelSpacing);

			const num = String(col.value).padStart(3, "0");
			const numWidth = num.length * digitW + (num.length - 1) * digitSpacing;
			this.renderString(num, col.center - numWidth/2, numTop, digitW, digitH, digitSpacing);

			const miniWidth = col.mini.length * miniW + (col.mini.length - 1) * miniSpacing;
			this.renderString(col.mini, col.center + numWidth/2 + 2*miniW, miniTop, miniW, miniH, miniSpacing);
		}
	}
}
