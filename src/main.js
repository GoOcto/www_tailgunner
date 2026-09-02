import paper from 'paper';
import { DIGITS_DATA, Vehicles } from './assets.js';

const beamColor = '#88dddd';

class VectorDigits {
    constructor() {
        this.group = new paper.Group();
        this.rebuild();
    }

    renderString(str, startX, startY, digitWidth = 20, digitHeight = 40, spacing = 8) {
        const scaleX = digitWidth / 2;
        const scaleY = digitHeight / 4;

        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            const points = DIGITS_DATA[char];
            if (!points) continue;

            const xOffset = startX + i * (digitWidth + spacing);

            const path = new paper.Path({
                strokeColor: beamColor,
                strokeWidth: 1,
                strokeCap: 'square',
                strokeJoin: 'miter'
            });

            points.forEach(pt => {
                path.add(new paper.Point(
                    xOffset + pt[0] * scaleX,
                    startY + pt[1] * scaleY
                ));
            });

            this.group.addChild(path);
        }
    }

    rebuild() {
        this.group.removeChildren();

        const viewW = paper.view.size.width;
        const padding = 30;
        const digitW = 18;
        const digitH = 30;
        const spacing = 8;
		const midTop = 6;
		const sideTop = midTop + 2*spacing + digitH;

        const leftStr = "173";
        this.renderString(leftStr, padding, sideTop, digitW, digitH, spacing);

        const centerStr = "46";
        const centerWidth = centerStr.length * digitW + (centerStr.length - 1) * spacing;
        const centerX = (viewW - centerWidth) / 2;
        this.renderString(centerStr, centerX, midTop, digitW, digitH, spacing);

        const rightStr = "8";
        const rightWidth = rightStr.length * digitW + (rightStr.length - 1) * spacing;
        const rightX = viewW - padding - rightWidth;
        this.renderString(rightStr, rightX, sideTop, digitW, digitH, spacing);
    }
}

class StarField {
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
        
        const r = Math.sqrt(Math.random()) * (maxRadius-minRadius) + minRadius;
        const theta = Math.random() * Math.PI * 2;

        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        const z = randomZ ? Math.random() * this.maxDistance : 0;
        const baseRadius = Math.random() * 10 + 2.5; 

        const shape = new paper.Path.Circle({
            center: new paper.Point(-1000, -1000),
            radius: 1, 
            fillColor: beamColor,
        });

        return { x, y, z, baseRadius, shape };
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

            const scale =  this.fov / (this.fov + star.z);
            const sx = cx + (star.x * scale);
            const sy = cy + (star.y * scale);
            const projectedRadius = Math.max(0.1, star.baseRadius * scale);

            star.shape.bounds = new paper.Rectangle(
                sx - projectedRadius,
                sy - projectedRadius,
                projectedRadius * 2,
                projectedRadius * 2
            );
            
            star.shape.opacity = 1 - (star.z / this.maxDistance);
        }
    }
}

class VectorStarfighter {
    constructor(modelData, scale, waveSpeed = null) {
        this.vertices = modelData.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
        this.edges = modelData.edges;
        this.scale = scale;
        this.lines = [];
        this.visibleEdges = [];
        this.projectedBounds = null;
        this.time = 5 * Math.random();

        this.edges.forEach(() => {
            this.lines.push(new paper.Path.Line({
                strokeColor: beamColor,
                strokeWidth: 0.8
            }));
        });

        this.spiralSpeed = Math.random() * 0.5 + 0.6; 
        if (Math.random() < .5) this.spiralSpeed *= -1;
        
        this.zSpeed = waveSpeed !== null ? waveSpeed : (Math.random() * 10 + 10); 
        this.z = 4000;

        this.pinchZ = 1000 + (Math.random() - 0.5) * 500; 
        this.minRadius = Math.random() * 150 + 50;        
        this.spread = 800 + 800 * Math.random();
        this.centerX = (Math.random() - 0.5) * 500;
        this.centerY = (Math.random() - 0.5) * 500;
    }

    destroy() {
        this.lines.forEach(line => line.remove());
    }

    containsReticle(point, padding = 24) {
        if (!this.projectedBounds) return false;

        return point.x >= this.projectedBounds.minX - padding
            && point.x <= this.projectedBounds.maxX + padding
            && point.y >= this.projectedBounds.minY - padding
            && point.y <= this.projectedBounds.maxY + padding;
    }

    getExplosionEdges() {
        return this.visibleEdges.map(edge => ({
            p1: edge.p1.clone(),
            p2: edge.p2.clone(),
            opacity: edge.opacity
        }));
    }

    update(deltaTime) {
		this.time += deltaTime;

        const cx = paper.view.size.width / 2;
        const cy = paper.view.size.height / 2;
        const fov = 300;
        
        this.z -= this.zSpeed;

        const getRadiusAtZ = (currentZ) => {
            const zDiff = (currentZ - this.pinchZ) / 1000;
            return (zDiff * zDiff) * this.spread + this.minRadius;
        };

		const exponentialDecay = 0.5**(this.z / 4000); 
		const zDepSpiralSpeed = this.spiralSpeed * exponentialDecay;

        const currentRadius = getRadiusAtZ(this.z);
        this.x = this.centerX + Math.cos(this.time * zDepSpiralSpeed) * currentRadius;
        this.y = this.centerY + Math.sin(this.time * zDepSpiralSpeed) * currentRadius;

        const nextZ = this.z - this.zSpeed;
        const nextTime = this.time + (1.0 / 60.0); 
        const nextRadius = getRadiusAtZ(nextZ);
        
        const nextX = this.centerX + Math.cos(nextTime * zDepSpiralSpeed) * nextRadius;
        const nextY = this.centerY + Math.sin(nextTime * zDepSpiralSpeed) * nextRadius;
        
        const dx = nextX - this.x;
        const dy = nextY - this.y;
		const forwardBias = 30.0;
        const dz = nextZ - this.z - forwardBias;

        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const fx = dx / length;
        const fy = dy / length;
        const fz = dz / length;

        const zx = -fx, zy = -fy, zz = -fz;
        
        let xx = zz, xy = 0, xz = -zx;
        const xLen = Math.sqrt(xx * xx + xz * xz);
        if (xLen > 0) {
            xx /= xLen; xz /= xLen;
        } else {
            xx = 1; xz = 0; 
        }

        const yx = zy * xz - zz * xy;
        const yy = zz * xx - zx * xz;
        const yz = zx * xy - zy * xx;
        this.visibleEdges = [];
        this.projectedBounds = null;

        const addProjectedPoint = (point) => {
            if (!this.projectedBounds) {
                this.projectedBounds = {
                    minX: point.x,
                    minY: point.y,
                    maxX: point.x,
                    maxY: point.y
                };
                return;
            }

            this.projectedBounds.minX = Math.min(this.projectedBounds.minX, point.x);
            this.projectedBounds.minY = Math.min(this.projectedBounds.minY, point.y);
            this.projectedBounds.maxX = Math.max(this.projectedBounds.maxX, point.x);
            this.projectedBounds.maxY = Math.max(this.projectedBounds.maxY, point.y);
        };

        this.edges.forEach((edge, index) => {
            const v1 = this.vertices[edge[0]];
            const v2 = this.vertices[edge[1]];
            
            const rotate = (v) => ({
                x: v.x * xx + v.y * yx + v.z * zx,
                y: v.x * xy + v.y * yy + v.z * zy,
                z: v.x * xz + v.y * yz + v.z * zz
            });

            const rv1 = rotate(v1);
            const rv2 = rotate(v2);

            const project = (v) => {
                const worldX = this.x + (v.x * this.scale);
                const worldY = this.y + (v.y * this.scale);
                const worldZ = this.z + (v.z * this.scale);

                if (worldZ <= -fov + 10) return null;

                const projScale = fov / (fov + worldZ);
                return new paper.Point(
                    cx + (worldX * projScale),
                    cy + (worldY * projScale)
                );
            };

            const p1 = project(rv1);
            const p2 = project(rv2);

            if (p1 && p2) {
                this.lines[index].visible = true;
                this.lines[index].segments[0].point = p1;
                this.lines[index].segments[1].point = p2;
                const opacity = Math.max(0.1, 1 - (this.z / 5000));
                this.lines[index].opacity = opacity;
                this.visibleEdges.push({ p1, p2, opacity });
                addProjectedPoint(p1);
                addProjectedPoint(p2);
            } else {
                this.lines[index].visible = false;
            }
        });
    }
}

class ExplosionEdge {
    constructor(edge) {
        this.center = edge.p1.add(edge.p2).divide(2);
        this.localP1 = edge.p1.subtract(this.center);
        this.localP2 = edge.p2.subtract(this.center);
        this.velocity = new paper.Point({
			length: 5 + Math.random()*10,
            angle: Math.random() * 360
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
            strokeWidth: 0.8,
            opacity: edge.opacity
        });
    }

    update(deltaTime) {
        this.age += deltaTime;
        this.center = this.center.add(this.velocity.multiply(deltaTime));
        this.angle += this.angularVelocity * deltaTime;

        const p1 = this.center.add(this.localP1.rotate(this.angle));
        const p2 = this.center.add(this.localP2.rotate(this.angle));
        this.path.segments[0].point = p1;
        this.path.segments[1].point = p2;
        this.path.opacity = this.initialOpacity * Math.max(0, 1 - (this.age / this.duration));

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

class Net {
    constructor() {
        this.group = new paper.Group();
        this.group.visible = false;
    }

    rebuild() {
        this.group.removeChildren();
        const viewW = paper.view.size.width;
        const viewH = paper.view.size.height;

        const totalRows = 2;
        const totalCols = 3;
		const cellW = viewW / totalCols;
		const cellShift = (viewH - 2*cellW)/2;

        for (let row = 0; row < totalRows; row++) {
            for (let col = 0; col < totalCols; col++) {
				const path = new paper.Path({
					strokeColor: beamColor,
					strokeWidth: 1.5,
					strokeCap: 'round',
					strokeJoin: 'round',
					opacity: 0.65
				});
				path.add(new paper.Point(col*cellW + 0.0*cellW, cellShift + row*cellW + 0.5*cellW));
				path.add(new paper.Point(col*cellW + 0.5*cellW, cellShift + row*cellW + 0.0*cellW));
				path.add(new paper.Point(col*cellW + 1.0*cellW, cellShift + row*cellW + 0.5*cellW));
				path.add(new paper.Point(col*cellW + 0.5*cellW, cellShift + row*cellW + 1.0*cellW));
				path.add(new paper.Point(col*cellW + 0.0*cellW, cellShift + row*cellW + 0.5*cellW));
	            this.group.addChild(path);
            }
        }
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

class Reticle {
    constructor() {
        this.group = new paper.Group();
        this.pos = paper.view.center.clone();
        this.rebuild();
    }

    rebuild() {
        this.group.removeChildren();
        const center = this.pos;
        const color = new paper.Color(beamColor);

        const axes = new paper.CompoundPath({
            children: [
                new paper.Path.Line(center.add([0, -30]), center.add([0, 30])),
                new paper.Path.Line(center.add([-30, 0]), center.add([30, 0]))
            ],
            strokeColor: color,
            strokeWidth: 1
        });

        const ticksData = [
            { pos: 10, len: 12 },
            { pos: 20, len: 24 },
        ];
        
        const tickPaths = [];
        ticksData.forEach(tick => {
            [1, -1].forEach(dir => {
                tickPaths.push(new paper.Path.Line(
                    center.add([-tick.len / 2, tick.pos * dir]),
                    center.add([tick.len / 2, tick.pos * dir])
                ));
                tickPaths.push(new paper.Path.Line(
                    center.add([tick.pos * dir, -tick.len / 2]),
                    center.add([tick.pos * dir, tick.len / 2])
                ));
            });
        });

        const allTicks = new paper.CompoundPath({
            children: tickPaths,
            strokeColor: color,
            strokeWidth: 1
        });

        this.group.addChildren([axes, allTicks]);
    }

    moveTo(point) {
        this.pos = point.clone();
        this.group.position = point;
    }
}

class DeltaShot {
    // startScreenPoint / targetScreenPoint are 2D screen-space points (paper.Point).
    // Internally the shot travels through 3D space: it starts on the screen plane
    // (z = 0, at the bottom corner) and flies to a point directly behind the
    // reticle, `depth` units into the screen (z = depth), then is projected back
    // to the screen every frame using the same perspective projection as the
    // vector starfighters.
    constructor(startScreenPoint, targetScreenPoint) {
        const cx = paper.view.size.width / 2;
        const cy = paper.view.size.height / 2;
        this.fov = 300;
        const depth = 2000;
        this.targetScreenPoint = targetScreenPoint.clone();

        this.start3D = {
            x: startScreenPoint.x - cx,
            y: startScreenPoint.y - cy,
            z: 0
        };

        // Unproject the reticle's screen position out to `depth` so the target
        // sits directly behind the reticle, `depth` units into the screen.
        const targetProjScale = this.fov / (this.fov + depth);
        this.target3D = {
            x: (targetScreenPoint.x - cx) / targetProjScale,
            y: (targetScreenPoint.y - cy) / targetProjScale,
            z: depth
        };

        this.progress = 0;
        this.duration = 0.25; // seconds for the full blaster animation
        this.size = 40;

        // Delta (arrow/triangle) shape defined top-down: x = left/right,
        // z = forward (nose)/backward, y = 0 (flat). Local +z is the "nose"
        // direction, which gets rotated to point along the travel direction.
        this.localVertices = [
            { x: 0, y: 0, z: 4.0 },    // tip / nose
            { x: -0.5, y: 0, z: -0.6 }, // back-left
            { x: 0, y: 0, z: 1.0 },    // inner tip
            { x: 0.5, y: 0, z: -0.6 },  // back-right
        ];

        this.path = new paper.Path({
            strokeColor: new paper.Color(beamColor),
            strokeWidth: 1.5,
            closed: true
        });

        this.rebuild();
    }

    rebuild() {
        const cx = paper.view.size.width / 2;
        const cy = paper.view.size.height / 2;
        const fov = this.fov;

        const t = this.progress;
        const posX = this.start3D.x + (this.target3D.x - this.start3D.x) * t;
        const posY = this.start3D.y + (this.target3D.y - this.start3D.y) * t;
        const posZ = this.start3D.z + (this.target3D.z - this.start3D.z) * t;

        // Forward (travel) direction, used as the local +z axis for orienting
        // the shape so its nose points along the direction of travel.
        let fx = this.target3D.x - this.start3D.x;
        let fy = this.target3D.y - this.start3D.y;
        let fz = this.target3D.z - this.start3D.z;
        const flen = Math.sqrt(fx * fx + fy * fy + fz * fz) || 1;
        fx /= flen; fy /= flen; fz /= flen;

        // Build an orthonormal basis (xAxis, yAxis, forward) via the standard
        // up-vector cross product technique.
        const upX = 0, upY = 1, upZ = 0;
        let xx = upY * fz - upZ * fy;
        let xy = upZ * fx - upX * fz;
        let xz = upX * fy - upY * fx;
        let xlen = Math.sqrt(xx * xx + xy * xy + xz * xz);
        if (xlen < 1e-6) { xx = 1; xy = 0; xz = 0; xlen = 1; }
        xx /= xlen; xy /= xlen; xz /= xlen;

        const yx = fy * xz - fz * xy;
        const yy = fz * xx - fx * xz;
        const yz = fx * xy - fy * xx;

        const project = (v) => {
            const worldX = posX + (v.x * xx + v.y * yx + v.z * fx) * this.size;
            const worldY = posY + (v.x * xy + v.y * yy + v.z * fy) * this.size;
            const worldZ = posZ + (v.x * xz + v.y * yz + v.z * fz) * this.size;

            const projScale = fov / (fov + worldZ);
            return new paper.Point(
                cx + worldX * projScale,
                cy + worldY * projScale
            );
        };

        const points = this.localVertices.map(project);

        this.path.removeSegments();
        points.forEach(p => this.path.add(p));
        this.path.closed = true;
    }

    update(deltaTime) {
        this.progress += deltaTime / this.duration;
        if (this.progress >= 1) {
            this.progress = 1;
            this.rebuild();
            return true; // reached target, ready for removal
        }
        this.rebuild();
        return false;
    }

    destroy() {
        this.path.remove();
    }
}

class AnimationController {
    constructor() {
        this.starField = new StarField();
        this.starField.create(200);
		this.display = new VectorDigits();
        
        this.activeShips = [];
        this.spawnQueue = [];
        this.waveTimer = 0;
        this.net = new Net();
        this.reticle = new Reticle();        

        this.activeShots = [];
        this.explosionEdges = [];
        this.reloadTimeSecs = 0.25;
        this.reloadTimer = 0;

        this.startWave();

        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = paper.view.size.width / rect.width;
            const scaleY = paper.view.size.height / rect.height;
            const mousePos = new paper.Point(
                (e.clientX - rect.left) * scaleX,
                (e.clientY - rect.top) * scaleY
            );
            this.reticle.moveTo(mousePos);
        });

        canvas.addEventListener('mouseleave', () => {
            this.reticle.group.visible = false;
        });
        canvas.addEventListener('mouseenter', () => {
            this.reticle.group.visible = true;
        });

        canvas.addEventListener('mousedown', () => {
            this.fireWeapon();
        });
    }

    fireWeapon() {
        if (this.reloadTimer > 0) return;

        const viewW = paper.view.size.width;
        const viewH = paper.view.size.height;
        const target = this.reticle.pos;

        const bottomLeft = new paper.Point(0, viewH);
        const bottomRight = new paper.Point(viewW, viewH);

        this.activeShots.push(new DeltaShot(bottomLeft, target));
        this.activeShots.push(new DeltaShot(bottomRight, target));

        this.reloadTimer = this.reloadTimeSecs;
    }

    startWave() {
        const sharedSpeed = Math.random() * 10 + 10;
        const sharedModel = Vehicles[Math.floor(Math.random() * Vehicles.length)];

		let t = 0;
		this.spawnQueue = [];
		for (let i=0;i<3;i++) {
			t += 0.03 + 0.1*Math.random();
			this.spawnQueue.push({ delay: t, speed: sharedSpeed, model: sharedModel });
		}
        this.waveTimer = 0;
    }

    explodeShip(ship) {
        ship.getExplosionEdges().forEach(edge => {
            this.explosionEdges.push(new ExplosionEdge(edge));
        });
        ship.destroy();
    }

    hitShipAt(point) {
        for (let i = this.activeShips.length - 1; i >= 0; i--) {
            const ship = this.activeShips[i];
            if (ship.containsReticle(point)) {
                this.explodeShip(ship);
                this.activeShips.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    onFrame(event) {
        this.starField.update();
        this.waveTimer += event.delta;
        
        for (let i = this.spawnQueue.length - 1; i >= 0; i--) {
            if (this.waveTimer >= this.spawnQueue[i].delay) {
                const q = this.spawnQueue.splice(i, 1)[0];
                this.activeShips.push(new VectorStarfighter(q.model, 25, q.speed));
            }
        }

        for (let i = this.activeShips.length - 1; i >= 0; i--) {
            let ship = this.activeShips[i];
            ship.update(event.delta);
            
            if (ship.z < -400) {
                ship.destroy();
                this.activeShips.splice(i, 1);
            }
        }
        
        if (this.activeShips.length === 0 && this.spawnQueue.length === 0) {
            this.startWave();
        }

        if (this.reloadTimer > 0) {
            this.reloadTimer = Math.max(0, this.reloadTimer - event.delta);
        }

        for (let i = this.activeShots.length - 1; i >= 0; i--) {
            const shot = this.activeShots[i];
            const reachedTarget = shot.update(event.delta);
            if (reachedTarget) {
                this.hitShipAt(shot.targetScreenPoint);
                shot.destroy();
                this.activeShots.splice(i, 1);
            }
        }

        for (let i = this.explosionEdges.length - 1; i >= 0; i--) {
            const edgeFinished = this.explosionEdges[i].update(event.delta);
            if (edgeFinished) {
                this.explosionEdges.splice(i, 1);
            }
        }
    }
    
    onResize() {
        if (this.net.group.visible) this.net.rebuild();
		this.reticle.rebuild();			
    }
}

const FIXED_W = 960; // 4:3 at 720p tall
const FIXED_H = 720;
const canvas = document.getElementById('gameCanvas');
canvas.width = FIXED_W;
canvas.height = FIXED_H;
paper.setup(canvas);

// Paper.js's CanvasView writes inline canvas.style.width/height whenever
// viewSize is set (to compensate for devicePixelRatio). That inline style
// overrides our CSS, which is what lets the canvas scale to fit its
// container. Clear it after every viewSize change so CSS stays in control.
function keepCanvasCssScalable() {
    canvas.style.width = '';
    canvas.style.height = '';
}

paper.view.viewSize = new paper.Size(FIXED_W, FIXED_H);
keepCanvasCssScalable();

const controller = new AnimationController();

const keysDown = new Set();
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        keysDown.add('Space');
        controller.net.show();
    }
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        keysDown.delete('Space');
        controller.net.hide();
    }
});
window.addEventListener('blur', () => {
    keysDown.clear();
    controller.net.hide();
});

paper.view.onFrame = (event) => {
    controller.onFrame(event);
};
paper.view.onResize = () => {
    controller.onResize();
};