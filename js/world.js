import Triangle from "./triangle.js";
import Square from "./square.js";
import SpriteGroup from "./groups.js";
import Sphere from "./sphere.js";
import {Geometry, modulus} from "./geometry.js"

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
        this.pick_sprites = new SpriteGroup();
        this.perimeter = [];

        this.pause = false;

        this.pull_spring = 200;
    }

    show_pick_menu(pick_element) {
        // Show the menu that decides who is the player
        /*let current_position = {
            x : this.player.x,
            y : this.player.y
        }*/

        this.pause = true;

        let pick_menu = document.getElementById("pick-a-side");

        // Make the menu visible
        pick_menu.disabled = false;
        pick_menu.style.opacity = 1;
        pick_menu.style.left = "50%";
        pick_menu.style.top = "50%";

        // Add the images to the correct object
        const img_src = "assets/" + pick_element.texts[0] + ".png";
        document.getElementById("img-1").src = img_src;
        const img_src2 = "assets/" +  pick_element.texts[1] + ".png";
        document.getElementById("img-2").src = img_src2;

        // Add the event listener
        let self = this;

        function pick(value) {
            self.player.kill();
            if (value == "left") {
                self.player = pick_element.choice1;
            } else {
                self.player = pick_element.choice2;
            }
            pick_element.kill();

            self.pause = false;

            pick_menu.disabled = false;
            pick_menu.style.opacity = 0;
            pick_menu.style.left = "-250%";
            pick_menu.style.top = "-250%";


            document.getElementById("pick-1").removeEventListener("click");
            document.getElementById("pick-2").removeEventListener("click");
        }
        document.getElementById("pick-1").addEventListener("click", () => {
            pick("left");
        });
        document.getElementById("pick-2").addEventListener("click", () => {
            pick("right");
        });

    }

    check_pick() {
        for (var i = 0; i < this.pick_sprites.length; ++i) {
            let sprite = this.pick_sprites.sprites[i];

            if (this.player.check_collision(sprite)) {
                // Open the pick menu
                this.show_pick_menu(sprite);
            }
        }
    }

    update(deltaTime) {
        //this.show_pick_menu("triangle", "square")
        if (! this.pause) {
            this.visible_sprites.update(deltaTime, this.camera, this.collision_sprites, this.perimeter);

            // Pulling:
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
    }

    check_player_death() {
        return this.player.check_collision(this.collision_sprites) || this.player.collide_with_perimeter(this.perimeter);
    }

    check_player_win() {
        if (this.player.spherical_collide(this.target)) {
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
        this.winning_sprites.empty();
        this.pick_sprites.empty();

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

                if ("picks" in world_data) {
                    for (var i = 0; i < world_data.picks.length; ++i) {
                        console.log("here:", world_data.picks[i]);
                        let pick = new PickMe(world_data.picks[i]);
                        this.pick_sprites.add(pick);
                        this.visible_sprites.add(pick);
                    }
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

    let position = {x: 0,y: 0};
    if ("position" in json_object) {
        position.x = json_object.position[0];
        position.y = json_object.position[1];
    }

    if (json_object.geometry === "triangle") {
        my_object = new Triangle(position.x,
            position.y, json_object.edge_size, 
            json_object.kind,
            canvas);
    } else if (json_object.geometry === "square") {
        my_object = new Square(position.x,
            position.y, json_object.edge_size, 
            json_object.kind,
            canvas);
    } else if (json_object.geometry === "sphere") {
        my_object = new Sphere(position.x,
            position.y, json_object.edge_size, 
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

    if ("balance" in json_object) {
        if (json_object.balance) 
            my_object.balance();
    } else
        my_object.balance();

    return my_object;
}


export class PickMe extends Geometry{
    constructor(json_object) {
        super(json_object.position[0],  json_object.position[1], "pick");
        this.choice1 = create_geometry_from_json(json_object.left);
        this.choice2 = create_geometry_from_json(json_object.right);

        this.texts = [json_object.left.geometry, json_object.right.geometry];

        var padding = 50;
        var text_height = 40;
        this.text_width = 270;
        this.choice1.x = this.x - this.choice1.get_width() / 2 - padding;
        this.choice2.x = this.x + this.choice2.get_width() / 2 + padding;
        this.choice1.y = this.y;
        this.choice2.y = this.y;

        let tot_vertices_y = [];
        for (var i = 0; i < this.choice1.n_vertices; ++i) {
            tot_vertices_y.push(this.choice1.vertices[i].y);
        }
        for (var i = 0; i < this.choice2.n_vertices; ++i) {
            tot_vertices_y.push(this.choice2.vertices[i].y);
        }

        this.max_height = Math.max(...tot_vertices_y);
        this.min_height = Math.min(...tot_vertices_y);

        console.log("choices:", this.choice1, this.choice2);
        console.log("vertices:", tot_vertices_y);
        console.log("HEGHT:", this.max_height, this.min_height);

        this.text_position = {
            x: this.x,
            y: this.y  - this.max_height - 10
        };

        this.line_start = {
            x : this.x,
            y : this.y - this.min_height
        };
        this.line_end = {
            x : this.x,
            y : this.y - this.max_height
        };

        this.vertices = [
            {x : -Math.max(this.choice1.get_width(), this.text_width/2) - padding, y: this.min_height + 2*padding},
            {x : -Math.max(this.choice1.get_width(), this.text_width/2) - padding, y: this.max_height - 2*padding - text_height},
            {x : Math.max(this.choice2.get_width(), this.text_width/2) + padding, y: this.max_height - 2*padding - text_height},
            {x :Math.max(this.choice2.get_width(), this.text_width/2) + padding, y: this.min_height + 2*padding},
        ]
    }

    draw(context, camera) {
        // Draw a text 
        context.font = "24px press-start";
        context.fillText("Pick a shape", this.text_position.x - camera.x - this.text_width / 2, this.text_position.y - camera.y); 
        
        this.choice1.draw(context, camera);
        this.choice2.draw(context, camera);

        context.strokeStyle = "#222222";
        context.lineWidth = 4;
        context.moveTo(this.line_start.x - camera.x, this.line_start.y - camera.y);
        context.lineTo(this.line_end.x - camera.x, this.line_end.y - camera.y);
        context.stroke();

        // Draw the vertices
        context.beginPath();

        context.moveTo(this.get_global_vertex(0).x - camera.x, this.get_global_vertex(0).y - camera.y);

        for (var i = 1; i < this.n_vertices; ++i) {
            context.lineTo(this.get_global_vertex(i).x - camera.x, this.get_global_vertex(i).y - camera.y);
        }
        context.closePath();
        context.stroke();
    }
}