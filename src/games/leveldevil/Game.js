import { Physics } from './Physics.js';
import { Player } from './Player.js';
import { LevelManager } from './LevelManager.js';
import { TrapManager } from './TrapManager.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.physics = new Physics();
        this.levelManager = new LevelManager();
        this.trapManager = new TrapManager(this.physics);
        this.player = null;

        this.keys = {
            left: false,
            right: false,
            up: false
        };

        // Load Assets
        this.assets = {
            player: new Image(),
            tile: new Image(),
            spike: new Image(),
            door: new Image(),
            background: new Image()
        };
        this.assets.player.src = '/src/games/leveldevil/assets/player_humanoid.png';
        this.assets.tile.src = '/src/games/leveldevil/assets/tile.png';
        this.assets.spike.src = '/src/games/leveldevil/assets/spike.png';
        this.assets.door.src = '/src/games/leveldevil/assets/door.png';
        this.assets.background.src = '/src/games/leveldevil/assets/background.png';

        this.levelManager.setAssets(this.assets);

        // Cache DOM
        this.timerBox = document.getElementById('timer-val');
        this.livesBox = document.getElementById('lives-val');

        this.setupInput();
        this.startLevel(0);

        this.lastTime = 0;
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.up = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.up = false;
        });
    }

    startLevel(index) {
        const level = this.levelManager.loadLevel(index);
        if (level) {
            this.player = new Player(level.spawn.x, level.spawn.y, 32, 32);
            document.getElementById('level-display').innerText = level.name;
        }
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update();
        this.draw();

        requestAnimationFrame(this.loop);
    }

    update() {
        if (!this.player || !this.levelManager.currentLevel) return;

        const level = this.levelManager.currentLevel;

        this.trapManager.update(level);

        // Apply input force
        this.player.update(this.keys);

        // Apply Physics
        this.physics.applyGravity(this.player);
        this.physics.applyFriction(this.player);

        this.player.isGrounded = false;

        // Platforms
        for (const plat of level.platforms) {
            this.physics.resolveCollision(this.player, plat);
        }

        // Traps as platforms/hazards
        if (level.traps) {
            for (const trap of level.traps) {
                if (trap.active === false) continue;

                if (trap.category === 'platform') {
                    const col = this.physics.resolveCollision(this.player, trap);
                    if (col === 'top' && trap.type === 'move') {
                        const dx = (trap.x - (trap.prevX !== undefined ? trap.prevX : trap.x));
                        this.player.x += dx;
                    }
                    trap.prevX = trap.x;
                } else if (trap.category === 'hazard') {
                    if (this.physics.checkCollision(this.player, trap)) {
                        this.handleDeath();
                    }
                }
            }
        }

        // Static Hazards (Death)
        for (const haz of level.hazards) {
            if (this.physics.checkCollision(this.player, haz)) {
                this.handleDeath();
            }
        }

        // Goal (Win)
        if (this.physics.checkCollision(this.player, level.goal)) {
            this.handleWin();
        }

        // Out of bounds death
        if (this.player.y > this.canvas.height) {
            this.handleDeath();
        }
    }

    handleDeath() {
        if (this.winTriggered) return;

        // Respawn
        const level = this.levelManager.currentLevel;
        this.player.x = level.spawn.x;
        this.player.y = level.spawn.y;
        this.player.vx = 0;
        this.player.vy = 0;

        // Indicate death
        const msg = document.getElementById('message-overlay');
        msg.innerText = "DEAD";
        msg.classList.remove('hidden');
        msg.classList.add('visible');
        setTimeout(() => {
            msg.classList.remove('visible');
            msg.classList.add('hidden');
        }, 500);
    }

    handleWin() {
        if (this.winTriggered) return;
        this.winTriggered = true;

        const msg = document.getElementById('message-overlay');
        msg.innerText = "LEVEL\nCOMPLETE";
        msg.classList.add('win');
        msg.classList.remove('hidden');
        msg.classList.add('visible');

        // Wait before next level
        setTimeout(() => {
            msg.classList.remove('visible');
            msg.classList.add('hidden');
            msg.classList.remove('win');
            this.winTriggered = false;

            this.levelManager.currentLevelIndex++;
            this.startLevel(this.levelManager.currentLevelIndex);

            if (!this.levelManager.currentLevel) {
                msg.innerText = "YOU\nESCAPED\nHELL";
                msg.classList.add('win');
                msg.classList.remove('hidden');
                msg.classList.add('visible');
                // Reset after long delay
                setTimeout(() => {
                    msg.classList.remove('visible');
                    msg.classList.add('hidden');
                    msg.classList.remove('win');
                    this.startLevel(0);
                }, 4000);
            }
        }, 1500);
    }

    draw() {
        // Draw Background
        if (this.assets && this.assets.background.complete) {
            const ptrn = this.ctx.createPattern(this.assets.background, 'repeat');
            this.ctx.fillStyle = ptrn;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = '#202020';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.levelManager.draw(this.ctx);

        // Draw traps
        if (this.levelManager.currentLevel && this.levelManager.currentLevel.traps) {
            for (const trap of this.levelManager.currentLevel.traps) {
                if (trap.active === false) {
                    // Draw ghost outline maybe?
                    continue;
                }

                if (trap.category === 'platform') {
                    this.ctx.fillStyle = '#666'; // Moving plat color
                } else {
                    this.ctx.fillStyle = '#DC143C';
                }
                this.ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
            }
        }

        if (this.player) this.player.draw(this.ctx, this.assets.player);

        // Update DOM HUD
        if (this.livesBox) this.livesBox.innerText = this.lives;
        if (this.timerBox) this.timerBox.innerText = Math.ceil(this.timeLeft);
    }
}
