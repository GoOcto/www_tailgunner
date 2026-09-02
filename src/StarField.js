import paper from "paper";
import { beamColor } from "./constants.js";
export class StarField {
	constructor() {
		this.stars = [];
		this.maxDistance = 5000;
		this.fov = 300;
		this.speed = 40;
	}
	create(count) {
		for (let i = 0; i < count; i++) {
			this.stars.push(this.spawnStar(true));
		}
	}
	spawnStar(randomZ = false) {
		const minRadius = Math.max(paper.view.size.width, paper.view.size.height);
		const maxRadius = minRadius * 4;
		const r = Math.sqrt(Math.random()) * (maxRadius - minRadius) + minRadius;
		const theta = Math.random() * Math.PI * 2;
		const shape = new paper.Path.Circle({ center: new paper.Point(-1000, -1000), radius: 1, fillColor: beamColor });
		return {
			x: r * Math.cos(theta),
			y: r * Math.sin(theta),
			z: randomZ ? Math.random() * this.maxDistance : 0,
			baseRadius: Math.random() * 10 + 2.5,
			shape,
		};
	}
	update() {
		const cx = paper.view.size.width * 0.5;
		const cy = paper.view.size.height * 0.5;
		for (let i = 0; i < this.stars.length; i++) {
			let star = this.stars[i];
			star.z += this.speed;
			if (star.z > this.maxDistance) {
				star.shape.remove();
				this.stars[i] = this.spawnStar(false);
				star = this.stars[i];
			}
			const scale = this.fov / (this.fov + star.z);
			const sx = cx + star.x * scale;
			const sy = cy + star.y * scale;
			const radius = Math.max(0.1, star.baseRadius * scale);
			star.shape.bounds = new paper.Rectangle(sx - radius, sy - radius, radius * 2, radius * 2);
			star.shape.opacity = 1 - star.z / this.maxDistance;
		}
	}
}
