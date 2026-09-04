import paper from "paper";
import { beamColor, beamWidth } from "./constants.js";
import { renderVectorString } from "./VectorDigits.js";
import { styleStroke, addVertexDots } from "./VertexHighlight.js";

const TIMEOUT_SECS = 60;
const FADE_SECS = 1;

export class StartButton {
	constructor() {
		this.group = new paper.Group();
		this.group.visible = false;
		this.timer = 0;
		this.hover = false;
		this.rebuild();
	}
	rebuild() {
		this.group.removeChildren();
		const c = paper.view.center;
		const w1 = 230, h1 =100;
		const w2 = 220, h2 = 90;
		this.bounds = new paper.Rectangle(c.x - w1 / 2, c.y - h1 / 2, w1, h1);
		this.inner  = new paper.Rectangle(c.x - w2 / 2, c.y - h2 / 2, w2, h2);
		const box = new paper.Path.Rectangle({
			rectangle: this.bounds,
			strokeColor: beamColor,
			strokeWidth: beamWidth,
		});
		styleStroke(box);
		this.group.addChild(box);
		addVertexDots(this.group, box.segments.map((s) => s.point));

		if (this.hover) {
			const bzl = new paper.Path.Rectangle({
				rectangle: this.inner,
				strokeColor: beamColor,
				strokeWidth: beamWidth,
			});
			styleStroke(bzl);
			this.group.addChild(bzl);
			addVertexDots(this.group, bzl.segments.map((s) => s.point));
		}

		const label = "START";
		const digitW = 22, digitH = 40, spacing = 10;
		const labelWidth = label.length * digitW + (label.length - 1) * spacing;
		renderVectorString(this.group, label, c.x - labelWidth / 2, c.y - digitH / 2, digitW, digitH, spacing);
	}
	show() {
		this.hover = false;
		this.rebuild();
		this.timer = TIMEOUT_SECS;
		this.group.visible = true;
		this.group.opacity = 1;
		this.group.bringToFront();
	}
	hide() {
		this.group.visible = false;
		this.hover = false;
	}
	update(delta) {
		if (!this.group.visible) return false;
		this.timer -= delta;
		if (this.timer <= FADE_SECS) this.group.opacity = Math.max(0, this.timer / FADE_SECS);
		if (this.timer <= 0) {
			this.hide();
			return true;
		}
		return false;
	}
	containsPoint(point) {
		return this.group.visible && this.bounds.contains(point);
	}
	setHover(point) {
		const hover = this.group.visible && this.bounds.contains(point);
		if (hover !== this.hover) {
			this.hover = hover;
			this.rebuild();
		}
	}
}
