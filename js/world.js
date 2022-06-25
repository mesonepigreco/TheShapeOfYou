import Triangle from "./triangle.js";
import Square from "./square.js";
import SpriteGroup from "./groups.js";
import Sphere from "./sphere.js";
import {Geometry, modulus} from "./geometry.js"
import { Stream } from "./stream.js";
import { destroy_geometry, GlowingSphere } from "./particles.js";
import { Switch } from "./switch.js";

export default class World {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.context = context;
        this.camera = {
            x : 0,
            y : 0
        };

        this.camera_velocity = {
            x : 0,
            y : 0
        };

        this.level_loaded = false;
        this.level = "";
        this.player = null;
        this.spawn_point = {x : 0, y: 0};
        this.target = null;
        this.visible_sprites = new SpriteGroup();
        this.collision_sprites = new SpriteGroup();
        this.winning_sprites = new SpriteGroup();
        this.pick_sprites = new SpriteGroup();
        this.stream_sprites = new SpriteGroup();
        this.glowing_sprites = new SpriteGroup();
        this.switch_sprites = new SpriteGroup();
        this.perimeter = [];
        this.camera_speed = 5;

        this.start_trigger = -1;
        this.end_trigger = -1;
        this.transition_duration = 800;

        let self = this;

        this.background_loaded = false;
        this.background_img = new Image();
        this.background_img.src = "assets/background_tiles.png"
        this.background_img.addEventListener("load", () => {
            self.background_loaded = true;
        });

        this.switch_loaded = 0;
        this.level_loaded = false;
        this.switch_image_on = new Image();
        this.switch_image_on.src = "assets/switch_on.png";
        this.switch_image_on.addEventListener("load", () => {
            self.switch_loaded++;
        });
        this.switch_image_off = new Image();
        this.switch_image_off.src = "assets/switch_off.png";
        this.switch_image_off.addEventListener("load", () => {
            self.switch_loaded++;
        });

        this.pause = false;
        this.death_trigger = -1;
        this.death_timeout = 2500;
        this.start_trigger = -1;

        this.pull_spring = 200;

        this.glowing_generation_rate = 200;

        this.restarting = false;


        // Setup the restart level function
        function restart_level() {
            self.restarting = true;
            self.end_trigger = Date.now();
            console.log("Restarting");
        }

        document.getElementById("restart-level").addEventListener("click", (event) => {
            restart_level();
        });
    }

    ready() {
        if (!this.background_loaded) return false;
        if (this.switch_loaded !== 2) return false;
        if (!this.level_loaded) return false;

        return true;
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
        const img1 = document.getElementById("img-1");
        img1.src = img_src;
        img1.width = pick_element.choice1.edge_size;

        const img_src2 = "assets/" +  pick_element.texts[1] + ".png";
        const img2 = document.getElementById("img-2");
        img2.src = img_src2;
        img2.width = pick_element.choice2.edge_size;

        // Add the event listener
        let self = this;

        function pick(value) {
            var position = {x: self.player.x, y: self.player.y};
            self.player.kill();
            if (value == "left") {
                self.player = pick_element.choice1;
            } else {
                self.player = pick_element.choice2;
            }
            self.visible_sprites.add(self.player);

            self.player.x = position.x;
            self.player.y = position.y;
            self.spawn_point.x = position.x;
            self.spawn_point.y = position.y;
            pick_element.kill();

            self.pause = false;

            pick_menu.disabled = false;
            pick_menu.style.opacity = 0;
            pick_menu.style.left = "-250%";
            pick_menu.style.top = "-250%";


            document.getElementById("pick-1").removeEventListener("click",() => {
                pick("left");
            } );
            document.getElementById("pick-2").removeEventListener("click",() => {
                pick("right");
            });

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

            if (this.player.check_single_collision(sprite)) {
                // Open the pick menu
                //console.log("Collision!");
                this.show_pick_menu(sprite);
            } else {
                //console.log("NO Collision!");
            }
        }
    }

    draw_transition(trigger, reverse = true) {
        var time = Date.now() - trigger;

        if (trigger > 0 && time < this.transition_duration*2) {
            let pos = {
                x : this.player.x - this.camera.x,
                y : this.player.y - this.camera.y
            };


            this.context.save();

            let condition = time < this.transition_duration
            if (!reverse) condition = time > this.transition_duration;

            if (condition) {
                var factor =  ( 1 - time / this.transition_duration);
                if (!reverse) factor *= -1
                var total_radius = this.canvas.width * factor;

                // Create a gradient
                var gradient = this.context.createRadialGradient(pos.x, pos.y, 
                    total_radius*.9, pos.x, pos.y, total_radius);

                console.log("DRAWING");
        
                gradient.addColorStop(0, "rgba(4,4,4,0.0)");
                gradient.addColorStop(0.9, "rgba(0,0,0,0.8)");
                gradient.addColorStop(0.95, "rgba(0,0,0,1)");
                gradient.addColorStop(1, "rgba(0,0,0,1)");
        
                this.context.fillStyle = gradient;
            } else {
                this.context.fillStyle = "#000";
            }
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.restore();
        }
    }

    update_switches() {
        // Check the collision between the player and all the switches
        for (var i = 0; i < this.switch_sprites.length; ++i) {
            let swtc = this.switch_sprites.sprites[i];
            if (swtc.is_on) {
                if (this.player.check_single_collision(swtc)) {
                    swtc.is_on = false;
                    this.stream_sprites.sprites[swtc.deactivate_id].active = false;

                    console.log("SWITCH!");

                    // TODO: play a sound
                } 
            }
        }
    }

    update_spawn_glowing(deltaTime) {
        /*
        if (Math.random() < deltaTime / this.glowing_generation_rate) {
            const rx = Math.random()*2. - 1;
            const ry = Math.random()*2. - 1;
            let particle = new GlowingSphere(this.player.x, this.player.y, this.canvas);
            particle.viscous_friction = 0;//.001;
            particle.dynamic_friction = 0;
            this.glowing_sprites.add(particle);
            particle.velocity.x = rx * 40.;
            particle.velocity.y = ry * 40.;

        }*/

        for (var i = 0; i < this.stream_sprites.length; ++i) {
            let stream = this.stream_sprites.sprites[i];
            if (Math.random() < deltaTime / this.glowing_generation_rate) {
                let r_pos = Math.random() - .5;
                let vel_vect = Math.random() * stream.push_force / 20;

                let position = {
                    x : stream.x + stream.direction.y * r_pos * stream.edge_size,
                    y : stream.y - stream.direction.x * r_pos * stream.edge_size
                };


                let particle = new GlowingSphere(position.x, position.y, this.canvas);
                particle.radius_factor /= 2;
                if (!stream.active) vel_vect /= 6;
                particle.velocity.x = stream.direction.x * vel_vect;
                particle.velocity.y = stream.direction.y * vel_vect;
                this.glowing_sprites.add(particle);
            }
        }
    }

    update(deltaTime) {
        //this.show_pick_menu("triangle", "square")
        if (! this.pause) {
            this.visible_sprites.update(deltaTime, this.camera, this.collision_sprites, this.perimeter, this.stream_sprites);
            this.glowing_sprites.update(deltaTime, this.camera, this.collision_sprites, this.perimeter, this.stream_sprites);
            // Pulling:
            // Update the camera

            var dt = deltaTime / 1000;

            this.camera_velocity.x = this.camera_speed *( (this.player.x - this.canvas.width / 2) - this.camera.x);
            this.camera_velocity.y = this.camera_speed *((this.player.y - this.canvas.height / 2) - this.camera.y);
            this.camera.x += this.camera_velocity.x * dt
            this.camera.y += this.camera_velocity.y * dt


            this.check_pick();

            // Spawn glowing particle
            this.update_spawn_glowing(deltaTime);

            this.update_switches();

            // Check the death
            if (this.check_player_death()) {
                return "death";
            } else if (this.check_player_win()) {
                return "win";
            }
            return "idle";
        } else {
            console.log("PAUSE:", this.pause);
            return "idle"
        }
    }

    check_player_death() {
        if (this.player.check_collision(this.collision_sprites) || this.player.collide_with_perimeter(this.perimeter)) {
            destroy_geometry(this.player, this.visible_sprites);
            this.player.kill();
            this.player.velocity.x = 0;
            this.player.velocity.y = 0;
            this.death_trigger = Date.now();
        }

        if (this.death_trigger > 0 && Date.now() - this.death_trigger > this.death_timeout) {
            this.player.relive([this.visible_sprites]);
            this.player.x = this.spawn_point.x;
            this.player.y = this.spawn_point.y;
            this.death_trigger = -1;
        } 
        return false;
    }

    check_player_win() {
        let time = Date.now();
        if (this.player.spherical_collide(this.target)) {
            let distance = {
                x : this.target.x - this.player.x,
                y : this.target.y - this.player.y 
            }
            this.player.pull_force.x = distance.x * this.pull_spring;
            this.player.pull_force.y = distance.y * this.pull_spring;

            if (modulus(distance) < 5 && modulus(this.player.velocity) < 1 && this.end_trigger < 0) {
                this.end_trigger = time;
            } 
        }

        if (this.end_trigger > 0 && time - this.end_trigger > 1.5 * this.transition_duration) {
            return true;
        }
        return false;
    }

    draw_background() {
        let bkg_width = this.background_img.width;
        let bkg_height = this.background_img.height;

        var parallax_distance = 1;

        var ox = -this.camera.x * parallax_distance;
        var oy =  -this.camera.y * parallax_distance;
        ox = ox % bkg_width - bkg_width;
        oy = oy % bkg_height - bkg_height;

        var sx = ox;

        while (sx < this.canvas.width) {
            var sy = oy;
            while(sy < this.canvas.width) {
                this.context.drawImage(this.background_img, Math.floor(sx), Math.floor(sy));
                sy += bkg_height;
            }
            sx += bkg_width;
        }
    }

    draw_perimeter() {
        this.context.save();
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

        this.context.restore();
    }

    reset() {
        // Reset the level
        this.perimeter = [];

        this.visible_sprites.empty();
        this.collision_sprites.empty();
        this.winning_sprites.empty();
        this.pick_sprites.empty();
        this.stream_sprites.empty();
        this.glowing_sprites.empty();
        this.switch_sprites.empty();

        this.transition_trigger = -1;
        this.end_trigger = -1;
        this.death_trigger = -1;
        this.start_trigger = -1;

        this.player = null;
        this.level_loaded = false;
        this.pause = false;
    }

    create_level(json_url, clean = true) {
        this.level_loaded = false;
        this.level = json_url;
        let self = this;

        console.log("Loading:", json_url);

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
                    this.spawn_point.x = this.player.x;
                    this.spawn_point.y = this.player.y;
                    this.visible_sprites.add(this.player);
                } else {
                    console.log("Player not found in ", json_url);
                }

                if ("switches" in world_data) {
                    for (var i = 0; i < world_data.switches.length; ++i) {
                        let my_switch = new Switch(world_data.switches[i].position[0],
                            world_data.switches[i].position[1],
                            this.switch_image_off, this.switch_image_on, 
                            world_data.switches[i].deactivate_id,
                            this.canvas);
                        this.switch_sprites.add(my_switch);
                        this.visible_sprites.add(my_switch);
                    }
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
                        let pick = new PickMe(world_data.picks[i], this.canvas);
                        this.pick_sprites.add(pick);
                        this.visible_sprites.add(pick);
                    }
                }

                if ("streams" in world_data) {
                    for (var i = 0; i < world_data.streams.length; ++i) {
                        let stream = create_geometry_from_json(world_data.streams[i]);
                        this.visible_sprites.add(stream);
                        this.stream_sprites.add(stream);
                    }
                }

                // Set the ready flag
                self.level_loaded = true;
            }
        );


    }

    draw() {
        // Clear the area
        this.context.clearRect(0,0, this.canvas.width, this.canvas.height);

        // Draw the background
        this.draw_background();

        // Add a layer of darkness
        this.context.save();
        this.context.globalCompositeOperation = "multiply";
        this.context.fillStyle = "#ccc";
        this.context.fillRect(0,0, this.canvas.width, this.canvas.height);
        this.context.restore();

        // Draw the perimeter
        this.draw_perimeter();

        // Draw the visilbe sprites
        this.visible_sprites.draw(this.context, this.camera);

        // Draw the glowing
        this.glowing_sprites.draw(this.context, this.camera);

        // Draw cinematic out
        this.draw_transition(this.end_trigger);
        this.draw_transition(this.start_trigger, false);

    }
}

function create_geometry_from_json(json_object, canvas) {
    let my_object = null;

    let position = {x: 0,y: 0};
    if ("position" in json_object) {
        position.x = json_object.position[0];
        position.y = json_object.position[1];
    }

    if (json_object.kind === "stream") {
        my_object = new Stream(position.x, 
            position.y, json_object.direction,
            json_object.push_force, json_object.edge_size, json_object.depth,
            canvas);
    } else {

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


        if ("balance" in json_object) {
            if (json_object.balance) 
                my_object.balance();
        } else
            my_object.balance();
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
    } if ("mass" in json_object) {
        my_object.mass = json_object.mass;
    }
    return my_object;
}


export class PickMe extends Geometry{
    constructor(json_object, canvas) {
        super(json_object.position[0],  json_object.position[1], "pick");
        this.choice1 = create_geometry_from_json(json_object.left);
        this.choice2 = create_geometry_from_json(json_object.right);
        this.choice1.init_player(canvas);
        this.choice2.init_player(canvas);

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
        // Draw the path
        context.beginPath();

        context.moveTo(this.get_global_vertex(0).x - camera.x, this.get_global_vertex(0).y - camera.y);

        for (var i = 1; i < this.n_vertices; ++i) {
            context.lineTo(this.get_global_vertex(i).x - camera.x, this.get_global_vertex(i).y - camera.y);
        }
        context.closePath();
        context.stroke();

        // Darken the background inside
        context.save();
        context.globalCompositeOperation = "multiply";
        context.fillStyle = "#aaa";
        context.fill();
        context.restore();

        // Draw a text 
        this.choice2.draw(context, camera);
        this.choice1.draw(context, camera);

        context.save();
        context.font = "24px press-start";
        context.fillStyle = "#eee";
        context.fillText("Pick a shape", this.text_position.x - camera.x - this.text_width / 2, this.text_position.y - camera.y); 
        

        context.strokeStyle = "#222222";
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(this.line_start.x - camera.x, this.line_start.y - camera.y);
        context.lineTo(this.line_end.x - camera.x, this.line_end.y - camera.y);
        context.closePath();
        context.stroke();

        // Draw the vertices
        context.restore();
    }
}