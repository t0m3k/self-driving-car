class Car {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.speed = 0;
    this.acc = 0.03;
    this.maxSpeed = 4;
    this.friction = 0.01;
    this.angle = 0;
    this.turnAngle = 0.03;
    this.collision = false;

    this.sensor = new Sensor(this);

    this.controls = new Controls();
  }

  update(roadBorders) {
    this.#move();
    this.polygon = this.#createPolygon();
    console.log("Going to assess damage");

    this.collision = this.#assessDamage(roadBorders);
    console.log(this.collision);
    this.sensor.update(roadBorders);
  }

  #assessDamage(roadBorders) {
    console.log("Assesing damage");
    return roadBorders.some((border) => {
      if (polysIntersect(this.polygon, border)) return true;
    });
  }

  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.width, this.height) / 2; // distance from centre to one of the corners
    const alpha = Math.atan2(this.width, this.height); // BL to TR corner

    // TR POINT
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad,
    });

    // TL POINT
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad,
    });

    // BL POINT
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
    });

    // BR POINT
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
    });

    return points;
  }

  #move() {
    if (this.controls.forward) {
      this.speed += this.acc;
    }
    if (this.controls.reverse) {
      this.speed -= this.acc;
    }

    if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
    if (this.speed < -this.maxSpeed / 3) this.speed = -this.maxSpeed / 3;

    if (this.speed > 0) this.speed -= this.friction;
    if (this.speed < 0) this.speed += this.friction;

    if (Math.abs(this.speed) < this.friction) this.speed = 0;

    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1;

      if (this.controls.left) this.angle += this.turnAngle * flip;
      if (this.controls.right) this.angle -= this.turnAngle * flip;
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
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
