import Triangle from "./triangle.js";
import Square from "./square.js";
import SpriteGroup from "./groups.js";
import Sphere from "./sphere.js";
import {modulus} from "./geometry.js"

export default class World {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.context = context;
        this.camera = {
            x : 0,
            y : 0
        };

        this.ready = false;
        this.player = null;
        this.target = null;
        this.visible_sprites = new SpriteGroup();
        this.collision_sprites = new SpriteGroup();
        this.winning_sprites = new SpriteGroup();
        this.perimeter = [];

        this.pull_spring = 200;
    }

    update(deltaTime) {
        this.visible_sprites.update(deltaTime, this.camera, this.collision_sprites, this.perimeter);

        // Pulling:
        console.log("PULLING:", this.player.pull_force)

        // Update the camera
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;

        // Check the death
        if (this.check_player_death()) {
            return "death";
        } else if (this.check_player_win()) {
            return "win";
        }
        return "idle";
    }

    check_player_death() {
        return this.player.check_collision(this.collision_sprites) || this.player.collide_with_perimeter(this.perimeter);
    }

    check_player_win() {
        if (this.player.spherical_collide(this.target)) {
            console.log("COLLISION WITH TARGET!");
            let distance = {
                x : this.target.x - this.player.x,
                y : this.target.y - this.player.y 
            }
            this.player.pull_force.x = distance.x * this.pull_spring;
            this.player.pull_force.y = distance.y * this.pull_spring;

            if (modulus(distance) < 5 && modulus(this.player.velocity) < 1) {
                return true;
            } 

            
        }
        return false;
    }

    draw_perimeter() {
        this.context.beginPath();
        
        for (var i = 0; i < this.perimeter.length; ++i) {
            let point = this.perimeter[i];
            //console.log("Drawing point:", point.x - this.camera.x, point.y - this.camera.y);
            if (i == 0) this.context.moveTo(point.x - this.camera.x, point.y - this.camera.y);
            else this.context.lineTo(point.x - this.camera.x, point.y - this.camera.y);
        }
        if (this.perimeter.length > 2)
            this.context.lineTo(this.perimeter[0].x - this.camera.x, this.perimeter[0].y - this.camera.y);

        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ff0000';
        this.context.stroke();
    }

    reset() {
        // Reset the level
        this.perimeter = [];

        this.visible_sprites.empty();
        this.collision_sprites.empty();

        this.player = null;
        this.ready = false;
    }

    create_level(json_url, clean = true) {
        this.ready = false;
        let self = this;

        // Polish the level
        if (clean) this.reset();

        // Retrive the json data
        fetch(json_url).then(response => response.text()).then(
            data => {
                // Create the level
                let world_data = JSON.parse(data);

                // Generate the external perimeter
                if ("perimeter" in world_data) {
                    for (var i = 0; i < world_data.perimeter.length; ++i) {
                        let vector = {
                            x : world_data.perimeter[i][0],
                            y : world_data.perimeter[i][1]
                        };
                        this.perimeter.push(vector);
                    }
                } else {
                    console.log("Perimeter not found in ", json_url);
                }

                // Generate the player
                if ("player" in world_data) {
                    this.player = create_geometry_from_json(world_data.player, this.canvas);
                    this.visible_sprites.add(this.player);
                } else {
                    console.log("Player not found in ", json_url);
                }

                if ("enemies" in world_data) {
                    let enemy_list = world_data.enemies;
                    for (var i = 0; i < enemy_list.length; i++ ) {
                        let enemy = create_geometry_from_json(enemy_list[i]);
                        this.visible_sprites.add(enemy);
                        this.collision_sprites.add(enemy);
                    }
                } else {
                    console.log("enemies not found in ", json_url);
                }

                if ("target" in world_data) {
                    this.target = create_geometry_from_json(world_data.target);
                    this.winning_sprites.add(this.target);
                    this.visible_sprites.add(this.target);
                }

                // Set the ready flag
                self.ready = true;
            }
        );
    }

    draw() {
        // Clear the area
        this.context.clearRect(0,0, this.canvas.width, this.canvas.height);

        // Draw the perimeter
        this.draw_perimeter();

        // Draw the visilbe sprites
        this.visible_sprites.draw(this.context, this.camera);
    }
}

function create_geometry_from_json(json_object, canvas) {
    let my_object = null;
    if (json_object.geometry === "triangle") {
        my_object = new Triangle(json_object.position[0],
            json_object.position[1], json_object.edge_size, 
            json_object.kind,
            canvas);
    } else if (json_object.geometry === "square") {
        my_object = new Square(json_object.position[0],
            json_object.position[1], json_object.edge_size, 
            json_object.kind,
            canvas);
    } else if (json_object.geometry === "sphere") {
        my_object = new Sphere(json_object.position[0],
            json_object.position[1], json_object.edge_size, 
            json_object.kind,
            canvas);
    } else {
        console.log("Error while parsing unkwnown geometry ", json_object.geometry);
        return null;
    }


    // Add other stuff
    if ("spin_velocity" in json_object) {
        my_object.spin_velocity = json_object.spin_velocity;
    }

    if ("pull_force" in json_object) {
        my_object.pull_force.x = json_object.pull_force[0];
        my_object.pull_force.y = json_object.pull_force[1];
    }
    if ("color" in json_object) {
        my_object.color = json_object.color;
    }
    return my_object;
}