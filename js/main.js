import Triangle  from "./triangle.js";
import World from "./world.js";

// Import the levels
import level1 from "../levels/level_1.js";
import level2 from "../levels/level_2.js";
import level3 from "../levels/level_3.js";
import level4 from "../levels/level_4.js";
import level5 from "../levels/level_5.js";
import level6 from "../levels/level_6.js";

const levels = [level1, level2, level3, level4, level5, level6];//, level2, level3];
console.log(level1);

// Retrive the canvas element
const canvas = document.getElementById("game-screen");
const context = canvas.getContext("2d");



const world = new World(canvas, context);

// Generate the world from the level
var current_level = 0;

world.create_level(levels[current_level]);

const you_lost = document.getElementById("you-lost");
const you_won = document.getElementById("you-won");

// Final screen
const finalImage = new Image();
finalImage.src = "background.png";



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
        if (!world.restarting)
            current_level++;
        world.restarting = false;

        console.log("STATUS:", status, "LEVEL:", current_level);

        if (current_level == levels.length) {
            status = "end"; 
        } else {
            world.reset();
            world.create_level(levels[current_level]);
            status = "idle";
    
            console.log("WORLD TRIGGER:", world.start_trigger, world.end_trigger);
        }


        /*
        you_won.style.opacity = 1;
        you_won.style.left = "50%";
        you_won.style.top = "50%";*/
    } else if (status === "end") {
        // Show the final value
        context.clearRect(0,0, canvas.width, canvas.height);
        context.drawImage(finalImage, 0, 0);
        console.log("IMAGE:", finalImage);

        // Draw the text
        context.save();
        context.font = "24px press-start";
        context.fillStyle = "#eee";
        context.textAlign = "center";
        context.fillText("Thank you for playing", canvas.width / 2, canvas.height/2);
        context.fillText("by mesonepigreco (GeoJam 2022)", canvas.width / 2, canvas.height*3/4.);
        context.restore();
    }

    requestAnimationFrame(animation);
}
animation(0);