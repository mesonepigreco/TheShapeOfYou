import Triangle from "./triangle.js";
import Square from "./square.js";
import SpriteGroup from "./groups.js";
import Sphere from "./sphere.js";
import {Geometry, modulus} from "./geometry.js"
import { Stream } from "./stream.js";
import { destroy_geometry, GlowingSphere } from "./particles.js";
import { Switch } from "./switch.js";

import { playSound } from "./audio.js";
import { ThreeLegs, TwoLegs, Cross } from "./tetris.js";

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

        // Define the audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audio_context = new AudioContext();

        // Load the audio
        this.die_track = null;
        this.win_track = null;
        this.glurp_track = null;
        this.switch_track = null;
        this.sliding_track = null;
        this.show_menu_track = null;
        this.stream_track = null;
        this.boinc_track = null;

        // Try to load the audio with this wired function
        /*var request = new XMLHttpRequest();
        request.open('GET', "assets/death1.wav", true);
        request.responseType = 'arraybuffer';
        // Decode asynchronously
        request.onload = function() {
            self.audio_context.decodeAudioData(request.response, function(buffer) {
                if (!buffer) {
                    console.log('Error decoding file data: ' + url);
                    return;
                }
            self.die_track = buffer;
            console.log("BUFFER DIE:", buffer);
            });
        request.onerror = function() {
            console.log('BufferLoader: XHR error');        
            };
        request.send();
        };*/
        


        //this.die_sound = new Audio("assets/death1.wav");
        //this.win_sound = new Audio("assets/win.wav");
        //this.glurp_sound = new Audio("assets/glurp.wav");
        //this.switch_sound = new Audio("assets/switch.wav");
        //this.sliding_sound = new Audio("assets/sliding.wav");
        //this.show_menu_sound = new Audio("assets/menu.wav");
        

        let request = new XMLHttpRequest();
        request.open("GET", "assets/death1.wav");
        request.responseType = "arraybuffer";
        request.onload = function() {
            let undecodedAudio = request.response;
            self.audio_context.decodeAudioData(undecodedAudio, (data) => {
                self.die_track = data
                console.log("NOW DATA:", data);
                console.log("NOW THIS:", self.die_track);
            });
        };
        request.send();
        
        let request2 = new XMLHttpRequest();
        request2.open("GET", "assets/win.wav");
        request2.responseType = "arraybuffer";
        request2.onload = function() {
            let undecodedAudio = request2.response;
            self.audio_context.decodeAudioData(undecodedAudio, (data) => {
                self.win_track = data
            });
        };
        request2.send();

        
        let request3 = new XMLHttpRequest();
        request3.open("GET", "assets/switch.wav");
        request3.responseType = "arraybuffer";
        request3.onload = function() {
            let undecodedAudio = request3.response;
            self.audio_context.decodeAudioData(undecodedAudio, (data) => {
                self.switch_track = data
            });
        };
        request3.send();

        let request4 = new XMLHttpRequest();
        request4.open("GET", "assets/glurp.wav");
        request4.responseType = "arraybuffer";
        request4.onload = function() {
            let undecodedAudio = request4.response;
            self.audio_context.decodeAudioData(undecodedAudio, (data) => {
                self.glurp_track = data
            });
        };
        request4.send();

        let request5 = new XMLHttpRequest();
        request5.open("GET", "assets/sliding.wav");
        request5.responseType = "arraybuffer";
        request5.onload = function() {
            let undecodedAudio = request5.response;
            self.audio_context.decodeAudioData(undecodedAudio, (data) => {
                self.sliding_track = data
            });
        };
        request5.send();

        let request6 = new XMLHttpRequest();
        request6.open("GET", "assets/menu.wav");
        request6.responseType = "arraybuffer";
        request6.onload = function() {
            let undecodedAudio = request6.response;
            self.audio_context.decodeAudioData(undecodedAudio, (data) => {
                self.show_menu_track = data
            });
        };
        request6.send();


        let request7 = new XMLHttpRequest();
        request7.open("GET", "assets/wind.wav");
        request7.responseType = "arraybuffer";
        request7.onload = function() {
            let undecodedAudio = request7.response;
            self.audio_context.decodeAudioData(undecodedAudio, (data) => {
                self.stream_track = data
            });
        };
        request7.send();

        let request8 = new XMLHttpRequest();
        request8.open("GET", "assets/boinc.wav");
        request8.responseType = "arraybuffer";
        request8.onload = function() {
            let undecodedAudio = request8.response;
            self.audio_context.decodeAudioData(undecodedAudio, (data) => {
                self.boinc_track = data
            });
        };
        request8.send();


        // For the sliding sound we need a source since it is in loop

        // creates a sound source
        this.audio_source_sliding = null;
        this.audio_source_stream = null;
        this.sliding_gain_node = null;
        this.glurp_timeout = 5000;
        this.glurp_trigger = -1;
    

        //this.sliding_sound = new Audio("assets/sliding.wav");
        //this.show_menu_sound = new Audio("assets/menu.wav");

          

        //this.die_track = this.audio_context.createMediaElementSource(this.die_sound);
        //this.die_track.connect(this.audio_context.destination);

        
        //this.sliding_sound.loop = true;
        this.sliding_maxvel = 440;



        this.pause = false;
        this.death_trigger = -1;
        this.death_timeout = 1500;
        this.start_trigger = -1;

        this.pull_spring = 200;

        this.glowing_generation_rate = 100;

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

        playSound(this.audio_context, this.show_menu_track, 0, 1);
        if (this.audio_source_sliding !== null) this.audio_source_sliding.stop(0);
        //this.show_menu_sound.play()
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
        //img1.src = img_src;
        //img1.width = pick_element.choice1.edge_size;
        img1.src = pick_element.choice1.get_img_url();
        console.log("SRC:", img1.src);

        const img_src2 = "assets/" +  pick_element.texts[1] + ".png";
        const img2 = document.getElementById("img-2");
        //img2.src = img_src2;
        //img2.width = pick_element.choice2.edge_size;
        img2.src = pick_element.choice2.get_img_url();

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


                    // TODO: play a sound
                    //this.switch_sound.play();
                    //this.switch_track.noteOn(0);
                    playSound(this.audio_context, this.switch_track, 0, 1);
                } 
            }
        }
    }

    update_spawn_glowing(deltaTime) {
        let vel = modulus(this.player.velocity);
        if (vel > 0) {
            if (Math.random() < deltaTime * vel / 16000) {
                const rx = Math.random()*2. - 1;
                const ry = Math.random()*2. - 1;
                let particle = new GlowingSphere(this.player.x, this.player.y, this.canvas);
                particle.viscous_friction = 0;//.001;
                particle.dynamic_friction = 0;
                particle.radius_factor = this.player.edge_size / 4;
                this.glowing_sprites.add(particle);
                particle.velocity.x = rx * 70.;
                particle.velocity.y = ry * 70.;
            }
        }

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

    update_sliding() {
        let vel = modulus(this.player.velocity);

        // Audio volume
        //if (vel > this.sliding_maxvel) vel = this.sliding_maxvel;
        let volume = vel / this.sliding_maxvel;
        if (volume > 1) volume = 1;

        if (volume > 0.05) {
            if (this.audio_source_sliding === null) {
                this.audio_source_sliding = this.audio_context.createBufferSource(); 
                this.audio_source_sliding.buffer = this.sliding_track; 
                this.sliding_gain_node = this.audio_context.createGain(); 
                this.audio_source_sliding.connect(this.sliding_gain_node);
                this.sliding_gain_node.connect(this.audio_context.destination); 
                this.sliding_gain_node.gain.value = volume;
                this.audio_source_sliding.loop = true;
                this.audio_source_sliding.start(0);
                console.log("Start volume:", volume);
            } else {
                this.sliding_gain_node.gain.value = volume;
            }
        } else {
            if (this.audio_source_sliding !== null) {
                this.audio_source_sliding.stop();
                this.audio_source_sliding = null;
                this.sliding_gain_node = null;
            }
        }
    }

    update_distances() {
        for (var i = 0; i < this.collision_sprites.length; ++i) {
            let other = this.collision_sprites.sprites[i];

            if (other.kind !== "bouncing") continue;

            // Set the volume
            var dfactor = 500;
            var distance = modulus({
                x : this.player.x - other.x,
                y : this.player.y - other.y
            });
            if (distance < dfactor) {
                if (other.boinc_sound !== null) {
                    var volume = 1 - distance /  dfactor;

                    // Check if a bouncing has been setted
                    if (other.bouncing_toplay) {
                        playSound(this.audio_context, this.boinc_track, 0, volume);
                    }
                }
            } 
        }
    }

    refresh_stream_sounds() {
        let streaming = false;
        for (var i = 0; i < this.stream_sprites.length; ++i) {
            let stream = this.stream_sprites.sprites[i];

            let pforce = stream.player_collision(this.player);
            if (modulus(pforce) > 0 && ! this.pause && this.player.status !== "killed") {
                streaming = true;
                if (this.audio_source_stream === null) {
                    this.audio_source_stream = this.audio_context.createBufferSource(); 
                    this.audio_source_stream.buffer = this.stream_track; 
                    let gain_node = this.audio_context.createGain(); 
                    this.audio_source_stream.connect(gain_node);
                    gain_node.connect(this.audio_context.destination); 
                    gain_node.gain.value = 1;
                    this.audio_source_stream.loop = true;
                    this.audio_source_stream.start(0);
                    console.log("STREAM:", this.stream_track);
                }
            } 
        }
        if (!streaming) {
            if (this.audio_source_stream !== null) {
                this.audio_source_stream.stop();
                this.audio_source_stream = null;
                console.log("NO STREAM");
            }
        }
    }

    update(deltaTime) {
        this.refresh_stream_sounds();

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

            this.update_sliding();
            this.update_distances();

            this.check_pick();

            // Spawn glowing particle
            this.update_spawn_glowing(deltaTime);

            this.update_switches();

            // Check the death
            if (this.check_player_death()) {
                this.restarting = true;
                return "win";
            } else if (this.check_player_win()) {
                return "win";
            }
            return "idle";
        } else {
            return "idle";
        }
    }

    check_player_death() {
        let time = Date.now();
        if (this.player.check_collision(this.collision_sprites) || this.player.collide_with_perimeter(this.perimeter)) {
            destroy_geometry(this.player, this.visible_sprites);
            this.player.kill();
            this.player.velocity.x = 0;
            this.player.velocity.y = 0;
            this.death_trigger = time;

            // Play the death sound
            //this.die_sound.play()
            //this.die_track.start(0);
            playSound(this.audio_context, this.die_track, 0, 1);
        }

        if (this.death_trigger > 0 && time - this.death_trigger > this.death_timeout) {
            //this.player.relive([this.visible_sprites]);
            //this.player.x = this.spawn_point.x;
            //this.player.y = this.spawn_point.y;
            this.death_trigger = -1;
            this.end_trigger = time;
            this.restarting = true;
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

            //if (this.glurp_sound.paused) this.glurp_sound.play();
            let time = Date.now();
            if (time - this.glurp_trigger > this.glurp_timeout) {
                playSound(this.audio_context, this.glurp_track, 0, 1);
                this.glurp_trigger = time;
            }

            if (modulus(distance) < 5 && modulus(this.player.velocity) < 1 && this.end_trigger < 0) {
                this.end_trigger = time;
                playSound(this.audio_context, this.win_track, 0, 1);
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

    create_level(world_data, clean = true) {
        this.level_loaded = false;
        this.level = world_data;
        let self = this;

        console.log("Loading:", world_data);

        // Polish the level
        if (clean) this.reset();

        // Wait for the level to load completely;

        // Create the level
        //let world_data = JSON.parse(data);

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
            console.log("Perimeter not found");
        }

        // Generate the player
        if ("player" in world_data) {
            this.player = create_geometry_from_json(world_data.player, this.canvas);
            this.spawn_point.x = this.player.x;
            this.spawn_point.y = this.player.y;
            this.visible_sprites.add(this.player);
        } else {
            console.log("Player not found in");
        }

        if ("switches" in world_data) {
            for (var i = 0; i < world_data.switches.length; ++i) {
                let my_switch = new Switch(world_data.switches[i].position[0],
                    world_data.switches[i].position[1],
                    this.switch_image_off, this.switch_image_on, 
                    world_data.switches[i].deactivate_id,
                    this.canvas);
                my_switch.is_on = true;
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
            console.log("enemies not found");
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
        } else if (json_object.geometry === "three legs") {
            my_object = new ThreeLegs(position.x,
                position.y, json_object.edge_size, json_object.kind, canvas);
        } else if (json_object.geometry === "two legs") {
            my_object = new TwoLegs(position.x,
                position.y, json_object.edge_size, json_object.kind, canvas);
        } else if (json_object.geometry === "cross") {
            my_object = new Cross(position.x,
                position.y, json_object.edge_size, json_object.kind, canvas);
        } else {
            console.log("Error while parsing unkwnown geometry ", json_object.geometry);
            return null;
        }

        if ("flip" in json_object) {
            my_object.flip(json_object.flip.x, json_object.flip.y);
        }


        if ("balance" in json_object)
            if (json_object.balance) 
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