import { Geometry } from "./geometry.js";
import {draw_a_glow} from "./light.js";
export class Switch extends Geometry {
    constructor(x, y, image_off, image_on, deactivate_id, canvas, groups = []) {
        console.log("HERE AALAL");
        super(x, y, "switch", canvas, groups);

        console.log("LOADING SWITCH")

        this.is_on = true;
        this.image_off = image_off;
        this.image_on = image_on;
        this.deactivate_id = deactivate_id;

        console.log("THIS IMAGE:", this.image_off);

        this.width = this.image_on.width;
        this.height = this.image_on.height
        

        // Get the vertices
        this.vertices = [
            {x : this.width / 2, y: this.height / 2},
            {x : -this.width / 2, y: this.height / 2},
            {x : -this.width / 2, y: -this.height / 2},
            {x : this.width / 2, y: -this.height / 2}
        ];
    }

    draw(context, camera) {
        let pos = {
            x : this.x - camera.x,
            y : this.y - camera.y
        };

        let image = this.image_off;
        if (this.is_on) image = this.image_on;

        context.drawImage(image, pos.x - this.width / 2, pos.y - this.height / 2);

        // Add a glowing circle if it is on
        if (this.is_on) {    
            var total_radius = Math.max(this.width, this.height)* 1.2;
            draw_a_glow(context, total_radius, pos, "#222");
        }

    }
}