import paper from "paper";
import { Vehicles } from "./assets.js";
import { gameState, saveHighScore } from "./constants.js";
import { DeltaShot } from "./DeltaShot.js";
import { ExplosionEdge } from "./ExplosionEdge.js";
import { Net } from "./Net.js";
import { Reticle } from "./Reticle.js";
import { StarField } from "./StarField.js";
import { StartButton } from "./StartButton.js";
import { VectorDigits } from "./VectorDigits.js";
import { VectorStarfighter } from "./VectorStarfighter.js";

const SHIPS_PER_ROUND = 10;
const DEMO_SHOT_MIN_INTERVAL = 0.6;
const DEMO_SHOT_MAX_INTERVAL = 2.2;
const POST_GAME_CLICK_LOCKOUT_SECS = 10;
const DEMO_TARGET_MARGIN = 0.1; // demo shots never target outside the inner 80% of the screen
const DEMO_AIM_MAX_SECS = 1.2;
const DEMO_AIM_EASE_RATE = 8;
const DEMO_AIM_ARRIVAL_DIST = 4;

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
		this.startButton = new StartButton();
		this.demoShotTimer = this.nextDemoShotDelay();
		this.demoAimTarget = null;
		this.demoAimTimer = 0;
		this.clickLockoutTimer = 0;
		this.isFiring = false;
		this.enterDemoMode();
		this.startWave();
		window.addEventListener("mousemove", (e) => {
			if (this.mode !== "game" && !this.startButton.group.visible) return;
			const r = canvas.getBoundingClientRect(),
				x = paper.view.size.width / r.width,
				y = paper.view.size.height / r.height,
				point = new paper.Point((e.clientX - r.left) * x, (e.clientY - r.top) * y);
			this.reticle.moveTo(point);
			if (this.startButton.group.visible) this.startButton.setHover(point);
		});
		canvas.addEventListener("mouseleave", () => {
			if (this.mode === "game" || this.startButton.group.visible) this.reticle.group.visible = false;
		});
		canvas.addEventListener("mouseenter", () => {
			if (this.mode === "game" || this.startButton.group.visible) this.reticle.group.visible = true;
		});
		canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
		canvas.addEventListener("mouseup", (e) => this.onMouseUp(e));
		window.addEventListener("mouseup", (e) => {
			if (e.button === 0) this.isFiring = false;
		});
		canvas.addEventListener("contextmenu", (e) => e.preventDefault());
	}
	nextDemoShotDelay() {
		return DEMO_SHOT_MIN_INTERVAL + Math.random() * (DEMO_SHOT_MAX_INTERVAL - DEMO_SHOT_MIN_INTERVAL);
	}
	onMouseDown(e) {
		if (this.mode === "game") {
			if (e.button === 2) this.net.show();
			else {
				this.isFiring = true;
				this.fireWeapon();
			}
			return;
		}
		if (this.clickLockoutTimer > 0) return;
		const r = this.canvas.getBoundingClientRect(),
			x = paper.view.size.width / r.width,
			y = paper.view.size.height / r.height,
			point = new paper.Point((e.clientX - r.left) * x, (e.clientY - r.top) * y);
		if (this.startButton.containsPoint(point)) this.startGame();
		else if (!this.startButton.group.visible) {
			this.demoAimTarget = null;
			this.startButton.show();
			this.reticle.moveTo(point);
			this.reticle.group.visible = true;
			this.canvas.style.cursor = "none";
		}
	}
	onMouseUp(e) {
		if (this.mode === "game" && e.button === 2) this.net.hide();
		if (e.button === 0) this.isFiring = false;
	}
	enterDemoMode() {
		this.mode = "demo";
		this.canvas.style.cursor = "default";
		this.isFiring = false;
		this.demoAimTarget = null;
		this.demoAimTimer = 0;
		this.demoShotTimer = this.nextDemoShotDelay();
		this.reticle.group.visible = true;
		this.startButton.hide();
		this.display.rebuildDemo();
	}
	startGame() {
		gameState.score = 0;
		gameState.ships = 0;
		gameState.energy = 80;
		this.canvas.style.cursor = "";
		this.mode = "game";
		this.startButton.hide();
		this.reticle.moveTo(paper.view.center);
		this.reticle.group.visible = true;
		this.clearActiveEntities();
		this.display.rebuild();
		this.startWave();
	}
	clearActiveEntities() {
		this.activeShips.forEach((ship) => ship.destroy());
		this.activeShips = [];
		this.spawnQueue = [];
		this.activeShots.forEach((shot) => shot.destroy());
		this.activeShots = [];
		this.explosionEdges.forEach((edge) => edge.destroy());
		this.explosionEdges = [];
		this.hyperJumpTimer = 0;
		this.starField.speed = this.baseStarfieldSpeed;
		this.net.hide();
	}
	endGameRound() {
		gameState.lastScore = gameState.score;
		gameState.highScore = Math.max(gameState.highScore, gameState.score);
		saveHighScore();
		this.enterDemoMode();
		this.clickLockoutTimer = POST_GAME_CLICK_LOCKOUT_SECS;
	}
	fireWeapon() {
		if (this.reloadTimer > 0) return;
		const w = paper.view.size.width,
			h = paper.view.size.height,
			t = this.reticle.pos;
		this.activeShots.push(new DeltaShot(new paper.Point(0, h), t), new DeltaShot(new paper.Point(w, h), t));
		this.reloadTimer = this.reloadTimeSecs;
	}
	demoTargetableShipCenter(ship) {
		if (!ship.projectedBounds) return null;
		const b = ship.projectedBounds,
			center = new paper.Point((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2),
			w = paper.view.size.width,
			h = paper.view.size.height,
			minX = w * DEMO_TARGET_MARGIN,
			maxX = w * (1 - DEMO_TARGET_MARGIN),
			minY = h * DEMO_TARGET_MARGIN,
			maxY = h * (1 - DEMO_TARGET_MARGIN);
		if (center.x < minX || center.x > maxX || center.y < minY || center.y > maxY) return null;
		return center;
	}
	pickDemoTarget() {
		const candidates = this.activeShips.filter((ship) => this.demoTargetableShipCenter(ship));
		if (candidates.length === 0) return null;
		return candidates[Math.floor(Math.random() * candidates.length)];
	}
	fireDemoShot(target) {
		const w = paper.view.size.width,
			h = paper.view.size.height;
		this.activeShots.push(new DeltaShot(new paper.Point(0, h), target), new DeltaShot(new paper.Point(w, h), target));
	}
	updateDemoAim(delta) {
		if (this.demoAimTarget) {
			const center = this.demoTargetableShipCenter(this.demoAimTarget);
			if (!center || !this.activeShips.includes(this.demoAimTarget)) {
				// target became invalid (destroyed or left the safe zone); resume waiting
				this.demoAimTarget = null;
				this.demoShotTimer = this.nextDemoShotDelay();
				return;
			}
			this.demoAimTimer += delta;
			const t = Math.min(1, delta * DEMO_AIM_EASE_RATE),
				pos = this.reticle.pos,
				next = new paper.Point(pos.x + (center.x - pos.x) * t, pos.y + (center.y - pos.y) * t);
			this.reticle.moveTo(next);
			const arrived = next.getDistance(center) <= DEMO_AIM_ARRIVAL_DIST;
			if (arrived || this.demoAimTimer >= DEMO_AIM_MAX_SECS) {
				this.reticle.moveTo(center);
				this.fireDemoShot(center);
				this.demoAimTarget = null;
				this.demoShotTimer = this.nextDemoShotDelay();
			}
			return;
		}
		this.demoShotTimer -= delta;
		if (this.demoShotTimer <= 0) {
			const ship = this.pickDemoTarget();
			if (ship) {
				this.demoAimTarget = ship;
				this.demoAimTimer = 0;
			} else this.demoShotTimer = this.nextDemoShotDelay();
		}
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
	hitShipAt(point, scores = true) {
		for (let i = this.activeShips.length - 1; i >= 0; i--) {
			const ship = this.activeShips[i];
			if (ship.containsReticle(point)) {
				if (scores) {
					const z = Math.min(Math.max(ship.z, 40), 4000);
					gameState.score += Math.round(18.23 * Math.exp(0.000253 * z) - 13.42);
					this.display.rebuild();
				}
				this.explodeShip(ship);
				this.activeShips.splice(i, 1);
				return true;
			}
		}
		return false;
	}
	onFrame(event) {
		if (this.mode === "demo") {
			if (this.clickLockoutTimer > 0) this.clickLockoutTimer = Math.max(0, this.clickLockoutTimer - event.delta);
			if (this.startButton.update(event.delta)) {
				// button just timed out and hid itself; demo shooting resumes
				this.demoAimTarget = null;
				this.demoShotTimer = this.nextDemoShotDelay();
				this.canvas.style.cursor = "default";
			}
			if (!this.startButton.group.visible) this.updateDemoAim(event.delta);
		}
		if (this.hyperJumpTimer > 0) {
			this.hyperJumpTimer = Math.max(0, this.hyperJumpTimer - event.delta);
			if (this.hyperJumpTimer === 0) {
				this.starField.speed = this.baseStarfieldSpeed;
				if (this.mode === "game" && gameState.ships >= SHIPS_PER_ROUND) this.endGameRound();
				else this.startWave();
			}
		}
		this.starField.update();
		this.waveTimer += event.delta;
		let displayFlag = false;
		if (this.mode === "game" && this.net.group.visible) {
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
			if (ship.isPassingThreshold) {
				if (this.mode === "game" && this.net.group.visible) ship.startRebound();
				else if (!ship.counted) {
					ship.counted = true;
					if (this.mode === "game") {
						gameState.ships++;
						displayFlag = true;
					}
				}
			}
			if ((ship.rebound && ship.rebound.age >= ship.rebound.duration) || (!ship.rebound && ship.z < -400)) {
				ship.destroy();
				this.activeShips.splice(i, 1);
			}
		}
		if (displayFlag) this.display.rebuild();
		if (this.hyperJumpTimer === 0 && this.activeShips.length === 0 && this.spawnQueue.length === 0) {
			if (this.mode === "game" && gameState.ships >= SHIPS_PER_ROUND) {
				this.endGameRound();
			} else if (gameState.ships > this.waveStartShipsN && this.mode === "game") {
				this.hyperJumpTimer = 2;
				this.starField.speed = this.baseStarfieldSpeed * 5;
			} else this.startWave();
		}
		if (this.reloadTimer > 0) this.reloadTimer = Math.max(0, this.reloadTimer - event.delta);
		if (this.isFiring && this.mode === "game" && this.reloadTimer === 0) this.fireWeapon();
		for (let i = this.activeShots.length - 1; i >= 0; i--) {
			const s = this.activeShots[i];
			if (s.update(event.delta)) {
				this.hitShipAt(s.targetScreenPoint, this.mode === "game");
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
		if (this.startButton.group.visible) this.startButton.rebuild();
	}
}
