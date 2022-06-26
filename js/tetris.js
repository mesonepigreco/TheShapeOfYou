import {Geometry} from "./geometry.js";

export class ThreeLegs extends Geometry {
    constructor(x, y, edge_length, kind, canvas) {
        super(x, y, kind, canvas);

        this.edge_size = edge_length;
        let width = edge_length / 8;
        this.vertices = [
            {x : -edge_length/2, y : -width /2},
            {x : edge_length/2, y : -width /2},
            {x : edge_length/2, y : width / 2},
            {x : width/2, y : width/2},
            {x : width/2, y : width/2 + edge_length/2},
            {x : -width/2, y: width/2 + edge_length/2 },
            {x : -width/2, y: width/2 },
            {x: -edge_length/2, y:width/2}
        ];
    }
}

export class TwoLegs extends Geometry {
    constructor(x, y, edge_length, kind, canvas) {
        super(x, y, kind, canvas);

        this.edge_size = edge_length;
        let width = edge_length / 8;
        this.vertices = [
            {x : -width/2, y : -width /2},
            {x : edge_length/2, y : -width /2},
            {x : edge_length/2, y : width / 2},
            {x : width/2, y : width/2},
            {x : width/2, y : width/2 + edge_length/2},
            {x : -width/2, y: width/2 + edge_length/2 }
        ];
    }
}

export class Cross extends Geometry {
    constructor(x, y, edge_length, kind, canvas) {
        super(x, y, kind, canvas);

        this.edge_size = edge_length;
        let width = edge_length / 8;
        this.vertices = [
            {x : width/2, y : -edge_length/2},
            {x : width/2, y : -width/2},
            {x : edge_length / 2, y: -width/2},
            {x : edge_length / 2, y: width/2},
            {x : width/2, y: width/2},
            {x : width/2, y: edge_length/2},
            {x : -width/2, y: edge_length/2},
            {x : -width/2, y: width/2},
            {x : -edge_length/2, y: width/2},
            {x : -edge_length/2, y: -width/2},
            {x : -width/2, y:-width/2},
            {x : -width/2, y: - edge_length/2}
        ];
    }
}