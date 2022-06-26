
export default class Mouse {
    constructor(canvas) {
        this.x = 0;
        this.y = 0;

        this.scale_x = canvas.width / canvas.clientWidth;
        this.scale_y = canvas.height / canvas.clientHeight;
        console.log("SCALE:", canvas.style.width, canvas.width );


        this.is_clicked = false;

        let self = this;

        canvas.addEventListener("mousemove", (event) => {
            self.x = event.offsetX *  this.scale_x;
            self.y = event.offsetY*  this.scale_y;
            //console.log("Mooove:", self.x, self.y, "original pos:",  event.offsetX,  event.offsetY);
        });

        canvas.addEventListener("mousedown", (event) => {
            self.is_clicked = true;
            //console.log("Clicked:", self.is_clicked);
        });
        canvas.addEventListener("touchstart", (event) => {
            self.x = event.offsetX *  this.scale_x;
            self.y = event.offsetY*  this.scale_y;
            self.is_clicked = true;
        });
        canvas.addEventListener("touchmove", (event) => {
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent("mousemove", {
              clientX: touch.clientX,
              clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener("touchend", (event) => {
            var mouseEvent = new MouseEvent("mouseup", {});
            self.is_clicked = true;
            canvas.dispatchEvent(mouseEvent);
        });

        document.addEventListener("mouseup", (event) => {
            self.is_clicked = false;
            //console.log("Clicked:", self.is_clicked);
        });

        // Prevent scrolling when touching the canvas
        document.body.addEventListener("touchstart", function (e) {
            e.preventDefault();
        }, false);
        document.body.addEventListener("touchend", function (e) {
            e.preventDefault();
        }, false);
        document.body.addEventListener("touchmove", function (e) {
            e.preventDefault();
        }, false);
    }
}