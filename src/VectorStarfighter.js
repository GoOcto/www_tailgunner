import paper from "paper";
import { beamColor, beamWidth } from "./constants.js";
import { addVertexDots, setVertexDotsOpacity, setVertexDotsVisible, styleStroke, updateVertexDots } from "./VertexHighlight.js";

const FORWARD_BIAS_START_Z = 4000;
const FORWARD_BIAS_FULL_Z = 200;
const MAX_FORWARD_BIAS = 120;

export class VectorStarfighter {
	constructor(modelData, scale, waveSpeed = null) {
		this.vertices = modelData.vertices.map((v) => ({ x: v.x, y: v.y, z: v.z }));
		this.edges = modelData.edges;
		this.scale = scale;
		this.lines = [];
		this.vertexGroup = new paper.Group();
		this.vertexDots = [];
		this.visibleEdges = [];
		this.projectedBounds = null;
		this.time = 5 * Math.random();
		this.edges.forEach(() => {
			this.lines.push(new paper.Path.Line({ strokeColor: beamColor, strokeWidth: beamWidth }));
			this.vertexDots.push(addVertexDots(this.vertexGroup, [paper.view.center, paper.view.center]));
		});
		this.spiralSpeed = Math.random() * 0.5 + 0.6;
		if (Math.random() < 0.5) this.spiralSpeed *= -1;
		this.zSpeed = waveSpeed !== null ? waveSpeed : Math.random() * 10 + 10;
		this.z = 4000;
		this.pinchZ = 1000 + (Math.random() - 0.5) * 500;
		this.minRadius = Math.random() * 150 + 50;
		this.spread = 800 + 800 * Math.random();
		this.centerX = (Math.random() - 0.5) * 500;
		this.centerY = (Math.random() - 0.5) * 500;
		this.isPassingThreshold = false;
		this.counted = false;
		this.rebound = null;
	}
	destroy() {
		this.lines.forEach((line) => line.remove());
		this.vertexGroup.remove();
	}
	containsReticle(point, padding = 24) {
		const b = this.projectedBounds;
		return (
			!!b &&
			point.x >= b.minX - padding &&
			point.x <= b.maxX + padding &&
			point.y >= b.minY - padding &&
			point.y <= b.maxY + padding
		);
	}
	getExplosionEdges() {
		return this.visibleEdges.map((e) => ({ p1: e.p1.clone(), p2: e.p2.clone(), opacity: e.opacity }));
	}
	startRebound() {
		if (this.rebound) return;
		this.rebound = {
			age: 0,
			duration: 2,
			speed: this.zSpeed,
			rotation: {
				x: (Math.random() - 0.5) * 0.6,
				y: (Math.random() - 0.5) * 0.6,
				z: (Math.random() - 0.5) * 0.6,
			},
			spin: { x: (Math.random() - 0.5) * 2.5, y: (Math.random() - 0.5) * 2.5, z: (Math.random() - 0.5) * 2.5 },
		};
	}
	update(deltaTime) {
		this.time += deltaTime;
		this.isPassingThreshold = false;
		const cx = paper.view.size.width / 2,
			cy = paper.view.size.height / 2,
			fov = 300,
			previousZ = this.z,
			frameScale = deltaTime * 60;
		if (this.rebound) {
			this.rebound.age += deltaTime;
			["x", "y", "z"].forEach((axis) => {
				this.rebound.rotation[axis] += this.rebound.spin[axis] * deltaTime;
			});
			this.z += this.rebound.speed * frameScale;
		} else {
			this.z -= this.zSpeed * frameScale;
			this.isPassingThreshold = previousZ > 125 && this.z <= 125;
		}
		const radius = (z) => ((z - this.pinchZ) / 1000) ** 2 * this.spread + this.minRadius;
		let nextX, nextY, nextZ;
		if (this.rebound) {
			nextX = this.x;
			nextY = this.y;
			nextZ = this.z + this.rebound.speed * frameScale;
		} else {
			const spiral = this.spiralSpeed * 0.5 ** (this.z / 4000),
				r = radius(this.z);
			this.x = this.centerX + Math.cos(this.time * spiral) * r;
			this.y = this.centerY + Math.sin(this.time * spiral) * r;
			nextZ = this.z - this.zSpeed * frameScale;
			const nr = radius(nextZ),
				nt = this.time + deltaTime;
			nextX = this.centerX + Math.cos(nt * spiral) * nr;
			nextY = this.centerY + Math.sin(nt * spiral) * nr;
		}
		const dx = nextX - this.x,
			dy = nextY - this.y,
			forwardBias = Math.max(0, Math.min(1, (FORWARD_BIAS_START_Z - this.z) / (FORWARD_BIAS_START_Z - FORWARD_BIAS_FULL_Z))) ** 2 * MAX_FORWARD_BIAS * frameScale,
			dz = this.rebound ? nextZ - this.z : nextZ - this.z - forwardBias;
		const len = Math.sqrt(dx * dx + dy * dy + dz * dz),
			fx = dx / len,
			fy = dy / len,
			fz = dz / len;
		const zx = -fx,
			zy = -fy,
			zz = -fz;
		let xx = zz,
			xy = 0,
			xz = -zx,
			xlen = Math.sqrt(xx * xx + xz * xz);
		if (xlen > 0) {
			xx /= xlen;
			xz /= xlen;
		} else {
			xx = 1;
			xz = 0;
		}
		const yx = zy * xz - zz * xy,
			yy = zz * xx - zx * xz,
			yz = zx * xy - zy * xx;
		this.visibleEdges = [];
		this.projectedBounds = null;
		const addBounds = (p) => {
			if (!this.projectedBounds) this.projectedBounds = { minX: p.x, minY: p.y, maxX: p.x, maxY: p.y };
			else {
				const b = this.projectedBounds;
				b.minX = Math.min(b.minX, p.x);
				b.minY = Math.min(b.minY, p.y);
				b.maxX = Math.max(b.maxX, p.x);
				b.maxY = Math.max(b.maxY, p.y);
			}
		};
		this.edges.forEach((edge, index) => {
			const rotate = (v) => {
				let r = v;
				if (this.rebound) {
					const { x: rx, y: ry, z: rz } = this.rebound.rotation,
						cx = Math.cos(rx),
						sx = Math.sin(rx),
						cy = Math.cos(ry),
						sy = Math.sin(ry),
						cz = Math.cos(rz),
						sz = Math.sin(rz);
					const x1 = r.x,
						y1 = r.y * cx - r.z * sx,
						z1 = r.y * sx + r.z * cx,
						x2 = x1 * cy + z1 * sy,
						z2 = -x1 * sy + z1 * cy;
					r = { x: x2 * cz - y1 * sz, y: x2 * sz + y1 * cz, z: z2 };
				}
				return {
					x: r.x * xx + r.y * yx + r.z * zx,
					y: r.x * xy + r.y * yy + r.z * zy,
					z: r.x * xz + r.y * yz + r.z * zz,
				};
			};
			const project = (v) => {
				const wx = this.x + v.x * this.scale,
					wy = this.y + v.y * this.scale,
					wz = this.z + v.z * this.scale;
				if (wz <= -fov + 10) return null;
				const s = fov / (fov + wz);
				return new paper.Point(cx + wx * s, cy + wy * s);
			};
			const p1 = project(rotate(this.vertices[edge[0]])),
				p2 = project(rotate(this.vertices[edge[1]]));
			if (p1 && p2) {
				this.lines[index].visible = true;
				this.lines[index].segments[0].point = p1;
				this.lines[index].segments[1].point = p2;
				const opacity = this.rebound
					? Math.max(0, 1 - this.rebound.age / this.rebound.duration)
					: Math.max(0.1, 1 - this.z / 5000);
				styleStroke(this.lines[index], opacity);
				this.visibleEdges.push({ p1, p2, opacity });
				addBounds(p1);
				addBounds(p2);
				updateVertexDots(this.vertexDots[index], [p1, p2]);
				setVertexDotsVisible(this.vertexDots[index], true);
				setVertexDotsOpacity(this.vertexDots[index], opacity);
			} else {
				this.lines[index].visible = false;
				setVertexDotsVisible(this.vertexDots[index], false);
			}
		});
	}
}
