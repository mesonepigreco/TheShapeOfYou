import Triangle  from "./triangle.js";
import World from "./world.js";


// Retrive the canvas element
const canvas = document.getElementById("game-screen");
const context = canvas.getContext("2d");

const world = new World(canvas, context);

// Generate the world from the level
world.create_level("../levels/level_1.json");

const you_lost = document.getElementById("you-lost");
const you_won = document.getElementById("you-won");

var oldTime = 0;
let status = "idle";

function animation(timeStamp) {
    var deltaT = timeStamp - oldTime;

    // Avoid crazy things happening when switching tabs
    // And physics breaking (50 ms correspond to 20 fps)
    if (deltaT > 50) deltaT = 50;

    // Draw all
    if (status === "idle" && world.ready) {
        status = world.update(deltaT);
        world.draw();
    }
    oldTime = timeStamp;

    // Check the status
    if (status === "death") {
        you_lost.style.opacity = 1;
    } else if (status === "win") {
        you_won.style.opacity = 1;
    }

    requestAnimationFrame(animation);
}
animation(0);