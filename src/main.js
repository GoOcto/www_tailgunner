import paper from 'paper';

const beamColor = '#88dddd';

const Vehicles = [
	{
		"model": "Condor",
		"type": "VectorWireframe",
		"vertices": [
			{ "id": 0, "x": 0.0, "y": 1.0, "z": 0.0 },   
			{ "id": 1, "x": 0.0, "y":-0.2, "z": 0.0 },   
			{ "id": 2, "x": 4.0, "y":-1.0, "z": 4.0 },   
			{ "id": 3, "x": 1.5, "y": 0.0, "z": 5.0 },   
			{ "id": 4, "x":-1.5, "y": 0.0, "z": 5.0 },   
			{ "id": 5, "x":-4.0, "y":-1.0, "z": 4.0 },   
			{ "id": 6, "x": 1.0, "y": 0.0, "z":-0.5 },   
			{ "id": 7, "x":-1.0, "y": 0.0, "z":-0.5 },   
			{ "id": 8, "x": 0.0, "y": 0.0, "z":-2.0 },   
		],
		"edges": [
			[0,1], [1,3], [3,0], [3,4], [4,1], [4,0], 
			[1,2], [2,3], [1,5], [5,4],
			[0,6], [6,1], [1,7], [7,0], 
			[1,8], [0,8], [6,8], [7,8]
		]
	},
	{
		"model": "Eagle",
		"type": "VectorWireframe",
		"vertices": [
			{ "id": 0, "x": 0.0, "y": 0.0, "z": 0.0 },   
			{ "id": 1, "x": 1.0, "y": 0.0, "z":-1.0 },   
			{ "id": 2, "x": 0.0, "y":-1.0, "z":-1.0 },   
			{ "id": 3, "x":-1.0, "y": 0.0, "z":-1.0 },   
			{ "id": 4, "x": 0.0, "y": 1.0, "z":-1.0 },   
			{ "id": 5, "x": 0.0, "y": 0.0, "z":-3.0 },   
			{ "id": 6, "x": 4.0, "y": 2.0, "z": 4.5 },   
			{ "id": 7, "x": 1.2, "y": 0.0, "z": 5.5 },   
			{ "id": 8, "x": 0.8, "y":-0.5, "z": 5.3 },   
			{ "id": 9, "x":-0.8, "y":-0.5, "z": 5.3 },   
			{ "id":10, "x":-1.2, "y": 0.0, "z": 5.5 },   
			{ "id":11, "x":-4.0, "y": 2.0, "z": 4.5 },   
		],
		"edges": [
			[0, 1], [0, 2], [0, 3], [0, 4], 
			[1, 5], [2, 5], [3, 5], [4, 5], 
			[0, 6], [6, 7], [7,8], [8,9], [9,10], [10,11],
			[10,7], [7,0], [8,0], [9,0], [10,0], [11,0]
		]
	},
	{
		"model": "Stingray",
		"type": "VectorWireframe",
		"vertices": [
			{ "id": 0, "x": 0.0, "y": 0.0, "z":-3.0 },   
			{ "id": 1, "x": 2.8, "y": 0.0, "z":-2.0 },   
			{ "id": 2, "x": 2.0, "y":-1.0, "z":-1.0 },   
			{ "id": 3, "x":-2.0, "y":-1.0, "z":-1.0 },   
			{ "id": 4, "x":-2.8, "y": 0.0, "z":-2.3 },   
			{ "id": 5, "x": 0.0, "y":-1.0, "z":-1.5 },   
			{ "id": 6, "x": 1.4, "y":-1.0, "z": 4.0 },   
			{ "id": 7, "x": 0.0, "y":-1.0, "z": 4.6 },   
			{ "id": 8, "x":-1.4, "y":-1.0, "z": 4.0 },   
			{ "id":9, "x": 2.2, "y":-1.8, "z": 4.0 },   
			{ "id":10, "x": 2.2, "y":-1.8, "z": 7.0 },   
			{ "id":11, "x": 1.4, "y":-1.0, "z": 7.0 },   
			{ "id":12, "x":-2.2, "y":-1.8, "z": 4.0 },   
			{ "id":13, "x":-2.2, "y":-1.8, "z": 7.0 },   
			{ "id":14, "x":-1.4, "y":-1.0, "z": 7.0 },   
		],
		"edges": [
			[0, 1], [1,2], [2,5], [5,0], [0, 4], [4,3], [3,5], 
			[1,6], [6,2], [3,8], [8,4], [6,7], [7,8],
			[6,9], [9,10],[10,11],[11,6],
			[8,12],[12,13],[13,14],[14,8]
		]
	}
];


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
                this.lines[index].opacity = Math.max(0.1, 1 - (this.z / 5000));
            } else {
                this.lines[index].visible = false;
            }
        });
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
		const cellH = viewH / totalRows;

        for (let row = 0; row < totalRows; row++) {
            for (let col = 0; col < totalCols; col++) {
				const path = new paper.Path({
					strokeColor: beamColor,
					strokeWidth: 1.5,
					strokeCap: 'round',
					strokeJoin: 'round',
					opacity: 0.65
				});
				path.add(new paper.Point(col*cellW + 0.0*cellW, row*cellH + 0.5*cellH));
				path.add(new paper.Point(col*cellW + 0.5*cellW, row*cellH + 0.0*cellH));
				path.add(new paper.Point(col*cellW + 1.0*cellW, row*cellH + 0.5*cellH));
				path.add(new paper.Point(col*cellW + 0.5*cellW, row*cellH + 1.0*cellH));
				path.add(new paper.Point(col*cellW + 0.0*cellW, row*cellH + 0.5*cellH));
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
        this.rebuild();
    }

    rebuild() {
        this.group.removeChildren();
        const center = paper.view.center;
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
}

class AnimationController {
    constructor() {
        this.starField = new StarField();
        this.starField.create(200);
        
        this.activeShips = [];
        this.spawnQueue = [];
        this.waveTimer = 0;
        this.net = new Net();
		this.reticle = new Reticle();        

        this.startWave();
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