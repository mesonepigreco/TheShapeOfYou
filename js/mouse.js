
export default class Mouse {
    constructor(canvas) {
        this.x = 0;
        this.y = 0;


        this.is_clicked = false;

        let self = this;

        canvas.addEventListener("mousemove", (event) => {
            self.x = event.offsetX;
            self.y = event.offsetY;
            //console.log("Mooove:", self.x, self.y, "original pos:",  event.offsetX,  event.offsetY);
        });

        canvas.addEventListener("mousedown", (event) => {
            self.is_clicked = true;
            //console.log("Clicked:", self.is_clicked);
        });

        document.addEventListener("mouseup", (event) => {
            self.is_clicked = false;
            //console.log("Clicked:", self.is_clicked);
        });
    }
}