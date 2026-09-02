import paper from "paper";
import { beamColor, beamWidth, gameState } from "./constants.js";
import { addVertexDots, styleStroke } from "./VertexHighlight.js";
export class Net {
	constructor() {
		this.group = new paper.Group();
		this.group.visible = false;
	}
	rebuild() {
		this.group.removeChildren();
		const w = paper.view.size.width,
			h = paper.view.size.height,
			cell = w / 3,
			shift = (h - 2 * cell) / 2;
		for (let row = 0; row < 2; row++)
			for (let col = 0; col < 3; col++) {
				const p = new paper.Path({
					strokeColor: beamColor,
					strokeWidth: beamWidth,
					strokeCap: "round",
					strokeJoin: "round",
					opacity: 0.65,
				});
				p.add(new paper.Point(col * cell, shift + row * cell + 0.5 * cell));
				p.add(new paper.Point(col * cell + 0.5 * cell, shift + row * cell));
				p.add(new paper.Point(col * cell + cell, shift + row * cell + 0.5 * cell));
				p.add(new paper.Point(col * cell + 0.5 * cell, shift + row * cell + cell));
				p.add(new paper.Point(col * cell, shift + row * cell + 0.5 * cell));
				styleStroke(p, 0.65);
				this.group.addChild(p);
				addVertexDots(this.group, p.segments.map((s) => s.point));
			}
	}
	show() {
		if (gameState.energy > 0 && gameState.mode !== "demo") {
			this.rebuild();
			this.group.visible = true;
			this.group.bringToFront();
		} else {
			this.group.visible = false;
		}
	}
	hide() {
		this.group.visible = false;
	}
}
