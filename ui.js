/**
 * UI renderer for start, gameplay HUD, and game over screens.
 */
class UI {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  getStartButtonRect() {
    return {
      x: this.width / 2 - 120,
      y: Math.floor(this.height * 0.66),
      w: 240,
      h: 82
    };
  }

  getRestartButtonRect() {
    return {
      x: this.width / 2 - 120,
      y: Math.floor(this.height * 0.7),
      w: 240,
      h: 82
    };
  }

  drawBackground(ctx, laneCenters, groundY, distanceLinesOffset) {
    // Sky and floor
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#dfe6e9');
    gradient.addColorStop(0.6, '#ecf0f1');
    gradient.addColorStop(1, '#bdc3c7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Building silhouettes
    ctx.fillStyle = '#95a5a6';
    for (let i = 0; i < 8; i += 1) {
      const w = 40 + (i % 3) * 18;
      const h = 120 + (i % 4) * 25;
      ctx.fillRect(i * 58, groundY - h - 20, w, h);
    }

    // Lanes
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(0, groundY, this.width, this.height - groundY);

    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 3;
    for (let i = -2; i < 9; i += 1) {
      const y = groundY + ((i * 70 + distanceLinesOffset) % 560);
      ctx.beginPath();
      ctx.moveTo(this.width * 0.22, y);
      ctx.lineTo(this.width * 0.78, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.width * 0.33, groundY);
    ctx.lineTo(this.width * 0.33, this.height);
    ctx.moveTo(this.width * 0.67, groundY);
    ctx.lineTo(this.width * 0.67, this.height);
    ctx.stroke();

    // Lane hint dots
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    laneCenters.forEach((x) => {
      ctx.beginPath();
      ctx.arc(x, groundY + 28, 7, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawStartScreen(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('Office Worker Rush', this.width / 2, 250);

    ctx.font = '32px sans-serif';
    ctx.fillText('打工人下班冲刺', this.width / 2, 310);

    const startButton = this.getStartButtonRect();
    this.drawButton(ctx, startButton.x, startButton.y, startButton.w, startButton.h, '开始游戏');
  }

  drawHUD(ctx, score, highScore, speedLevel, effects) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(16, 16, 250, 126);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = '26px sans-serif';
    ctx.fillText(`分数: ${Math.floor(score)}`, 28, 54);
    ctx.fillText(`最高: ${Math.floor(highScore)}`, 28, 88);
    ctx.fillText(`速度等级: ${speedLevel}`, 28, 122);

    if (effects.length > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(this.width - 240, 16, 224, 84);
      ctx.fillStyle = '#2d3436';
      ctx.textAlign = 'left';
      ctx.font = '22px sans-serif';
      effects.forEach((effect, idx) => {
        ctx.fillText(effect, this.width - 226, 50 + idx * 30);
      });
    }
  }

  drawGameOver(ctx, finalScore, highScore) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText('游戏结束', this.width / 2, 260);

    ctx.font = '30px sans-serif';
    ctx.fillText(`本次分数: ${Math.floor(finalScore)}`, this.width / 2, 340);
    ctx.fillText(`最高分数: ${Math.floor(highScore)}`, this.width / 2, 390);

    const restartButton = this.getRestartButtonRect();
    this.drawButton(ctx, restartButton.x, restartButton.y, restartButton.w, restartButton.h, '重新开始');
  }

  drawButton(ctx, x, y, w, h, text) {
    ctx.fillStyle = '#00b894';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x + w / 2, y + 53);
  }

  isInsideButton(point, x, y, w, h) {
    return point.x >= x && point.x <= x + w && point.y >= y && point.y <= y + h;
  }
}

module.exports = UI;
