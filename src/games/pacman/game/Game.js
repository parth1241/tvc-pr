import { Map } from './Map.js';
import { Pacman } from './Pacman.js';
import { Ghost } from './Ghost.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Dynamic Sizing
        // Check window size and max out
        const safeWidth = window.innerWidth - 20; // Padding
        const safeHeight = window.innerHeight - 80; // Padding for header/branding

        // 15 cols, 15 rows
        const cols = 15;
        const rows = 15;

        const maxTileWidth = Math.floor(safeWidth / cols);
        const maxTileHeight = Math.floor(safeHeight / rows);

        this.tileSize = Math.min(maxTileWidth, maxTileHeight);

        // Ensure minimum size or scale
        if (this.tileSize < 10) this.tileSize = 10;

        this.map = new Map(this.tileSize); // Pass new tile size to Map
        this.columns = cols;
        this.rows = rows;

        this.canvas.width = this.columns * this.tileSize;
        this.canvas.height = this.rows * this.tileSize;

        this.initGame();

        this.lastTime = 0;

        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);

        this.setupInput();

        // Handle Resize
        window.addEventListener('resize', () => {
            // For now, reload to simplify state sync
            location.reload();
        });
    }

    initGame() {
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 90; // 90 seconds
        this.gameState = 'START'; // START, PLAYING, GAMEOVER
        document.getElementById('score').innerText = this.score;

        // Spawn Pacman at bottom center (7, 11) - based on new map
        this.pacman = new Pacman(7 * this.tileSize, 11 * this.tileSize, this.tileSize);

        // Spawn Ghosts near center house (7, 7)
        this.ghosts = [
            new Ghost(7 * this.tileSize, 5 * this.tileSize, this.tileSize, 'red', this.map), // Outside top
            new Ghost(6 * this.tileSize, 7 * this.tileSize, this.tileSize, 'pink', this.map), // Inside
            new Ghost(7 * this.tileSize, 7 * this.tileSize, this.tileSize, 'cyan', this.map), // Inside
            new Ghost(8 * this.tileSize, 7 * this.tileSize, this.tileSize, 'orange', this.map) // Inside
        ];

        // Cache DOM elements
        this.timerBox = document.getElementById('timer-val');
        this.livesBox = document.getElementById('lives-val');
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            if (this.gameState === 'START') {
                if (e.key === 'Enter') {
                    this.gameState = 'PLAYING';
                }
                return;
            }
            if (this.gameState === 'GAMEOVER' || this.gameState === 'WIN') {
                if (e.key === 'Enter') {
                    this.initGame();
                    this.gameState = 'PLAYING';
                }
                return;
            }

            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
                e.preventDefault();
            }

            switch (e.key) {
                case 'ArrowUp': this.pacman.setDir(0, -1); break;
                case 'ArrowDown': this.pacman.setDir(0, 1); break;
                case 'ArrowLeft': this.pacman.setDir(-1, 0); break;
                case 'ArrowRight': this.pacman.setDir(1, 0); break;
            }
        });
    }

    loop(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.gameState === 'PLAYING') {
            this.timeLeft -= deltaTime;
            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.handleGameOver();
            }
            this.update();
        }
        this.draw();

        requestAnimationFrame(this.loop);
    }

    update() {
        this.pacman.update(this.map);

        for (const ghost of this.ghosts) {
            ghost.update(this.pacman);
        }

        // Check eating
        const col = Math.round(this.pacman.x / this.tileSize);
        const row = Math.round(this.pacman.y / this.tileSize);

        const points = this.map.eat(col, row);
        if (points > 0) {
            this.score += points;
            document.getElementById('score').innerText = this.score;

            if (points === 50) { // Power Pill
                this.activatePowerMode();
            }

            if (this.map.getPelletCount() === 0) {
                this.gameState = 'WIN';
            }
        }

        // Check Ghost Collision
        const hitDist = this.tileSize * 0.8;
        for (const ghost of this.ghosts) {
            const dx = this.pacman.x - ghost.x;
            const dy = this.pacman.y - ghost.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < hitDist) {
                if (ghost.isFrightened) {
                    // Eat Ghost
                    this.score += 200;
                    document.getElementById('score').innerText = this.score;
                    ghost.reset(); // Send back to house
                } else {
                    this.handleDeath();
                }
            }
        }
    }

    activatePowerMode() {
        this.ghosts.forEach(g => g.makeFrightened());

        // Reset timer if already active? For now, simple overwrite
        if (this.powerTimer) clearTimeout(this.powerTimer);

        this.powerTimer = setTimeout(() => {
            this.ghosts.forEach(g => g.makeNormal());
        }, 10000); // 10 seconds of invincibility
    }

    handleDeath() {
        this.lives--;
        if (this.lives <= 0) {
            this.handleGameOver();
        } else {
            // Respawn positions (simplified reset)
            this.pacman.x = 7 * this.tileSize;
            this.pacman.y = 11 * this.tileSize;
            // Maybe reset ghosts too? Yes usually
            this.ghosts.forEach(g => {
                // Simplified reset to spawn
                g.x = g.startX || 7 * this.tileSize; // Ideally save start pos
                g.y = g.startY || 5 * this.tileSize;
            });
        }
    }

    handleGameOver() {
        this.gameState = 'GAMEOVER';
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.map.draw(this.ctx);
        this.pacman.draw(this.ctx);
        for (const ghost of this.ghosts) {
            ghost.draw(this.ctx);
        }

        // Update DOM HUD
        if (this.livesBox) this.livesBox.innerText = this.lives;
        if (this.timerBox) this.timerBox.innerText = Math.ceil(this.timeLeft);

        if (this.gameState === 'START') {
            this.drawOverlay('THAPAR VENTURE CLUB', 'PRESS ENTER TO START', '#FFD700');
        } else if (this.gameState === 'GAMEOVER') {
            this.drawOverlay('GAME OVER', 'PRESS ENTER TO RESTART', '#DC143C');
        } else if (this.gameState === 'WIN') {
            this.drawOverlay('YOU WIN!', 'YOU CAN COLLECT YOUR PRIZE NOW', '#32CD32');
        }
    }

    drawOverlay(title, subtitle, color) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Metallic Border for overlay
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(40, this.canvas.height / 2 - 60, this.canvas.width - 80, 120);

        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 15;

        this.ctx.font = 'bold 30px "Courier New"';
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.canvas.width / 2, this.canvas.height / 2 - 10);

        this.ctx.shadowBlur = 0; // Reset for subtitle

        this.ctx.font = '16px "Courier New"';
        this.ctx.fillStyle = '#EEE';
        this.ctx.fillText(subtitle, this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
}
