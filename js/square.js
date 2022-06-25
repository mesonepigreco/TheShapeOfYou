import {Geometry} from "./geometry.js";

export default class Square extends Geometry {
    constructor(x, y, edge_length, kind, canvas) {
        super(x, y, kind, canvas);

        this.edge_size = edge_length;
        this.vertices = [
            {x : -edge_length/2, y : -edge_length /2},
            {x : -edge_length/2, y : edge_length /2},
            {x : edge_length/2, y : edge_length /2},
            {x : edge_length/2, y : -edge_length /2}
        ];

    }
}