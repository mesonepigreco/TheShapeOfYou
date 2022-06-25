import {Geometry} from "./geometry.js";

export default class Sphere extends Geometry {
    constructor(x, y, radius, kind, canvas, groups = []) {
        super(x, y, kind, canvas, groups);

        this.edge_size = radius;
        this.radius = radius;
        this.hitbox = 1;
        this.collide_radius = radius * this.hitbox;
    }

    update(deltaTime, camera, collision, perimeter, stream) {
        super.update(deltaTime, camera, collision, perimeter, stream);

        this.collide_radius = this.radius * this.hitbox;
    }

    balance() {
        // Do nothing
    }

    geometrical_collision(dumb) {
        // A sphere only conlide with the spherical method
        return true;
    }

    draw(context, camera) {
        context.save();
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x - camera.x , this.y - camera.y, this.radius, 0, 2*Math.PI);
        
        context.closePath();
        context.fill();
        context.restore();
    }
}