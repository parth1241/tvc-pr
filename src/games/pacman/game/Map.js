export class Map {
  constructor(tileSize) {
    this.tileSize = tileSize;
    this.wallColor = '#434B4D'; // Fallback

    // 0: Empty, 1: Wall, 2: Pellet, 3: Power Pill
    // 15 columns, 15 rows
    this.layout = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1],
      [1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1],
      [1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1],
      [1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1],
      [1, 1, 1, 2, 1, 0, 1, 0, 1, 0, 1, 2, 1, 1, 1], // Opened wall at col 3 and 11
      [0, 0, 0, 2, 0, 0, 1, 0, 1, 0, 0, 2, 0, 0, 0], // Tunnel connects to vertical path at col 3 and 11
      [1, 1, 1, 2, 1, 0, 1, 1, 1, 0, 1, 2, 1, 1, 1], // Opened wall at col 3 and 11
      [1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
      [1, 3, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 3, 1], // Pacman spawn
      [1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];
  }

  draw(ctx) {
    for (let row = 0; row < this.layout.length; row++) {
      for (let col = 0; col < this.layout[row].length; col++) {
        const tile = this.layout[row][col];
        const x = col * this.tileSize;
        const y = row * this.tileSize;

        if (tile === 1) {
          this.drawWall(ctx, x, y);
        } else if (tile === 2) {
          this.drawPellet(ctx, x, y);
        } else if (tile === 3) {
          this.drawPowerPill(ctx, x, y);
        }
      }
    }
  }

  drawWall(ctx, x, y) {
    // Metallic Shader Effect
    const gradient = ctx.createLinearGradient(x, y, x + this.tileSize, y + this.tileSize);
    gradient.addColorStop(0, '#555');
    gradient.addColorStop(0.5, '#AAA'); // Highlight
    gradient.addColorStop(1, '#555');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);

    // Inner border for detail
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.tileSize, this.tileSize);
  }

  drawPellet(ctx, x, y) {
    ctx.fillStyle = '#ffb8ae'; // Peach color roughly
    ctx.beginPath();
    const cx = x + this.tileSize / 2;
    const cy = y + this.tileSize / 2;
    ctx.arc(cx, cy, this.tileSize / 8, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPowerPill(ctx, x, y) {
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    const cx = x + this.tileSize / 2;
    const cy = y + this.tileSize / 2;
    ctx.arc(cx, cy, this.tileSize / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset
  }

  isWall(col, row) {
    if (row < 0 || row >= this.layout.length || col < 0 || col >= this.layout[0].length) {
      if (row === 7) return false; // Loop tunnel
      return true; // Out of bounds is wall
    }
    return this.layout[row][col] === 1;
  }

  eat(col, row) {
    if (this.layout[row][col] === 2) {
      this.layout[row][col] = 0;
      return 10;
    } else if (this.layout[row][col] === 3) {
      this.layout[row][col] = 0;
      return 50;
    }
    return 0;
  }

  getPelletCount() {
    let count = 0;
    for (let row of this.layout) {
      for (let tile of row) {
        if (tile === 2 || tile === 3) count++;
      }
    }
    return count;
  }
}
