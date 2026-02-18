/**
 * Player logic for lane movement, jump, slide, and power-up states.
 */
const { clamp } = require('./utils');

class Player {
  constructor(gameWidth, gameHeight, laneCenters) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.laneCenters = laneCenters;

    // sprite size (you can tune later)
    this.width = 120;
    this.height = 160;

    // ground + jump config
    this.baseY = gameHeight - 180;   // same as your game ground baseline
    this.jumpHeight = 120;

    // load sprite
    this.spriteReady = false;
    this.image = wx.createImage();
    this.image.onload = () => { this.spriteReady = true; };
    this.image.onerror = (e) => { console.log('[Player] image load error', e); };
    this.image.src = 'assets/characters/suit_male.png';

    this.reset();
  }

  setSkin(path) {
    this.spriteReady = false;
    this.image = wx.createImage();
    this.image.onload = () => { this.spriteReady = true; };
    this.image.onerror = (e) => { console.log('[Player] image load error', e); };
    this.image.src = path;
  }

  reset() {
    this.laneIndex = 1;
    this.x = this.laneCenters[this.laneIndex] - this.width / 2;
    this.y = this.baseY;

    this.jumpTimer = 0;
    this.jumpDuration = 520;
    this.isJumping = false;

    this.slideTimer = 0;
    this.slideDuration = 460;
    this.isSliding = false;

    this.invincibleTimer = 0;
    this.speedBoostTimer = 0;
  }

  moveLeft() {
    this.laneIndex = clamp(this.laneIndex - 1, 0, 2);
    this.x = this.laneCenters[this.laneIndex] - this.width / 2;
  }

  moveRight() {
    this.laneIndex = clamp(this.laneIndex + 1, 0, 2);
    this.x = this.laneCenters[this.laneIndex] - this.width / 2;
  }

  jump() {
    if (!this.isJumping && !this.isSliding) {
      this.isJumping = true;
      this.jumpTimer = this.jumpDuration;
    }
  }

  slide() {
    if (!this.isSliding && !this.isJumping) {
      this.isSliding = true;
      this.slideTimer = this.slideDuration;
    }
  }

  applySpeedBoost(durationMs) {
    this.speedBoostTimer = Math.max(this.speedBoostTimer, durationMs);
  }

  applyInvincible(durationMs) {
    this.invincibleTimer = Math.max(this.invincibleTimer, durationMs);
  }

  update(deltaTime) {
    if (this.isJumping) {
      this.jumpTimer -= deltaTime;
      if (this.jumpTimer <= 0) {
        this.jumpTimer = 0;
        this.isJumping = false;
      }

      const t = 1 - this.jumpTimer / this.jumpDuration;
      const parabola = 4 * t * (1 - t);
      this.y = this.baseY - this.jumpHeight * parabola;
    } else {
      this.y = this.baseY;
    }

    if (this.isSliding) {
      this.slideTimer -= deltaTime;
      if (this.slideTimer <= 0) {
        this.slideTimer = 0;
        this.isSliding = false;
      }
    }

    this.speedBoostTimer = Math.max(0, this.speedBoostTimer - deltaTime);
    this.invincibleTimer = Math.max(0, this.invincibleTimer - deltaTime);
  }

  isInvincible() {
    return this.invincibleTimer > 0;
  }

  hasSpeedBoost() {
    return this.speedBoostTimer > 0;
  }

  getHitbox() {
    const bodyHeight = this.isSliding ? this.height * 0.50 : this.height * 0.85;
    const yOffset = this.isSliding ? this.height - bodyHeight : this.height * 0.10;
  
    return {
      x: this.x + this.width * 0.25,
      y: this.y + yOffset + this.height * 0.05,
      width: this.width * 0.50,
      height: bodyHeight * 0.90
    };
  }  

  render(ctx) {
    ctx.save();

    // Shadow (always on ground)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.baseY + this.height + 8, 26, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // slide squash effect (optional)
    const drawH = this.isSliding ? this.height * 0.65 : this.height;
    const drawY = this.isSliding ? (this.y + (this.height - drawH)) : this.y;

    // draw sprite (fallback to rectangle if not loaded yet)
    if (this.spriteReady) {
      ctx.drawImage(this.image, this.x, drawY, this.width, drawH);
    } else {
      ctx.fillStyle = '#1e90ff';
      ctx.fillRect(this.x, drawY, this.width, drawH);
    }

    // Invincible halo
    if (this.isInvincible()) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.strokeRect(this.x - 3, drawY - 3, this.width + 6, drawH + 6);
    }

    ctx.restore();
  }
}

module.exports = Player;

