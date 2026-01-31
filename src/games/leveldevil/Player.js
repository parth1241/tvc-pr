export class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.speed = 0.8;
        this.jumpForce = -13; // Increased for better reach
        this.isGrounded = false;
        this.color = '#FFD700';
    }

    update(input) {
        if (input.left) {
            this.vx -= this.speed;
        }
        if (input.right) {
            this.vx += this.speed;
        }
        if (input.up && this.isGrounded) {
            this.vy = this.jumpForce;
            this.isGrounded = false;
        }
    }

    draw(ctx, sprite) {
        if (sprite && sprite.complete) {
            // Check direction if we want flipping
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

            // Simple squash/stretch could go here based on vy

            ctx.drawImage(sprite, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            // Fallback
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Eyes fallback
            ctx.fillStyle = '#000';
            // Eyes
            ctx.fillRect(this.x + 8, this.y + 8, 4, 4);
            ctx.fillRect(this.x + 20, this.y + 8, 4, 4);
            // Mouth
            ctx.fillRect(this.x + 8, this.y + 20, 16, 4);
        }
    }
}
