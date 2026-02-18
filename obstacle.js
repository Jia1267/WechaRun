const { randomInt, rectsOverlap } = require('./utils');

const obstacleImages = {
  boss: 'assets/obstacles/boss.png',
  coworker: 'assets/obstacles/coworker.png',
  fileStack: 'assets/obstacles/filestack.png'
};

const obstacleSizes = {
  fileStack: { width: 90, height: 90 },
  boss: { width: 130, height: 160 },
  coworker: { width: 120, height: 120 }
};

class Obstacle {
  constructor(type, laneIndex, x, startY) {
    this.type = type;
    this.laneIndex = laneIndex;
    this.x = x;

    this.width = obstacleSizes[type].width;
    this.height = obstacleSizes[type].height;

    this.y = startY;

    this.image = wx.createImage();
    this.image.src = obstacleImages[type];
  }

  update(deltaDistance) {
    this.y += deltaDistance;
  }

  isOffscreen(canvasHeight) {
    return this.y > canvasHeight + 120;
  }

  getHitbox() {
    return {
      x: this.x + this.width * 0.18,
      y: this.y + this.height * 0.18,
      width: this.width * 0.64,
      height: this.height * 0.64
    };
  }  

  render(ctx) {
    if (this.image && this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      // fallback (if image not loaded yet)
      ctx.save();
      ctx.fillStyle = '#888';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }
  }
}

class ObstacleSystem {
  constructor(laneCenters, canvasHeight) {
    this.laneCenters = laneCenters;
    this.canvasHeight = canvasHeight;
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

    this.obstacles.forEach(o => o.update(moveDistance));
    this.obstacles = this.obstacles.filter(o => !o.isOffscreen(this.canvasHeight));
  }

  spawn() {
    const types = ['fileStack', 'boss', 'coworker'];
    const type = types[randomInt(0, types.length - 1)];
    const laneIndex = randomInt(0, 2);

    const laneX = this.laneCenters[laneIndex];
    const w = obstacleSizes[type].width;

    const x = laneX - w / 2;
    const y = -obstacleSizes[type].height - 20;

    this.obstacles.push(new Obstacle(type, laneIndex, x, y));
  }

  checkCollision(player) {
    const p = player.getHitbox();
  
    const marginByType = {
      fileStack: 16,
      boss: 12,
      coworker: 18
    };
  
    for (let i = 0; i < this.obstacles.length; i++) {
      const o = this.obstacles[i];
      if (player.laneIndex !== o.laneIndex) continue;
  
      const margin = marginByType[o.type] ?? 14;
      if (!rectsOverlap(p, o.getHitbox(), margin)) continue;
  
      if (o.type === 'fileStack' && player.isJumping) continue;
      if (o.type === 'coworker' && player.isSliding) continue;
  
      return o;
    }
  
    return null;
  }  

  render(ctx) {
    this.obstacles.forEach(o => o.render(ctx));
  }
}

module.exports = ObstacleSystem;