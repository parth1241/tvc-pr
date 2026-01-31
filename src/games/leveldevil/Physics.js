export class Physics {
    constructor(gravity = 0.5) {
        this.gravity = gravity;
        this.friction = 0.8;
    }

    applyGravity(entity) {
        entity.vy += this.gravity;
        entity.y += entity.vy;
    }

    applyFriction(entity) {
        entity.vx *= this.friction;
        entity.x += entity.vx;
    }

    // AABB Collision Detection
    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    // Resolve collision for static platforms
    // Returns direction of collision: 'top', 'bottom', 'left', 'right', or null
    resolveCollision(entity, platform) {
        const dx = (entity.x + entity.width / 2) - (platform.x + platform.width / 2);
        const dy = (entity.y + entity.height / 2) - (platform.y + platform.height / 2);
        const width = (entity.width + platform.width) / 2;
        const height = (entity.height + platform.height) / 2;
        const crossWidth = width * dy;
        const crossHeight = height * dx;

        if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
            if (crossWidth > crossHeight) {
                if (crossWidth > -crossHeight) {
                    // Collision from bottom
                    entity.y = platform.y + platform.height;
                    entity.vy = 0;
                    return 'bottom';
                } else {
                    // Collision from left
                    entity.x = platform.x - entity.width;
                    entity.vx = 0;
                    return 'left';
                }
            } else {
                if (crossWidth > -crossHeight) {
                    // Collision from right
                    entity.x = platform.x + platform.width;
                    entity.vx = 0;
                    return 'right';
                } else {
                    // Collision from top
                    entity.y = platform.y - entity.height;
                    entity.vy = 0;
                    entity.isGrounded = true;
                    return 'top';
                }
            }
        }
        return null;
    }
}
