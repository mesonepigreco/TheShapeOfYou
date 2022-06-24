import Mouse from "./mouse.js";
import Group  from "./groups.js";

export default class Geometry {
    constructor(x, y, kind, canvas, groups = []) {
        this.x = x;
        this.y = y;
        this.kind = kind;
        this.radius = 0;
        this.weight = 100;
        this.static = false;

        this.speed = 0.2;
        this.viscous_friction = 0.2;
        this.dynamic_friction = 0.2;

        // Avoid double counting the collisions
        this.collision_results = [];
        this.collision_tollerance = 15;

        // The moovement is not triggered if the point is closer than 
        // This value
        this.moving_radius = 10;
        this.hitbox = 0.95; // Fraction to be drawn but not trigger a collision

        this.vertices = [];
        this.rotation_angle = 0;
        this.color = "#f00";

        // Initialize a mouse instance only for the player
        if (this.kind === "player") 
            this.mouse_ctrl = new Mouse(canvas); 
        else
            this.mouse_ctrl = null;

        this.velocity  = {
            x : 0,
            y : 0
        };
        this.spinning_velocity = 0;
        this.mouse_velocity  = {
            x : 0,
            y : 0
        };

        this.acceleration  = {
            x : 0,
            y : 0
        };
        this.torque = 0;
        this.angular_momentum = 0;

        // Add the sprite to the corresponding groups
        this.groups = groups;
        for (var i = 0; i < groups.length; ++i) {
            let group = groups[i];
            group.add(this);
        }
    }

    get n_edges() {
        return this.vertices.length;
    }

    get n_vertices() {
        return this.vertices.length;
    }

    get_global_vertex(index, hitbox = false) {
        // Get the vertext with the correct rotation and translation
        let vertex = rotate_vector(this.vertices[index], this.rotation_angle);

        if (hitbox) {
            vertex.x *= this.hitbox;
            vertex.y *= this.hitbox;
        }

        vertex.x += this.x;
        vertex.y += this.y;

        return vertex;
    }

    get_global_edge(index, hitbox = false) {
        return [this.get_global_vertex(index, hitbox), this.get_global_vertex((index + 1) % this.n_edges, hitbox)];
    }

    kill() {
        // Remove the sprite from all the groups
        // The remotion should procede in reverse order to avoid 
        // Changing indices of elements which are not seen
        for (var i = this.groups.length-1; i >= 0 ; --i) {
            let group = this.groups[i];
            group.remove(this);
        }
    }

    update(deltaTime, camera) {

        // Point toward the mouse if this geometry is a player
        if (this.kind === "player") {
            // Get the vector
            var pointing_toward = {
                x: this.mouse_ctrl.x - this.x + camera.x,
                y: this.mouse_ctrl.y - this.y + camera.y
            };

            this.rotation_angle = Math.atan2(pointing_toward.y, pointing_toward.x); 
            this.rotation_angle -= Math.PI / 2;  


            var norm = Math.sqrt( pointing_toward.x**2 +  pointing_toward.y**2);
            if (this.mouse_ctrl.is_clicked && norm > this.moving_radius) {
                this.mouse_velocity.x = pointing_toward.x * this.speed / norm ;
                this.mouse_velocity.y = pointing_toward.y * this.speed / norm;
            } else {
                this.mouse_velocity.x = 0;
                this.mouse_velocity.y = 0;
            }
        }

        // TODO: Update physics and accelerations

        // Friction
        const v_norm = modulus(this.velocity);
        if (v_norm > 0) {

            const delta_vx = (-this.velocity.x * this.viscous_friction - Math.sign(this.velocity.x) * this.dynamic_friction) * deltaTime;
            const delta_vy = (-this.velocity.y * this.viscous_friction - Math.sign(this.velocity.y) * this.dynamic_friction) * deltaTime;

            if ((this.velocity.x + delta_vx)*this.velocity.x < 0) this.velocity.x = 0;
            else this.velocity.x += delta_vx; 

            if ((this.velocity.y + delta_vy)*this.velocity.y < 0) this.velocity.y = 0;
            else this.velocity.y += delta_vy; 
        }


        // Apply the moovements
        this.x += (this.velocity.x + this.mouse_velocity.x) * deltaTime;
        this.y += (this.velocity.y + this.mouse_velocity.y) * deltaTime;
        this.rotation_angle += this.spinning_velocity * deltaTime;

        // Avoid the number to grow too much
        if (this.rotation_angle > Math.PI * 2) this.rotation_angle-= Math.PI* 2;
        if (this.rotation_angle < 0) this.rotation_angle += Math.PI * 2;

        //console.log("Velocity:", this.velocity, "delta T:", deltaTime);

        //console.log("Rot angle:", this.rotation_angle, "  Toward pos: ", pointing_toward);

        // Set the radius of the current geometry to match the vertices
        this.radius = 0;
        var radius = 0;
        for (var i = 0; i < this.n_vertices; ++i) {
            radius = Math.sqrt(this.vertices[i].x**2 + this.vertices[i].y**2);
            if (radius > this.radius) this.radius = radius;
        }


    }

    check_collision(collision_group) {
        // Apply collision reactions
        for (var i = 0; i < collision_group.length; ++i) {
            let sprite = collision_group.sprites[i];

            if (sprite == this)
                continue;

            
            // Check the cheap collision first
            if (this.spherical_collide(sprite)) {
                    if(this.geometrical_collision(sprite))
                    return true;
            } 
        }
        return false;
    }

    // Move the baricenter on the center
    balance() {
        let baricenter = {
            x : 0, y : 0
        };

        // Compute the baricenter
        for (var i = 0; i < this.n_vertices; ++i) {
            baricenter.x += this.vertices[i].x;
            baricenter.y += this.vertices[i].y;
        }
        baricenter.x /= this.n_vertices;
        baricenter.y /= this.n_vertices;

        // Shift the vertices to center the baricenter
        for (var i = 0; i < this.n_vertices; ++i) {
            this.vertices[i].x -= baricenter.x;
            this.vertices[i].y -= baricenter.y;
        }
    }

    spherical_collide(other) {
        // This method enables collision between geometries

        // First use a circular collision 
        const distance2 = (this.x - other.x)*(this.x - other.x) + (this.y - other.y)*(this.y - other.y) ;
        const tollerance =  this.radius*this.radius + other.radius*other.radius + 2 * this.radius*other.radius;

        if (distance2 < tollerance) {
            return true;
        }
        return false;
    }

    geometrical_collision(other) {
        // Assume a collision between the objects
        /*
        let normal = {
            x : 0,
            y : 0
        };

        let collision_point = {
            x : 0,
            y : 0
        }*/

        for (var i = 0; i < this.n_edges; ++i) {
            let my_edge = this.get_global_edge(i, true);
            for (var j = 0; j < other.n_edges; ++j) {
                let other_edge = other.get_global_edge(j, true);
                

                // Check if there is a collision
                if (segment_intersect(my_edge[0], my_edge[1], other_edge[0], other_edge[1])) {
                    return true;

                    // Get the normal vector of the collision
                    normal.y = other_edge[1].x - other_edge[0].x;
                    normal.x = -other_edge[1].y + other_edge[0].y;

                    console.log("edge:", other_edge[0], other_edge[1], "normal:", normal);

                    // Get the correct direction (assuming a convex shape)
                    // Probably useless if vertices are defined clockwise
                    let center = {
                        x : .5 * (other_edge[0].x + other_edge[1].x) - other.x,
                        y : .5 * (other_edge[0].y + other_edge[1].y) - other.y
                    };

                    if (scalar_product(normal, center) < 0) {
                        normal.x *= -1;
                        normal.y *= -1;
                    }
                    const norm = Math.sqrt(normal.x*normal.x + normal.y*normal.y);
                    normal.x /= norm;
                    normal.y /= norm;
                    console.log("Normalized normal:", normal)

                    // Get how much the vertex penetrates inside
                    let other_v = {
                        x : other_edge[1].x - other_edge[0].x,
                        y : other_edge[1].y - other_edge[0].y
                    }
                    const nn = Math.sqrt(other_v.x*other_v.x + other_v.y*other_v.y);
                    const d1 = distance(my_edge[0], other);
                    const d2 = distance(my_edge[1], other);
                    var index = 0;
                    if (d1 > d2) index = 1;

                    let my_edge_vector = {
                        x : my_edge[index].x - other_edge[0].x,
                        y : my_edge[index].y - other_edge[0].y
                    }
                    my_edge_vector = rotate_vector(my_edge_vector, -Math.atan2(other_v.y, other_v.x));
                    const penetration = my_edge_vector.y;
                    // Multiply the normal vector by the penetration length
                    normal.x *= Math.abs(penetration);
                    normal.y *= Math.abs(penetration);

                    // Obtain the collision point
                    collision_point.x = my_edge[index].x;
                    collision_point.y = my_edge[index].y;

                    // Transform back to the center of mass 
                    collision_point.x -= this.x;
                    collision_point.y -= this.y;
                    collision_point = rotate_vector(collision_point, -this.rotation_angle);
                    
                    console.log("Normal vector:", normal, "collision point:", collision_point, "penetration:", penetration);
                    return [normal, collision_point];
                }
            }
        }
        return false;// [normal, collision_point];
    }

    draw(context, camera) {
        context.save();

        // Transform in the current position
        context.translate(this.x - camera.x, this.y - camera.y);
        context.rotate(this.rotation_angle);
        context.fillStyle = this.color;
        context.beginPath();

        if (this.n_vertices > 0) {
            context.moveTo(this.vertices[0].x, this.vertices[0].y);
        }

        for (var i = 1; i < this.n_vertices; ++i) {
            context.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        context.closePath();
        context.fill();
        context.restore();
    }
} 

function rotate_vector(vector, angle) {
    let new_vector = {
        x : Math.cos(angle) * vector.x - Math.sin(angle) * vector.y,
        y : Math.sin(angle) * vector.x + Math.cos(angle) * vector.y 
    };
    return new_vector;
}

function distance(v1, v2) {
    return Math.sqrt((v1.x-v2.x)**2  + (v1.y - v2.y)**2);
}

function modulus(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y* vector.y);
}

// Check clockwise order of points
function ccw(A, B, C) {
    return (C.y-A.y) * (B.x-A.x) > (B.y-A.y) * (C.x-A.x);
}

// Check if two segments AB and CD intersect
function segment_intersect(A, B, C, D) {
    return ccw(A,C,D) != ccw(B,C,D) && ccw(A,B,C) != ccw(A,B,D);
}


function scalar_product(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y
}