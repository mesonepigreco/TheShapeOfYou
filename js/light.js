

// Draw a glowing circle
export function draw_a_glow(context, radius, pos, color = "#111") {
    context.save();
    
    // Create a gradient
    var gradient = context.createRadialGradient(pos.x, pos.y, 
        radius / 2, pos.x, pos.y, radius);

    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "#000");

    context.globalCompositeOperation = "screen";
    context.fillStyle = gradient;
    context.fillRect(pos.x - radius, pos.y - radius, 2*radius, 2*radius);
    context.restore();
}