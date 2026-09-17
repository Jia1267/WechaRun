/**
 * City background system for side-zone rendering and moving landmarks.
 * Zones:
 * - Left background: 0% - 20%
 * - Road: 20% - 80%
 * - Right background: 80% - 100%
 */
const { randomInt } = require('./utils');

class LandmarkSystem {
  constructor(width, height, leftZone, rightZone) {
    this.width = width;
    this.height = height;
    this.leftZone = leftZone;
    this.rightZone = rightZone;

    this.landmarks = [];
    this.spawnTimer = 0;
    this.nextSpawnGap = 2200;

    this.landmarkImages = [];
  }

  setLandmarkImages(images) {
    this.landmarkImages = images || [];
  }

  reset() {
    this.landmarks = [];
    this.spawnTimer = 0;
    this.nextSpawnGap = 2200;
  }

  update(deltaTime, gameSpeed) {
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.nextSpawnGap) {
      this.spawnTimer = 0;
      this.nextSpawnGap = 1800 + Math.random() * 1600;
      this.spawn();
    }

    const downwardSpeed = 110 + gameSpeed * 0.22;
    const dy = downwardSpeed * (deltaTime / 1000);
    this.landmarks.forEach((item) => {
      item.y += dy;
    });

    this.landmarks = this.landmarks.filter((item) => item.y < this.height + item.size);
  }

  spawn() {
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const zone = side === 'left' ? this.leftZone : this.rightZone;
    const size = randomInt(42, 68);
    const x = zone.x + randomInt(6, Math.max(8, zone.width - size - 6));
    const useFirst = Math.random() < 0.5;

    this.landmarks.push({
      side,
      x,
      y: -size,
      size,
      color: side === 'left' ? '#f1c40f' : '#e74c3c',
      imageIndex: useFirst ? 0 : 1
    });
  }

  draw(ctx) {
    this.landmarks.forEach((item) => {
      const img = this.landmarkImages[item.imageIndex];
      if (img && img.width > 0) {
        ctx.drawImage(img, item.x, item.y, item.size, item.size);
        return;
      }

      ctx.save();
      ctx.fillStyle = item.color;
      ctx.fillRect(item.x, item.y, item.size, item.size);
      ctx.fillStyle = '#2d3436';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('地标', item.x + item.size / 2, item.y + item.size / 2 + 6);
      ctx.restore();
    });
  }
}

class CityBackground {
  constructor(width, height, groundY) {
    this.width = width;
    this.height = height;
    this.groundY = groundY;

    this.leftZone = { x: 0, width: this.width * 0.2 };
    this.roadZone = { x: this.width * 0.2, width: this.width * 0.6 };
    this.rightZone = { x: this.width * 0.8, width: this.width * 0.2 };

    this.roadOffset = 0;

    this.leftBackgroundImage = wx.createImage();
    this.rightBackgroundImage = wx.createImage();
    this.landmarkImage1 = wx.createImage();
    this.landmarkImage2 = wx.createImage();

    this.leftBackgroundImage.src = 'assets/cities/beijing/background_left.png';
    this.rightBackgroundImage.src = 'assets/cities/beijing/background_right.png';
    this.landmarkImage1.src = 'assets/cities/beijing/landmarks/landmark1.png';
    this.landmarkImage2.src = 'assets/cities/beijing/landmarks/landmark2.png';

    this.landmarkSystem = new LandmarkSystem(width, height, this.leftZone, this.rightZone);
    this.landmarkSystem.setLandmarkImages([this.landmarkImage1, this.landmarkImage2]);
  }

  reset() {
    this.roadOffset = 0;
    this.landmarkSystem.reset();
  }

  update(deltaTime, gameSpeed) {
    const moveDistance = gameSpeed * (deltaTime / 1000);
    this.roadOffset = (this.roadOffset + moveDistance * 0.8) % 560;
    this.landmarkSystem.update(deltaTime, gameSpeed);
  }

  drawSideBackgrounds(ctx) {
    const leftImgLoaded = this.leftBackgroundImage && this.leftBackgroundImage.width > 0;
    const rightImgLoaded = this.rightBackgroundImage && this.rightBackgroundImage.width > 0;

    if (leftImgLoaded) {
      ctx.drawImage(this.leftBackgroundImage, this.leftZone.x, 0, this.leftZone.width, this.height);
    } else {
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(this.leftZone.x, 0, this.leftZone.width, this.height);
    }

    if (rightImgLoaded) {
      ctx.drawImage(this.rightBackgroundImage, this.rightZone.x, 0, this.rightZone.width, this.height);
    } else {
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(this.rightZone.x, 0, this.rightZone.width, this.height);
    }
  }

  drawLandmarks(ctx) {
    this.landmarkSystem.draw(ctx);
  }

  drawRoad(ctx) {
    // Road area
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(this.roadZone.x, this.groundY, this.roadZone.width, this.height - this.groundY);

    // Scrolling lane strips
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 3;
    for (let i = -2; i < 9; i += 1) {
      const y = this.groundY + ((i * 70 + this.roadOffset) % 560);
      ctx.beginPath();
      ctx.moveTo(this.roadZone.x + 6, y);
      ctx.lineTo(this.roadZone.x + this.roadZone.width - 6, y);
      ctx.stroke();
    }

    // Lane separators
    const lane1 = this.roadZone.x + this.roadZone.width / 3;
    const lane2 = this.roadZone.x + (this.roadZone.width * 2) / 3;
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lane1, this.groundY);
    ctx.lineTo(lane1, this.height);
    ctx.moveTo(lane2, this.groundY);
    ctx.lineTo(lane2, this.height);
    ctx.stroke();
  }
}

module.exports = CityBackground;
