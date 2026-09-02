import paper from "paper";
import { beamColor } from "./constants.js";
export class Reticle {
	constructor() {
		this.group = new paper.Group();
		this.pos = paper.view.center.clone();
		this.rebuild();
	}
	rebuild() {
		this.group.removeChildren();
		const c = this.pos,
			color = new paper.Color(beamColor);
		const axes = new paper.CompoundPath({
			children: [
				new paper.Path.Line(c.add([0, -30]), c.add([0, 30])),
				new paper.Path.Line(c.add([-30, 0]), c.add([30, 0])),
			],
			strokeColor: color,
			strokeWidth: 1,
		});
		const ticks = [];
		[
			{ pos: 10, len: 12 },
			{ pos: 20, len: 24 },
		].forEach((t) =>
			[1, -1].forEach((d) => {
				ticks.push(new paper.Path.Line(c.add([-t.len / 2, t.pos * d]), c.add([t.len / 2, t.pos * d])));
				ticks.push(new paper.Path.Line(c.add([t.pos * d, -t.len / 2]), c.add([t.pos * d, t.len / 2])));
			}),
		);
		this.group.addChildren([axes, new paper.CompoundPath({ children: ticks, strokeColor: color, strokeWidth: 1 })]);
	}
	moveTo(point) {
		this.pos = point.clone();
		this.group.position = point;
	}
}
