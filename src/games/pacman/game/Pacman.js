export class Pacman {
    constructor(x, y, tileSize) {
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
        this.speed = 2.1; // Pixels per frame
        this.dx = 0;
        this.dy = 0;
        this.nextDx = 0;
        this.nextDy = 0;

        this.radius = tileSize / 2 - 2;
        this.mouthOpen = 0;
        this.mouthSpeed = 0.2;
    }

    setDir(dx, dy) {
        this.nextDx = dx;
        this.nextDy = dy;

        // Instant turn if reversing
        if (this.dx === -dx && this.dy === -dy) {
            this.dx = dx;
            this.dy = dy;
        }
    }

    update(map) {
        // Attempt to turn
        // Check if we are center-ish of a tile to allow turning
        const centerTolerance = 3; // pixels
        const centerX = (Math.round(this.x / this.tileSize) * this.tileSize);
        const centerY = (Math.round(this.y / this.tileSize) * this.tileSize);

        const dist = Math.abs(this.x - centerX) + Math.abs(this.y - centerY);

        if (dist < centerTolerance) {
            // We are at a junction, try to set new direction
            if (this.nextDx !== 0 || this.nextDy !== 0) {
                if (!this.checkCollision(map, this.nextDx, this.nextDy)) {
                    this.x = centerX;
                    this.y = centerY;
                    this.dx = this.nextDx;
                    this.dy = this.nextDy;
                    this.nextDx = 0;
                    this.nextDy = 0;
                }
            }

            // Also check if current direction is hitting a wall (stop)
            if (this.checkCollision(map, this.dx, this.dy)) {
                this.dx = 0;
                this.dy = 0;
                // Snap to grid
                this.x = centerX;
                this.y = centerY;
            }
        }

        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        // Screen wrap (Tunnel)
        if (this.x < -this.tileSize) this.x = map.layout[0].length * this.tileSize;
        if (this.x > map.layout[0].length * this.tileSize) this.x = -this.tileSize;

        // Mouth animation
        this.mouthOpen += this.mouthSpeed;
        if (this.mouthOpen > 0.2 * Math.PI || this.mouthOpen < 0) {
            this.mouthSpeed = -this.mouthSpeed;
        }
    }

    checkCollision(map, dx, dy) {
        // Look ahead 1 tile
        const col = Math.round(this.x / this.tileSize) + dx;
        const row = Math.round(this.y / this.tileSize) + dy;
        return map.isWall(col, row);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.tileSize / 2, this.y + this.tileSize / 2);

        // Rotate based on direction
        let angle = 0;
        if (this.dx === 1) angle = 0;
        if (this.dx === -1) angle = Math.PI;
        if (this.dy === 1) angle = Math.PI / 2;
        if (this.dy === -1) angle = -Math.PI / 2;

        ctx.rotate(angle);

        // Draw Metallic Pacman (Gold Sphere look)
        const gradient = ctx.createRadialGradient(-2, -2, 2, 0, 0, this.radius);
        gradient.addColorStop(0, '#FFED8B'); // Highlight
        gradient.addColorStop(0.5, '#FFD700'); // Gold
        gradient.addColorStop(1, '#B8860B'); // Dark Gold Shadow

        ctx.fillStyle = gradient; // '#FFD700';

        ctx.beginPath();
        // Mouth wedge
        const mouth = (this.dx === 0 && this.dy === 0) ? 0 : Math.abs(this.mouthOpen);

        ctx.arc(0, 0, this.radius, mouth, Math.PI * 2 - mouth);
        ctx.lineTo(0, 0);
        ctx.fill();

        ctx.restore();
    }
}
