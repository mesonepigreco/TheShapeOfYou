import Triangle  from "./triangle.js";
import World from "./world.js";


// Retrive the canvas element
const canvas = document.getElementById("game-screen");
const context = canvas.getContext("2d");

const world = new World(canvas, context);

// Generate the world from the level
var current_level = 1;

world.create_level("../levels/level_"+ String(current_level) + ".json");

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
    if (status === "idle" && world.ready()) {
        if (world.start_trigger === -1) world.start_trigger = Date.now();
        status = world.update(deltaT);
        world.draw();
    }
    oldTime = timeStamp;

    // Check the status
    if (status === "death") {
        you_lost.style.opacity = 1;
        you_lost.style.left = "50%";
        you_lost.style.top = "50%";
    } else if (status === "win") {
        current_level++;

        console.log("STATUS:", status, "LEVEL:", current_level);

        world.reset();
        world.create_level( "../levels/level_"+ String(current_level) + ".json");
        status = "idle";

        console.log("WORLD TRIGGER:", world.start_trigger, world.end_trigger);

        /*
        you_won.style.opacity = 1;
        you_won.style.left = "50%";
        you_won.style.top = "50%";*/
    }

    requestAnimationFrame(animation);
}
animation(0);