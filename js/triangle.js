import Geometry from "./geometry.js";

export default class Triangle extends Geometry {
    constructor(x, y, kind, canvas, groups = []) {
        super(x, y, kind, canvas, groups);

        var edge_length = 100;

        this.vertices = [
            {x : -edge_length/2, y : -edge_length * Math.sqrt(3) / 6},
            {x : 0, y :  edge_length * Math.sqrt(3) / 3},
            {x : edge_length/2, y : -edge_length * Math.sqrt(3) / 6}
        ];

    }
}