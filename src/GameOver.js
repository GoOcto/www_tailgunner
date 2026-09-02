import paper from "paper";
import { beamColor, beamWidth } from "./constants.js";
import { renderVectorString } from "./VectorDigits.js";
import { addVertexDots, styleStroke } from "./VertexHighlight.js";

export class GameOver {
	constructor() {
		this.group = new paper.Group();
		this.group.visible = false;
		this.rebuild();
	}
	rebuild() {
		this.group.removeChildren();
		const c = paper.view.center;
		const width = 330, height = 100;
		const bounds = new paper.Rectangle(c.x - width / 2, c.y - height / 2, width, height);
		const box = new paper.Path.Rectangle({
			rectangle: bounds,
			strokeColor: beamColor,
			strokeWidth: beamWidth,
		});
		styleStroke(box);
		this.group.addChild(box);
		addVertexDots(this.group, box.segments.map((segment) => segment.point));

		const label = "GAME OVER";
		const digitW = 22, digitH = 40, spacing = 10;
		const labelWidth = label.length * digitW + (label.length - 1) * spacing;
		renderVectorString(this.group, label, c.x - labelWidth / 2, c.y - digitH / 2, digitW, digitH, spacing);
	}
	show() {
		this.rebuild();
		this.group.visible = true;
		this.group.bringToFront();
	}
	hide() {
		this.group.visible = false;
	}
}
