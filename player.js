/**
 * Player logic for lane movement, jump, slide, and power-up states.
 */
const { clamp } = require('./utils');

class Player {
  constructor(gameWidth, gameHeight, laneCenters) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.laneCenters = laneCenters;

    this.width = 64;
    this.height = 88;
    this.baseY = gameHeight - 180;
    this.jumpHeight = 120;

    this.reset();
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
    const bodyHeight = this.isSliding ? this.height * 0.55 : this.height;
    const yOffset = this.isSliding ? this.height - bodyHeight : 0;

    return {
      x: this.x + 10,
      y: this.y + yOffset + 6,
      width: this.width - 20,
      height: bodyHeight - 12
    };
  }

  render(ctx) {
    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.baseY + this.height + 4, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Character body
    const bodyHeight = this.isSliding ? this.height * 0.55 : this.height;
    const yOffset = this.isSliding ? this.height - bodyHeight : 0;

    ctx.fillStyle = this.isInvincible() ? '#6a5acd' : '#1e90ff';
    ctx.fillRect(this.x, this.y + yOffset, this.width, bodyHeight);

    // Tie
    ctx.fillStyle = '#ff4757';
    ctx.fillRect(this.x + this.width / 2 - 4, this.y + yOffset + 12, 8, bodyHeight - 24);

    // Invincible halo
    if (this.isInvincible()) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.strokeRect(this.x - 3, this.y + yOffset - 3, this.width + 6, bodyHeight + 6);
    }

    ctx.restore();
  }
}

module.exports = Player;
