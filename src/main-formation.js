import paper from 'paper';

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
            fillColor: 'white',
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
            const scale = this.fov / (this.fov + star.z);
            const sx = cx + (star.x * scale);
            const sy = cy + (star.y * scale);
            const projectedRadius = Math.max(0.1, star.baseRadius * scale);
            star.shape.bounds = new paper.Rectangle(
                sx - projectedRadius, sy - projectedRadius,
                projectedRadius * 2, projectedRadius * 2
            );
            star.shape.opacity = 1 - (star.z / this.maxDistance);
        }
    }
}

// Cubic Hermite spline interpolation for smooth 3D paths
function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return {
        x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
        z: 0.5 * ((2 * p1.z) + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3)
    };
}

class WavePath {
    constructor() {
        this.pts = [];
        this.generate();
        this.totalSegments = this.pts.length - 3;
    }
    
    generate() {
        // Broad starting offsets and amplitudes for sweeping, gradual curves
        const startX = (Math.random() - 0.5) * 3000;
        const startY = (Math.random() - 0.5) * 3000;
        const ampX = (Math.random() - 0.5) * 2500;
        const ampY = (Math.random() - 0.5) * 2500;
        
        // Low frequencies ensure the direction changes are gentle
        const freqX = Math.random() * 1.5 + 0.5;
        const freqY = Math.random() * 1.5 + 0.5;

        for(let i = -1; i <= 10; i++) {
            let u = i / 9.0; 
            let z = 6000 - (u * 8000); 
            
            let x = startX * (1-u) + Math.sin(u * Math.PI * freqX) * ampX;
            let y = startY * (1-u) + Math.cos(u * Math.PI * freqY) * ampY;
            
            this.pts.push({x, y, z});
        }
    }
    
    getPoint(t) {
        let p = t * this.totalSegments;
        let i = Math.floor(p);
        let frac = p - i;
        if (i < 0) { i = 0; frac = 0; }
        if (i >= this.totalSegments) { i = this.totalSegments - 1; frac = 1; }
        
        return catmullRom(this.pts[i], this.pts[i+1], this.pts[i+2], this.pts[i+3], frac);
    }
    
    getForward(t) {
        let dt = 0.001;
        let p1 = this.getPoint(Math.max(0, t - dt));
        let p2 = this.getPoint(Math.min(1, t + dt));
        let dx = p2.x - p1.x, dy = p2.y - p1.y, dz = p2.z - p1.z;
        let len = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
        return { x: dx/len, y: dy/len, z: dz/len };
    }

    advanceParameter(t, forwardDist) {
        let p1 = this.getPoint(t);
        let p2 = this.getPoint(t + 0.001);
        let len = Math.sqrt(Math.pow(p2.x-p1.x, 2) + Math.pow(p2.y-p1.y, 2) + Math.pow(p2.z-p1.z, 2));
        let worldDistPerT = Math.max(len / 0.001, 1);
        return t + (forwardDist / worldDistPerT);
    }
}

class VectorStarfighter {
    constructor(modelData, scale = 20) {
        this.vertices = modelData.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
        this.edges = modelData.edges;
        this.scale = scale;
        this.lines = [];
        this.edges.forEach(() => {
            this.lines.push(new paper.Path.Line({ strokeColor: '#cccccc', strokeWidth: 0.8 }));
        });
    }

    destroy() {
        this.lines.forEach(line => line.remove());
    }

    // Accepts matrix vectors instead of calculating its own path
    updateTransform(wx, wy, wz, right, up, back) {
        const cx = paper.view.size.width / 2;
        const cy = paper.view.size.height / 2;
        const fov = 300;

        this.edges.forEach((edge, index) => {
            const v1 = this.vertices[edge[0]];
            const v2 = this.vertices[edge[1]];
            
            const transform = (v) => ({
                x: v.x * right.xx + v.y * up.yx + v.z * back.zx,
                y: v.x * right.xy + v.y * up.yy + v.z * back.zy,
                z: v.x * right.xz + v.y * up.yz + v.z * back.zz
            });

            const rv1 = transform(v1);
            const rv2 = transform(v2);

            const project = (v) => {
                const worldX = wx + (v.x * this.scale);
                const worldY = wy + (v.y * this.scale);
                const worldZ = wz + (v.z * this.scale);
                if (worldZ <= -fov + 10) return null;
                const projScale = fov / (fov + worldZ);
                return new paper.Point(
                    cx + (worldX * projScale), cy + (worldY * projScale)
                );
            };

            const p1 = project(rv1);
            const p2 = project(rv2);

            if (p1 && p2) {
                this.lines[index].visible = true;
                this.lines[index].segments[0].point = p1;
                this.lines[index].segments[1].point = p2;
                this.lines[index].opacity = Math.max(0.1, 1 - (wz / 5000));
            } else {
                this.lines[index].visible = false;
            }
        });
    }
}

class Wave {
    constructor() {
        this.path = new WavePath();
        this.t = 0; 
        this.forwardSpeed = Math.random() * 20 + 40; 
        
        // Randomly assign behavior 1 (Form->Diverge) or 2 (Diverge->Form->Diverge)
        this.behavior = Math.random() > 0.5 ? 1 : 2;
        
        const randomModel = Vehicles[Math.floor(Math.random() * Vehicles.length)];
        this.ships = [
            new VectorStarfighter(randomModel, 25),
            new VectorStarfighter(randomModel, 25),
            new VectorStarfighter(randomModel, 25)
        ];
        
        const spread = 80 + Math.random() * 40;
        const drop = -50 - Math.random() * 40;
        this.formTargets = [
            {x: 0, y: 0, z: 0},
            {x: -spread, y: 0, z: drop},
            {x: spread, y: 0, z: drop}
        ];
        
        this.looseStarts = this.ships.map(() => ({
            x: (Math.random()-0.5)*3000, y: (Math.random()-0.5)*3000, z: (Math.random()-0.5)*1500
        }));
        
        this.looseEnds = this.ships.map(() => ({
            x: (Math.random()-0.5)*4000, y: (Math.random()-0.5)*4000, z: (Math.random()-0.5)*2000
        }));
    }

    destroy() {
        this.ships.forEach(s => s.destroy());
    }

    update() {
        if (this.t >= 1.0) return true; 
        
        this.t = this.path.advanceParameter(this.t, this.forwardSpeed);
        if (this.t > 1.0) this.t = 1.0;

        let basePos = this.path.getPoint(this.t);
        let fw = this.path.getForward(this.t);
        
        let zx = -fw.x, zy = -fw.y, zz = -fw.z; 
        let xx = zz, xy = 0, xz = -zx; 
        let xLen = Math.sqrt(xx*xx + xz*xz);
        if (xLen > 0) { xx /= xLen; xz /= xLen; } else { xx = 1; xz = 0; }
        let yx = zy*xz - zz*xy, yy = zz*xx - zx*xz, yz = zx*xy - zy*xx; 
        
        let fFact = 0;

        if (this.behavior === 1) {
            // Behavior 1: Start in formation, diverge later
            if (this.t < 0.5) fFact = 1.0; 
            else if (this.t < 0.8) fFact = 1.0 - ((this.t - 0.5) / 0.3);
            else fFact = 0.0;
        } else {
            // Behavior 2: Enter diverged, converge, hold for ~0.5s, diverge
            if (this.t < 0.25) fFact = this.t / 0.25; 
            else if (this.t < 0.55) fFact = 1.0; 
            else if (this.t < 0.85) fFact = 1.0 - ((this.t - 0.55) / 0.3);
            else fFact = 0.0;
        }
        
        // Smoothstep easing for natural movement
        fFact = fFact * fFact * (3 - 2 * fFact); 

        let allPastCamera = true;

        for(let i=0; i<3; i++) {
            let s = this.ships[i];
            let offX, offY, offZ;
            
            if (this.behavior === 1) {
                offX = this.looseEnds[i].x * (1-fFact) + this.formTargets[i].x * fFact;
                offY = this.looseEnds[i].y * (1-fFact) + this.formTargets[i].y * fFact;
                offZ = this.looseEnds[i].z * (1-fFact) + this.formTargets[i].z * fFact;
            } else {
                if (this.t < 0.5) {
                    offX = this.looseStarts[i].x * (1-fFact) + this.formTargets[i].x * fFact;
                    offY = this.looseStarts[i].y * (1-fFact) + this.formTargets[i].y * fFact;
                    offZ = this.looseStarts[i].z * (1-fFact) + this.formTargets[i].z * fFact;
                } else {
                    offX = this.looseEnds[i].x * (1-fFact) + this.formTargets[i].x * fFact;
                    offY = this.looseEnds[i].y * (1-fFact) + this.formTargets[i].y * fFact;
                    offZ = this.looseEnds[i].z * (1-fFact) + this.formTargets[i].z * fFact;
                }
            }

            let worldX = basePos.x + xx*offX + yx*offY + zx*offZ;
            let worldY = basePos.y + xy*offX + yy*offY + zy*offZ;
            let worldZ = basePos.z + xz*offX + yz*offY + zz*offZ;

            s.updateTransform(worldX, worldY, worldZ, {xx,xy,xz}, {yx,yy,yz}, {zx,zy,zz});
            
            if (worldZ >= -400) allPastCamera = false;
        }
        
        return allPastCamera || this.t >= 1.0; 
    }
}

class AnimationController {
    constructor() {
        this.starField = new StarField();
        this.starField.create(200);
        this.spawnWave();
    }
    
    spawnWave() {
        if (this.currentWave) {
            this.currentWave.destroy();
        }
        this.currentWave = new Wave();
    }

    onFrame(event) {
        this.starField.update();
        const waveComplete = this.currentWave.update();
        if (waveComplete) {
            this.spawnWave();
        }
    }
    
    onResize() {}
}

paper.setup(document.getElementById('gameCanvas'));
const controller = new AnimationController();
paper.view.onFrame = (event) => {
    controller.onFrame(event);
};
paper.view.onResize = () => {
    controller.onResize();
};