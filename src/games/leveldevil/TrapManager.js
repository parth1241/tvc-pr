export class TrapManager {
    constructor(physics) {
        this.physics = physics;
        this.frame = 0;
    }

    update(level) {
        this.frame++;

        // Update Moving Platforms/Hazards
        if (level.traps) {
            for (const trap of level.traps) {
                this.updateTrap(trap);
            }
        }
    }

    updateTrap(trap) {
        if (trap.type === 'move') {
            // Simple ping-pong movement
            // define range in trap data: startX, startY, endX, endY, speed

            // Calculate progress 0..1..0
            // distance = speed * time
            // We need state in the trap object or calculate from time

            if (!trap.state) {
                trap.state = { t: 0, dir: 1 };
            }

            trap.state.t += trap.speed * trap.state.dir;
            if (trap.state.t >= 1) {
                trap.state.t = 1;
                trap.state.dir = -1;
            } else if (trap.state.t <= 0) {
                trap.state.t = 0;
                trap.state.dir = 1;
            }

            trap.x = trap.startX + (trap.endX - trap.startX) * trap.state.t;
            trap.y = trap.startY + (trap.endY - trap.startY) * trap.state.t;
        } else if (trap.type === 'disappear') {
            // Toggle visible/collision every N frames
            if (!trap.state) trap.state = { counter: 0, visible: true };

            trap.state.counter++;
            if (trap.state.counter > trap.interval) {
                trap.state.counter = 0;
                trap.state.visible = !trap.state.visible;
            }

            // If invisible, move it offscreen or disable collision tag?
            // Since Physics checks 'platforms' array, we might need to modify the array or physics check.
            // Better: Physics checks trap.active property.
            trap.active = trap.state.visible;
        }
    }
}
