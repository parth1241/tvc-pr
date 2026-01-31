import { levels } from './levels.js';

export class LevelManager {
    constructor() {
        this.currentLevelIndex = 0;
        this.currentLevel = null;
    }

    loadLevel(index) {
        if (index >= 0 && index < levels.length) {
            this.currentLevelIndex = index;
            // Deep copy to reset state if needed
            this.currentLevel = JSON.parse(JSON.stringify(levels[index]));
            return this.currentLevel;
        }
        return null;
    }

    setAssets(assets) {
        this.assets = assets;
    }

    draw(ctx) {
        if (!this.currentLevel) return;

        // Draw Platforms (Tiles)
        for (const plat of this.currentLevel.platforms) {
            if (this.assets && this.assets.tile && this.assets.tile.complete) {
                // Tiling logic
                const ts = 32; // Assuming 32x32 tiles
                const cols = Math.ceil(plat.width / ts);
                const rows = Math.ceil(plat.height / ts);

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        // Draw tile (clipped to fit plat dimensions)
                        const tx = plat.x + c * ts;
                        const ty = plat.y + r * ts;
                        const w = Math.min(ts, plat.x + plat.width - tx);
                        const h = Math.min(ts, plat.y + plat.height - ty);

                        ctx.drawImage(this.assets.tile, 0, 0, w, h, tx, ty, w, h);
                    }
                }
            } else {
                ctx.fillStyle = '#555';
                ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            }
        }

        // Draw Hazards (Spikes)
        for (const haz of this.currentLevel.hazards) {
            if (this.assets && this.assets.spike && this.assets.spike.complete) {
                // Draw spikes
                const ts = 32;
                const count = Math.ceil(haz.width / ts);
                for (let i = 0; i < count; i++) {
                    // Clip if needed, but spikes usually 32x32
                    ctx.drawImage(this.assets.spike, haz.x + i * ts, haz.y, ts, ts);
                }
            } else {
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(haz.x, haz.y, haz.width, haz.height);
            }
        }

        // Draw Goal (Door)
        if (this.currentLevel.goal) {
            const g = this.currentLevel.goal;
            if (this.assets && this.assets.door && this.assets.door.complete) {
                ctx.drawImage(this.assets.door, g.x, g.y, g.width, g.height);
            } else {
                ctx.fillStyle = '#32CD32';
                ctx.fillRect(g.x, g.y, g.width, g.height);
            }
        }
    }
}
