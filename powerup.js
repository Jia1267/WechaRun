/**
 * Power-ups:
 * - coffee: temporary speed boost
 * - metroCard: temporary invincibility
 */
const { randomInt, rectsOverlap } = require('./utils');

class PowerUp {
  constructor(type, laneIndex, x, y) {
    this.type = type;
    this.laneIndex = laneIndex;
    this.x = x;
    this.y = y;
    this.width = 44;
    this.height = 44;
  }

  update(deltaDistance) {
    this.y += deltaDistance;
  }

  isOffscreen() {
    return this.y > this.groundY + 260;
  }

  getHitbox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = this.type === 'coffee' ? '#6f4e37' : '#00b894';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.type === 'coffee' ? '咖啡' : '地铁卡', this.x + this.width / 2, this.y + this.height / 2 + 4);
    ctx.restore();
  }
}

class PowerUpSystem {
  constructor(laneCenters, gameWidth, groundY) {
    this.laneCenters = laneCenters;
    this.gameWidth = gameWidth;
    this.groundY = groundY;
    this.reset();
  }

  reset() {
    this.powerups = [];
    this.spawnTimer = 0;
    this.nextSpawnGap = 5000;
  }

  update(deltaTime, moveDistance) {
    this.spawnTimer += deltaTime;

    if (this.spawnTimer >= this.nextSpawnGap) {
      this.spawnTimer = 0;
      this.nextSpawnGap = 4500 + Math.random() * 3000;
      this.spawn();
    }

    this.powerups.forEach((item) => item.update(moveDistance));
    this.powerups = this.powerups.filter((item) => !item.isOffscreen());
  }

  spawn() {
    const laneIndex = randomInt(0, 2);
    const laneCenterX = this.laneCenters[laneIndex];
    const type = Math.random() < 0.5 ? 'coffee' : 'metroCard';

    this.powerups.push(new PowerUp(type, laneIndex, laneCenterX - 22, -80));
  }

  checkCollection(player) {
    const p = player.getHitbox();

    for (let i = this.powerups.length - 1; i >= 0; i -= 1) {
      const item = this.powerups[i];
      if (player.laneIndex !== item.laneIndex) {
        continue;
      }

      const o = item.getHitbox();
      const overlap = rectsOverlap(p, o);

      if (overlap) {
        this.powerups.splice(i, 1);
        return item;
      }
    }

    return null;
  }

  render(ctx) {
    this.powerups.forEach((item) => item.render(ctx));
  }
}

module.exports = PowerUpSystem;
