import Triangle from "./triangle.js";
import Square from "./square.js";
import SpriteGroup from "./groups.js";

export default class World {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.context = context;
        this.camera = {
            x : 0,
            y : 0
        };


        this.player = new Triangle(400, 300, "player", canvas, [], this.camera);

        this.obstacles = [
            new Square(400, 100, "obstacle", 100, canvas)
        ];
        this.obstacles[0].color = "#0a0"
        this.obstacles[0].rotation_angle = 0.2;

        this.visible_sprites = new SpriteGroup();
        this.collision_sprites = new SpriteGroup();

        this.visible_sprites.add(this.player);
        for (var i = 0; i < this.obstacles.length; ++i) {
            this.visible_sprites.add(this.obstacles[i]);
            this.collision_sprites.add(this.obstacles[i]);
        }
    }

    update(deltaTime) {
        this.visible_sprites.update(deltaTime, this.camera, this.collision_sprites);

        // Update the camera
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;

        // Check the death
        if (this.check_player_death()) {
            return "death";
        }
        return "idle";
    }

    check_player_death() {
        return this.player.check_collision(this.collision_sprites);
    }

    draw() {
        // Clear the area
        this.context.clearRect(0,0, this.canvas.width, this.canvas.height);

        // Draw the visilbe sprites
        this.visible_sprites.draw(this.context, this.camera);
    }
}