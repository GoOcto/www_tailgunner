import paper from "paper";
import { beamColor, beamWidth } from "./constants.js";
export class ExplosionEdge {
	constructor(edge) {
		this.center = edge.p1.add(edge.p2).divide(2);
		this.localP1 = edge.p1.subtract(this.center);
		this.localP2 = edge.p2.subtract(this.center);
		this.velocity = new paper.Point({
			length: 5 + Math.random() * 10,
			angle: Math.random() * 360,
		});
		this.angle = 0;
		this.angularVelocity = 20 * Math.random();
		this.age = 0;
		this.duration = 0.65;
		this.initialOpacity = edge.opacity;
		this.path = new paper.Path.Line({
			from: edge.p1,
			to: edge.p2,
			strokeColor: beamColor,
			strokeWidth: beamWidth,
			opacity: edge.opacity,
		});
	}
	update(deltaTime) {
		this.age += deltaTime;
		this.center = this.center.add(this.velocity.multiply(deltaTime));
		this.angle += this.angularVelocity * deltaTime;
		this.path.segments[0].point = this.center.add(this.localP1.rotate(this.angle));
		this.path.segments[1].point = this.center.add(this.localP2.rotate(this.angle));
		this.path.opacity = this.initialOpacity * Math.max(0, 1 - this.age / this.duration);
		if (this.age >= this.duration) {
			this.destroy();
			return true;
		}
		return false;
	}
	destroy() {
		this.path.remove();
	}
}
