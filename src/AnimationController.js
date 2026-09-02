import paper from "paper";
import { Vehicles } from "./assets.js";
import { gameState } from "./constants.js";
import { DeltaShot } from "./DeltaShot.js";
import { ExplosionEdge } from "./ExplosionEdge.js";
import { Net } from "./Net.js";
import { Reticle } from "./Reticle.js";
import { StarField } from "./StarField.js";
import { VectorDigits } from "./VectorDigits.js";
import { VectorStarfighter } from "./VectorStarfighter.js";

export class AnimationController {
	constructor(canvas) {
		this.canvas = canvas;
		this.starField = new StarField();
		this.starField.create(200);
		this.display = new VectorDigits();
		this.activeShips = [];
		this.spawnQueue = [];
		this.waveTimer = 0;
		this.waveStartShipsN = gameState.ships;
		this.hyperJumpTimer = 0;
		this.baseStarfieldSpeed = this.starField.speed;
		this.net = new Net();
		this.reticle = new Reticle();
		this.activeShots = [];
		this.explosionEdges = [];
		this.reloadTimeSecs = 0.25;
		this.reloadTimer = 0;
		this.startWave();
		window.addEventListener("mousemove", (e) => {
			const r = canvas.getBoundingClientRect(),
				x = paper.view.size.width / r.width,
				y = paper.view.size.height / r.height;
			this.reticle.moveTo(new paper.Point((e.clientX - r.left) * x, (e.clientY - r.top) * y));
		});
		canvas.addEventListener("mouseleave", () => (this.reticle.group.visible = false));
		canvas.addEventListener("mouseenter", () => (this.reticle.group.visible = true));
		canvas.addEventListener("mousedown", () => this.fireWeapon());
	}
	fireWeapon() {
		if (this.reloadTimer > 0) return;
		const w = paper.view.size.width,
			h = paper.view.size.height,
			t = this.reticle.pos;
		this.activeShots.push(new DeltaShot(new paper.Point(0, h), t), new DeltaShot(new paper.Point(w, h), t));
		this.reloadTimer = this.reloadTimeSecs;
	}
	startWave() {
		const speed = Math.random() * 10 + 10,
			model = Vehicles[Math.floor(Math.random() * Vehicles.length)];
		this.waveStartShipsN = gameState.ships;
		this.spawnQueue = [];
		let t = 0;
		for (let i = 0; i < 3; i++) {
			t += 0.03 + 0.1 * Math.random();
			this.spawnQueue.push({ delay: t, speed, model });
		}
		this.waveTimer = 0;
	}
	explodeShip(ship) {
		ship.getExplosionEdges().forEach((e) => this.explosionEdges.push(new ExplosionEdge(e)));
		ship.destroy();
	}
	hitShipAt(point) {
		for (let i = this.activeShips.length - 1; i >= 0; i--) {
			const ship = this.activeShips[i];
			if (ship.containsReticle(point)) {
				const z = Math.min(Math.max(ship.z, 40), 4000);
				gameState.score += Math.round(18.23 * Math.exp(0.000253 * z) - 13.42);
				this.display.rebuild();
				this.explodeShip(ship);
				this.activeShips.splice(i, 1);
				return true;
			}
		}
		return false;
	}
	onFrame(event) {
		if (this.hyperJumpTimer > 0) {
			this.hyperJumpTimer = Math.max(0, this.hyperJumpTimer - event.delta);
			if (this.hyperJumpTimer === 0) {
				this.starField.speed = this.baseStarfieldSpeed;
				this.startWave();
			}
		}
		this.starField.update();
		this.waveTimer += event.delta;
		let displayFlag = false;
		if (this.net.group.visible) {
			gameState.energy -= 5 / 60;
			displayFlag = true;
		}
		for (let i = this.spawnQueue.length - 1; i >= 0; i--)
			if (this.waveTimer >= this.spawnQueue[i].delay) {
				const q = this.spawnQueue.splice(i, 1)[0];
				this.activeShips.push(new VectorStarfighter(q.model, 25, q.speed));
			}
		for (let i = this.activeShips.length - 1; i >= 0; i--) {
			const ship = this.activeShips[i];
			ship.update(event.delta);
			if (ship.justPassedCamera) {
				if (this.net.group.visible) ship.startRebound();
				else if (!ship.counted) {
					gameState.ships++;
					ship.counted = true;
					displayFlag = true;
				}
			}
			if ((ship.rebound && ship.rebound.age >= ship.rebound.duration) || (!ship.rebound && ship.z < -400)) {
				ship.destroy();
				this.activeShips.splice(i, 1);
			}
		}
		if (displayFlag) this.display.rebuild();
		if (this.hyperJumpTimer === 0 && this.activeShips.length === 0 && this.spawnQueue.length === 0) {
			if (gameState.ships > this.waveStartShipsN) {
				this.hyperJumpTimer = 2;
				this.starField.speed = this.baseStarfieldSpeed * 5;
			} else this.startWave();
		}
		if (this.reloadTimer > 0) this.reloadTimer = Math.max(0, this.reloadTimer - event.delta);
		for (let i = this.activeShots.length - 1; i >= 0; i--) {
			const s = this.activeShots[i];
			if (s.update(event.delta)) {
				this.hitShipAt(s.targetScreenPoint);
				s.destroy();
				this.activeShots.splice(i, 1);
			}
		}
		for (let i = this.explosionEdges.length - 1; i >= 0; i--)
			if (this.explosionEdges[i].update(event.delta)) this.explosionEdges.splice(i, 1);
	}
	onResize() {
		if (this.net.group.visible) this.net.rebuild();
		this.reticle.rebuild();
	}
}
