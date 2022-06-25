import { Geometry } from "./geometry.js";


export class Particle extends Geometry {
    constructor(x, y, canvas, groups = []) {
        super(x, y, "particle", canvas, groups);

        this.viscous_friction = 1.8;
        this.rot_friction = 2;
        this.dynamic_friction = 0;

        this.lifetime = 2; // Time in seconds
        this.radius_factor = 20;
    }

    update(deltaTime, camera, collision_group, perimeter, stream_group) {
        super.update(deltaTime, camera, collision_group, perimeter, stream_group);

        // Reuce the lifetime
        this.lifetime -= deltaTime / 1000;
        if (this.lifetime < 0) this.kill();
    }
}

export class GlowingSphere extends Particle {
    constructor(x, y, canvas, groups = []) {
        super(x, y, canvas, groups);
        this.viscous_friction = 0;
        this.dynamic_friction = 0;
    }

    draw(context, camera) {
        context.save();
        let pos = {
            x : this.x - camera.x, y: this.y - camera.y
        };
        
        var total_radius = this.lifetime * this.radius_factor;
        
        // Create a gradient
        var gradient = context.createRadialGradient(pos.x, pos.y, 
            total_radius / 2, pos.x, pos.y, total_radius);

        gradient.addColorStop(0, "#111");
        gradient.addColorStop(1, "#000");

        context.globalCompositeOperation = "screen";
        context.fillStyle = gradient;
        context.fillRect(pos.x - total_radius, pos.y - total_radius, 2*total_radius, 2*total_radius);
        context.restore();
    }
}


export function destroy_geometry(sprite, visible_group) {
    // Create new geometries
    for (var i = 0; i < sprite.n_edges; ++i) {
        let new_geometry = new Particle(sprite.x, sprite.y, null);
        let next = (i+1) % sprite.n_vertices;
        new_geometry.vertices = [
            {x:sprite.get_global_vertex(i).x - sprite.x, 
                y: sprite.get_global_vertex(i).y - sprite.y}, 
            {x:sprite.get_global_vertex(next).x - sprite.x, 
                y: sprite.get_global_vertex(next).y - sprite.y}, 
            {x:0, y:0}
        ]
        new_geometry.balance();
        new_geometry.lifetime = 10;
        new_geometry.color = sprite.color;
        new_geometry.spin_velocity = 3* (Math.random()*2 - 1);
        new_geometry.velocity.x = sprite.velocity.x + (Math.random()*2-1) * 20;
        new_geometry.velocity.y = sprite.velocity.y + (Math.random()*2-1) * 20;
        visible_group.add(new_geometry);
    }
}