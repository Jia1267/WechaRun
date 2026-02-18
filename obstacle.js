/**
 * Obstacle types in Office Worker Rush:
 * - fileStack: must be jumped over
 * - boss: must be avoided by changing lanes
 * - coworker: must be slid under
 */
const { randomInt, rectsOverlap } = require('./utils');

class Obstacle {
  constructor(type, laneIndex, x, groundY) {
    this.type = type;
    this.laneIndex = laneIndex;
    this.x = x;
    this.groundY = groundY;

    const map = {
      fileStack: { width: 60, height: 56, color: '#e67e22' },
      boss: { width: 70, height: 110, color: '#2f3542' },
      coworker: { width: 72, height: 64, color: '#8e44ad' }
    };

    this.width = map[type].width;
    this.height = map[type].height;
    this.color = map[type].color;
    this.y = -this.height - 20;
  }

  update(deltaDistance) {
    this.y += deltaDistance;
  }

  isOffscreen() {
    return this.y > this.groundY + 260; 
  }

  getHitbox() {
    return {
      x: this.x + 6,
      y: this.y + 6,
      width: this.width - 12,
      height: this.height - 10
    };
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';

    if (this.type === 'fileStack') {
      ctx.fillText('文件', this.x + this.width / 2, this.y + this.height / 2 + 4);
    } else if (this.type === 'boss') {
      ctx.fillText('老板', this.x + this.width / 2, this.y + this.height / 2 + 4);
    } else {
      ctx.fillText('同事', this.x + this.width / 2, this.y + this.height / 2 + 4);
    }

    ctx.restore();
  }
}

class ObstacleSystem {
  constructor(laneCenters, gameWidth, groundY) {
    this.laneCenters = laneCenters;
    this.gameWidth = gameWidth;
    this.groundY = groundY;
    this.reset();
  }

  reset() {
    this.obstacles = [];
    this.spawnTimer = 0;
    this.nextSpawnGap = 1200;
  }

  update(deltaTime, moveDistance, speedScale) {
    this.spawnTimer += deltaTime;

    if (this.spawnTimer >= this.nextSpawnGap) {
      this.spawnTimer = 0;
      this.nextSpawnGap = Math.max(650, 1200 - speedScale * 80 + Math.random() * 300);
      this.spawn();
    }

    this.obstacles.forEach((item) => item.update(moveDistance));
    this.obstacles = this.obstacles.filter((item) => !item.isOffscreen());
  }

  spawn() {
    const types = ['fileStack', 'boss', 'coworker'];
    const type = types[randomInt(0, types.length - 1)];
    const laneIndex = randomInt(0, 2);
    const laneX = this.laneCenters[laneIndex];

    const obstacle = new Obstacle(type, laneIndex, laneX - 35, this.groundY);
    obstacle.x = laneX - obstacle.width / 2;
    this.obstacles.push(obstacle);
  }

  checkCollision(player) {
    const p = player.getHitbox();

    for (let i = 0; i < this.obstacles.length; i += 1) {
      const obstacle = this.obstacles[i];

      if (player.laneIndex !== obstacle.laneIndex) {
        continue;
      }

      const o = obstacle.getHitbox();
      const overlap = rectsOverlap(p, o);

      if (!overlap) {
        continue;
      }

      if (obstacle.type === 'fileStack' && player.isJumping) {
        continue;
      }

      if (obstacle.type === 'coworker' && player.isSliding) {
        continue;
      }

      return obstacle;
    }

    return null;
  }

  render(ctx) {
    this.obstacles.forEach((item) => item.render(ctx));
  }
}

module.exports = ObstacleSystem;
