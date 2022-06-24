import Triangle  from "./triangle.js";
import World from "./world.js";


// Retrive the canvas element
const canvas = document.getElementById("game-screen");
const context = canvas.getContext("2d");

const world = new World(canvas, context);

const you_lost = document.getElementById("you-lost");

var oldTime = 0;
let status = "idle";
function animation(timeStamp) {
    var deltaT = timeStamp - oldTime;

    // Draw all
    if (status === "idle") {
        status = world.update(deltaT);
    }
    world.draw();
    oldTime = timeStamp;

    // Check the status
    if (status === "death") {
        you_lost.style.opacity = 1;
    }

    requestAnimationFrame(animation);
}
animation(0);