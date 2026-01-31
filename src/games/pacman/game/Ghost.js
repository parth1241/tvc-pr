export class Ghost {
    constructor(x, y, tileSize, colorType, map) {
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
        this.colorType = colorType; // 'red', 'pink', 'cyan', 'orange'
        this.speed = 1.3; // Slower for better playability
        this.dx = 0;
        this.dy = 0;
        this.map = map;

        // Initial random direction
        this.dx = 1;

        this.lastCol = -1;
        this.lastRow = -1;

        this.startX = x;
        this.startY = y;
        this.isFrightened = false;
        this.originalColor = colorType;
    }

    makeFrightened() {
        this.isFrightened = true;
        this.colorType = 'blue';
        // Reverse direction immediately? Optional, but good for gameplay
        this.dx = -this.dx;
        this.dy = -this.dy;
    }

    makeNormal() {
        this.isFrightened = false;
        this.colorType = this.originalColor;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.isFrightened = false;
        this.colorType = this.originalColor;
        this.dx = 0; // Wait a bit?
        this.dy = -1; // Exit house
    }

    update(pacman) {
        const currCol = Math.round(this.x / this.tileSize);
        const currRow = Math.round(this.y / this.tileSize);

        // precise center of current tile
        const centerX = currCol * this.tileSize;
        const centerY = currRow * this.tileSize;

        const dist = Math.abs(this.x - centerX) + Math.abs(this.y - centerY);
        const centerTolerance = 3;

        // Only decide turn if we are at center AND we haven't decided for this tile yet
        // OR if we are completely stuck (dx=0, dy=0)
        if ((dist < centerTolerance && (currCol !== this.lastCol || currRow !== this.lastRow)) || (this.dx === 0 && this.dy === 0)) {
            // Snap to grid
            this.x = centerX;
            this.y = centerY;

            this.lastCol = currCol;
            this.lastRow = currRow;

            // Decide new direction
            this.chooseDirection(pacman);
        }

        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        // Screen wrap
        if (this.x < -this.tileSize) this.x = this.map.layout[0].length * this.tileSize;
        if (this.x > this.map.layout[0].length * this.tileSize) this.x = -this.tileSize;
    }

    chooseDirection(pacman) {
        // Get valid directions (not 180 turn unless stuck)
        const validMoves = [];
        const dirs = [
            { dx: 0, dy: -1 }, // Up
            { dx: 0, dy: 1 },  // Down
            { dx: -1, dy: 0 }, // Left
            { dx: 1, dy: 0 }   // Right
        ];

        for (let d of dirs) {
            // Don't reverse immediately
            if (d.dx === -this.dx && d.dy === -this.dy) continue;

            if (!this.checkCollision(d.dx, d.dy)) {
                validMoves.push(d);
            }
        }

        // If dead end (only reverse available), add it
        if (validMoves.length === 0) {
            // Reverse
            if (!this.checkCollision(-this.dx, -this.dy)) {
                validMoves.push({ dx: -this.dx, dy: -this.dy });
            }
        }

        // AI: Pick move that minimizes distance to target
        // Simple Chase: Target = Pacman
        // 'Scatter' logic could be added later.
        let bestMove = validMoves[0];
        let minDist = 999999;

        // Different personalities (Metallic types)
        let targetX = pacman.x;
        let targetY = pacman.y;

        if (this.colorType === 'pink') { // Ambush (4 tiles ahead)
            targetX += pacman.dx * 4 * this.tileSize;
            targetY += pacman.dy * 4 * this.tileSize;
        } else if (this.colorType === 'cyan') { // Randomish
            if (Math.random() < 0.5) {
                targetX = Math.random() * 500;
                targetY = Math.random() * 500;
            }
        } else if (this.colorType === 'orange') { // Shy
            const d = Math.sqrt((this.x - pacman.x) ** 2 + (this.y - pacman.y) ** 2);
            if (d < 8 * this.tileSize) {
                targetX = 0; // Run to corner
                targetY = 0;
            }
        }

        for (let move of validMoves) {
            const nextX = this.x + move.dx * this.tileSize;
            const nextY = this.y + move.dy * this.tileSize;
            const d = Math.sqrt((nextX - targetX) ** 2 + (nextY - targetY) ** 2);

            if (d < minDist) {
                minDist = d;
                bestMove = move;
            }
        }

        if (bestMove) {
            this.dx = bestMove.dx;
            this.dy = bestMove.dy;
        }
    }

    checkCollision(dx, dy) {
        const col = Math.round(this.x / this.tileSize) + dx;
        const row = Math.round(this.y / this.tileSize) + dy;
        return this.map.isWall(col, row);
    }

    draw(ctx) {
        const x = this.x;
        const y = this.y;
        const size = this.tileSize;

        ctx.save();

        // Metallic Colors
        let colorBase, colorHigh, colorShadow;
        switch (this.colorType) {
            case 'red': // Crimson/Copper
                colorBase = '#A52A2A';
                colorHigh = '#FF6347';
                colorShadow = '#800000';
                break;
            case 'pink': // Rose Gold
                colorBase = '#FF69B4';
                colorHigh = '#FFB6C1';
                colorShadow = '#C71585';
                break;
            case 'cyan': // Platinum/Steel
                colorBase = '#4682B4';
                colorHigh = '#87CEEB';
                colorShadow = '#2F4F4F';
                break;
            case 'orange': // Bronze
                colorBase = '#CD7F32';
                colorHigh = '#FFA07A';
                colorShadow = '#8B4513';
                break;
        }

        // Ghost Body (Bell curve shape)
        ctx.beginPath();
        ctx.moveTo(x + 2, y + size);
        ctx.lineTo(x + 2, y + size / 2);
        ctx.bezierCurveTo(x + 2, y, x + size - 2, y, x + size - 2, y + size / 2);
        ctx.lineTo(x + size - 2, y + size);
        // Skirt (Zigzag)
        for (let i = 1; i <= 3; i++) {
            ctx.lineTo(x + size - 2 - (i * size / 3.5), y + size - 4);
            ctx.lineTo(x + size - 2 - (i * size / 3.5) - size / 7, y + size);
        }
        ctx.closePath();

        const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
        gradient.addColorStop(0, colorHigh);
        gradient.addColorStop(0.5, colorBase);
        gradient.addColorStop(1, colorShadow);

        ctx.fillStyle = gradient;
        ctx.fill();

        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x + size * 0.35, y + size * 0.4, size * 0.15, 0, Math.PI * 2);
        ctx.arc(x + size * 0.75, y + size * 0.4, size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        const px = this.dx * 2;
        const py = this.dy * 2;
        ctx.arc(x + size * 0.35 + px, y + size * 0.4 + py, size * 0.07, 0, Math.PI * 2);
        ctx.arc(x + size * 0.75 + px, y + size * 0.4 + py, size * 0.07, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
