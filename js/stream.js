import { Geometry, modulus, scalar_product } from "./geometry.js";


export class Stream extends Geometry {
    constructor(x, y, direction, push_force, edge_size, depth, canvas, groups) {
        super(x, y, "stream", canvas, groups);

        this.direction = direction;
        this.push_force = push_force;
        this.edge_size = edge_size;
        this.depth = depth;
        this.active = true;

        var mod = modulus(direction);
        this.direction.x /= mod;
        this.direction.y /= mod;
    }

    player_collision(player) { // Returns the pull force on the player
        // Redefine the in the reference of the stream
        let pull_force = {
            x : 0, y : 0
        };

        if (!this.active) return pull_force;

        let vector = {x :  player.x - this.x , y: player.y - this.y};
        var d_ver = scalar_product(vector, this.direction);


        if (d_ver < 0 || d_ver > this.depth) return pull_force;

        // Check along the hoizontal axis
        let h_vector = {
            x : vector.x - d_ver * this.direction.x, 
            y : vector.y - d_ver * this.direction.y
        };
        var d_hor = modulus(h_vector);


        if (d_hor > this.edge_size / 2) return pull_force;


        // Get the pull force
        pull_force.x = this.push_force * this.direction.x;
        pull_force.y = this.push_force * this.direction.y;
        return pull_force;
    }

    draw(context, camera) {
        context.save();

        let pos = {
            x : this.x - camera.x, 
            y : this.y - camera.y
        };

        let normal = {
            x : -this.direction.y,
            y: this.direction.x
        };

        context.font = "24px press-start";
        context.fillStyle = "#eee";
        context.textAlign = "center";
        context.fillText("STREAM", this.x - camera.x, this.y - camera.y); 
        

        // Draw the stream
        if (this.active) {
            context.save();
            context.globalCompositeOperation = "lighter";
            context.beginPath();
            context.moveTo(pos.x, pos.y);
            pos.x += normal.x * this.edge_size / 2;
            pos.y += normal.y * this.edge_size / 2;
            context.lineTo(pos.x, pos.y);
            pos.x += this.direction.x * this.depth;
            pos.y += this.direction.y * this.depth;
            context.lineTo(pos.x, pos.y);
            pos.x -= normal.x * this.edge_size;
            pos.y -= normal.y * this.edge_size;
            context.lineTo(pos.x, pos.y);
            pos.x -= this.direction.x * this.depth;
            pos.y -= this.direction.y * this.depth;
            context.lineTo(pos.x, pos.y);
            pos.x += normal.x * this.edge_size / 2;
            pos.y += normal.y * this.edge_size / 2;

            context.closePath();
            
            // Create a gradient
            let target = {
                x : pos.x + this.direction.x * this.depth * 3 / 4,
                y : pos.y + this.direction.y * this.depth * 3 / 4
            };
            var gradient = context.createRadialGradient(target.x, target.y, 
                this.edge_size, pos.x , pos.y, this.edge_size / 3);

            gradient.addColorStop(1, "#1111aa");
            //gradient.addColorStop(0.7,"#1111aa");
            gradient.addColorStop(0, "rgba(0,0,0,0)");

            context.fillStyle = gradient;
            context.fill();
            context.restore();
        }
        context.restore();
    }
}
