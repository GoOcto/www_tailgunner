import paper from "paper";
import { beamColor, beamWidth } from "./constants.js";
import { styleStroke, addVertexDots, updateVertexDots } from "./VertexHighlight.js";
export class DeltaShot {
	constructor(startScreenPoint, targetScreenPoint) {
		const cx = paper.view.size.width / 2,
			cy = paper.view.size.height / 2,
			depth = 2000;
		this.fov = 300;
		this.targetScreenPoint = targetScreenPoint.clone();
		this.start3D = { x: startScreenPoint.x - cx, y: startScreenPoint.y - cy, z: 0 };
		const s = this.fov / (this.fov + depth);
		this.target3D = { x: (targetScreenPoint.x - cx) / s, y: (targetScreenPoint.y - cy) / s, z: depth };
		this.progress = 0;
		this.duration = 0.25;
		this.size = 40;
		this.localVertices = [
			{ x: 0, y: 0, z: 4 },
			{ x: -0.5, y: 0, z: -0.6 },
			{ x: 0, y: 0, z: 1 },
			{ x: 0.5, y: 0, z: -0.6 },
		];
		this.path = new paper.Path({ strokeColor: new paper.Color(beamColor), strokeWidth: beamWidth, closed: true });
		styleStroke(this.path);
		this.vertexGroup = new paper.Group();
		this.vertexDots = addVertexDots(this.vertexGroup, this.localVertices.map(() => paper.view.center));
		this.rebuild();
	}
	rebuild() {
		const cx = paper.view.size.width / 2,
			cy = paper.view.size.height / 2,
			t = this.progress,
			f = this.fov;
		const p = (a, b) => a + (b - a) * t,
			x = p(this.start3D.x, this.target3D.x),
			y = p(this.start3D.y, this.target3D.y),
			z = p(this.start3D.z, this.target3D.z);
		let fx = this.target3D.x - this.start3D.x,
			fy = this.target3D.y - this.start3D.y,
			fz = this.target3D.z - this.start3D.z,
			l = Math.sqrt(fx * fx + fy * fy + fz * fz) || 1;
		fx /= l;
		fy /= l;
		fz /= l;
		let xx = fz,
			xy = 0,
			xz = -fx,
			xl = Math.sqrt(xx * xx + xz * xz);
		if (xl < 1e-6) {
			xx = 1;
			xy = 0;
			xz = 0;
			xl = 1;
		}
		xx /= xl;
		xz /= xl;
		const yx = fy * xz - fz * xy,
			yy = fz * xx - fx * xz,
			yz = fx * xy - fy * xx;
		const project = (v) => {
			const wx = x + (v.x * xx + v.y * yx + v.z * fx) * this.size,
				wy = y + (v.x * xy + v.y * yy + v.z * fy) * this.size,
				wz = z + (v.x * xz + v.y * yz + v.z * fz) * this.size,
				s = f / (f + wz);
			return new paper.Point(cx + wx * s, cy + wy * s);
		};
		this.path.removeSegments();
		this.localVertices.forEach((v) => this.path.add(project(v)));
		this.path.closed = true;
		updateVertexDots(this.vertexDots, this.path.segments.map((seg) => seg.point));
	}
	update(deltaTime) {
		this.progress += deltaTime / this.duration;
		if (this.progress >= 1) {
			this.progress = 1;
			this.rebuild();
			return true;
		}
		this.rebuild();
		return false;
	}
	destroy() {
		this.path.remove();
		this.vertexGroup.remove();
	}
}
