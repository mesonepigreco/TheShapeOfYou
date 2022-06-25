import {Geometry} from "./geometry.js";
import { draw_a_glow } from "./light.js";
export default class Sphere extends Geometry {
    constructor(x, y, radius, kind, canvas, groups = []) {
        super(x, y, kind, canvas, groups);

        this.edge_size = radius;
        this.radius = radius;
        this.color = "rgba(100, 255, 100, 0.6)";
        this.central_color = "#fff";
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
        let pos = {
            x : this.x - camera.x,
            y : this.y - camera.y
        };

        context.save();
        /*
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(pos.x, pos.y, this.radius, 0, 2*Math.PI);
        
        context.closePath();*/

        // Prepare a gradient
        var gradient = context.createRadialGradient(pos.x, pos.y, 
            this.radius / 4, pos.x, pos.y, this.radius);

        gradient.addColorStop(0, this.central_color);
        gradient.addColorStop(0.96, this.color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        context.fillStyle = gradient;
        context.fillRect(pos.x - this.radius, pos.y - this.radius, 2*this.radius, 2*this.radius);
        context.restore();

        draw_a_glow(context, this.radius * 2, pos, "#151");
    }
}