import paper from "paper";
import { beamColor, gameState } from "./constants.js";

const DIGITS_DATA = {
	0: [ [0, 0], [2, 0], [2, 4], [0, 4], [0, 0]	],
	1: [ [2, 0], [2, 4] ],
	2: [ [0, 0], [2, 0], [2, 2], [0, 2], [0, 4], [2, 4] ],
	3: [ [0, 0], [2, 0], [2, 2], [0, 2], [2, 2], [2, 4], [0, 4] ],
	4: [ [0, 0], [0, 2], [2, 2], [2, 0], [2, 4]	],
	5: [ [2, 0], [0, 0], [0, 2], [2, 2], [2, 4], [0, 4]	],
	6: [ [2, 0], [0, 0], [0, 4], [2, 4], [2, 2], [0, 2]	],
	7: [ [0, 0], [2, 0], [2, 4] ],
	8: [ [0, 0], [2, 0], [2, 4], [0, 4], [0, 0], [0, 2], [2, 2] ],
	9: [ [2, 2], [0, 2], [0, 0], [2, 0], [2, 4]	],
};

export class VectorDigits {
	constructor() {
		this.group = new paper.Group();
		this.rebuild();
	}
	renderString(str, startX, startY, digitWidth = 20, digitHeight = 40, spacing = 8) {
		const scaleX = digitWidth / 2;
		const scaleY = digitHeight / 4;
		for (let i = 0; i < str.length; i++) {
			const points = DIGITS_DATA[str[i]];
			if (!points) continue;
			const path = new paper.Path({
				strokeColor: beamColor,
				strokeWidth: 1,
				strokeCap: "square",
				strokeJoin: "miter",
			});
			points.forEach((pt) => {
				path.add(
					new paper.Point(startX + i * (digitWidth + spacing) + pt[0] * scaleX, startY + pt[1] * scaleY),
				);
			});
			this.group.addChild(path);
		}
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
}
