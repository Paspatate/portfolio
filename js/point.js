function init_speed() {
    let random_amount = (Math.random() * 2) - 1;
    let scaling = 0.1;
    return random_amount * scaling;
}

const canvas = document.querySelector("#frame")

export class Point {
    x;
    y;

    vx;
    vy;

    // constructor(x, y) {
    //     this.x = x;
    //     this.y = y;

    //     this.vx = 0.5;
    //     this.vy = 1;
    // }

    constructor() {
        this.x = Math.random() * canvas.clientWidth;
        this.y = Math.random() * canvas.clientHeight;

        this.vx = init_speed();
        this.vy = init_speed();
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.x > 1920 || this.x < 0) {
            this.vx *= -1;
        }

        if (this.y > 1080 || this.y < 0) {
            this.vy *= -1;
        }
    }

    flattened_pos() {
        return [this.x, this.y, 0.0, 1.0]
    }
}
