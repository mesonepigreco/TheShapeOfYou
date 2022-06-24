export default class Keyboard {
    constructor() {
        this.keys = {
        };

        let self = this;
        document.addEventListener("keydown", (event) => {
            self.keys[event.key] = true;

            if (event.target == document.body) 
                event.preventDefault();
        });
        document.addEventListener("keyup", (event) => {
            self.keys[event.key] = false;
        });
    }
}