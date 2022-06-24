import Geometry from "./geometry.js";

export default class BouncingEnemy extends Geometry {
    constructor(x, y, kind, canvas, groups = [], collision_group = []) {
        super(x, y, kind, canvas, groups);

        this.kind = "bouncing enemy"
        this.collision_group = collision_group;
    }

    update(deltaTime, camera) {
        super.update(camera);

        // Check bouncing and invert the direction
        if (super.check_collision(this.collision_group)) {
            this.direction.x *= -1;
            this.direction.y *= -1;
            this.spinning_velocity *= -1;
        }
    }

}