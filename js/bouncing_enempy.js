import Geometry from "./geometry.js";

export default class BouncingEnemy extends Geometry {
    constructor(x, y, kind, canvas, groups = [], collision_group = []) {
        super(x, y, kind, canvas, groups);

        this.kind = "bouncing"
        this.collision_group = collision_group;
    }

}