import Geometry from "./geometry.js";

export default class Square extends Geometry {
    constructor(x, y, kind, edge_length, canvas) {
        super(x, y, kind, canvas);

        this.vertices = [
            {x : -edge_length/2, y : -edge_length /2},
            {x : -edge_length/2, y : edge_length /2},
            {x : edge_length/2, y : edge_length /2},
            {x : edge_length/2, y : -edge_length /2}
        ];

    }
}