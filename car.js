class Car {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acc = 0.08;
        this.maxSpeed = 10;
        this.friction = 0.008;
        this.angle = 0;
        this.turnAngle = 0.02;
        this.collision = false;

        this.sensor = new Sensor(this);

        this.controls = new Controls();
    }

    update(roadBorders) {
        this.#move();
        this.polygon = this.#createPolygon();

        this.collision = this.#assessDamage(roadBorders);
        this.sensor.update(roadBorders);
    }

    #assessDamage(roadBorders) {
        return roadBorders.some((border) => {
            if (polysIntersect(this.polygon, border)) return true;
        });
    }

    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2; // distance from centre to one of the corners
        const alpha = Math.atan2(this.width, this.height); // angle between diagonal and a long side

        // TR POINT
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        });

        // TL POINT
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        });

        // BL POINT
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });

        // BR POINT
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });

        return points;
    }

    #move() {
        if (this.controls.forward) {
            this.speed +=
                this.speed < 0 ? this.acc : this.acc * (1 / (1 + this.speed));
        } else if (this.controls.reverse) {
            this.speed -= this.speed > 0 ? this.acc : this.acc / 5;
        } else if (Math.abs(this.speed) < this.friction * 50) this.speed = 0;

        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        if (this.speed < -this.maxSpeed / 3) this.speed = -this.maxSpeed / 3;

        let frictionMod = 1;
        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1;

            if (this.controls.left) {
                this.angle += this.turnAngle * flip;
                frictionMod += this.speed / 5;
            }
            if (this.controls.right) {
                this.angle -= this.turnAngle * flip;
                frictionMod += this.speed / 5;
            }
        }

        if (this.speed > 0) this.speed -= this.friction * frictionMod;
        if (this.speed < 0) this.speed += this.friction * frictionMod;

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
        console.log(this.speed);
    }

    draw(ctx) {
        ctx.fillStyle = this.collision ? "gray" : "orange";
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        this.sensor.draw(ctx);
    }
}
