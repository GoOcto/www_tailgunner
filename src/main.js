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
        this.maxDistance = 5000; // How far away they go before vanishing
        this.fov = 300;          // Field of view (controls perspective scale)
        this.speed = 40;          // Speed at which stars move away
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
    constructor(modelData, scale = 20) {
        this.vertices = modelData.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
        this.edges = modelData.edges;
        this.scale = scale;
        this.lines = [];

        this.edges.forEach(() => {
            this.lines.push(new paper.Path.Line({
                strokeColor: '#cccccc',
                strokeWidth: 0.8
            }));
        });

        this.spiralRadius = Math.random() * 600 + 200;
        this.spiralSpeed = (Math.random() + 0.25) * 2.0; 
        this.zSpeed = Math.random() * 20 + 30; 

        const angle = Math.random() * Math.PI * 2;
        const screenMax = Math.max(paper.view.size.width, paper.view.size.height);
        
        const offsetDist = screenMax * 3 + (Math.random() * screenMax); 
        this.offsX = Math.cos(angle) * offsetDist;
        this.offsY = Math.sin(angle) * offsetDist;		
		this.z = 4000;
    }

	destroy() {
        this.lines.forEach(line => line.remove());
    }

    update(time) {
        const cx = paper.view.size.width / 2;
        const cy = paper.view.size.height / 2;
        const fov = 300;
        
		// Update world position along the spiral path
        this.z -= this.zSpeed;
        this.x = this.offsX + Math.cos(time * this.spiralSpeed) * this.spiralRadius;
        this.y = this.offsY + Math.sin(time * this.spiralSpeed) * this.spiralRadius;

		this.offsX *= 0.999;
		this.offsY *= 0.999;

        // 1. Calculate direction of travel by looking slightly ahead in time
        const dt = 0.016; 
        const nextX = this.offsX + Math.cos((time + dt) * this.spiralSpeed) * this.spiralRadius;
        const nextY = this.offsY + Math.sin((time + dt) * this.spiralSpeed) * this.spiralRadius;
        
        const dx = nextX - this.x;
        const dy = nextY - this.y;
        const dz = -this.zSpeed; 

        // 2. Normalize the direction vector (Forward)
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const fx = dx / length;
        const fy = dy / length;
        const fz = dz / length;

        // 3. Build the Basis Vectors
        // Since the model is coded facing -Z, the local +Z axis points backward (-Forward)
        const zx = -fx, zy = -fy, zz = -fz;
        
        // Right vector = cross product of global Up (0,1,0) and local Z axis
        let xx = zz, xy = 0, xz = -zx;
        const xLen = Math.sqrt(xx * xx + xz * xz);
        if (xLen > 0) {
            xx /= xLen; xz /= xLen;
        } else {
            xx = 1; xz = 0; // Fallback to prevent dividing by zero
        }

        // True local Up vector = cross product of local Z and local X
        const yx = zy * xz - zz * xy;
        const yy = zz * xx - zx * xz;
        const yz = zx * xy - zy * xx;

        this.edges.forEach((edge, index) => {
            const v1 = this.vertices[edge[0]];
            const v2 = this.vertices[edge[1]];
            
            // 4. Apply the rotation matrix to orient the vertices
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

                // Prevent geometric flipping if it moves behind the camera plane
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

class AnimationController {
    constructor() {
        this.starField = new StarField();
        this.starField.create(200);
        this.spawnHero();
    }
    
    spawnHero() {
        if (this.heroShip) {
            this.heroShip.destroy();
        }
        const randomVehicle = Vehicles[Math.floor(Math.random() * Vehicles.length)];
        this.heroShip = new VectorStarfighter(randomVehicle, 25);
    }

    onFrame(event) {
        this.starField.update();
        this.heroShip.update(event.time);
        
        // Reset when the ship fully crosses the FOV threshold behind the camera
        if (this.heroShip.z < -400) {
            this.spawnHero();
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