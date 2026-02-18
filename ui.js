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

  drawBackground(ctx, roadLeft, roadRight, groundY, offset) {
    // left city
    ctx.fillStyle = '#5f6a6a';
    ctx.fillRect(0, 0, roadLeft, this.height);
  
    // right city
    ctx.fillStyle = '#5f6a6a';
    ctx.fillRect(roadRight, 0, this.width - roadRight, this.height);
  
    // road
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(roadLeft, 0, roadRight - roadLeft, this.height);
  
    // lane lines (downward moving)
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 3;
    for (let i = -2; i < 14; i++) {
      const y = ((i * 70 + offset) % 560);
      ctx.beginPath();
      ctx.moveTo(roadLeft + 20, y);
      ctx.lineTo(roadRight - 20, y);
      ctx.stroke();
    }
  
    // lane borders
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    const laneWidth = (roadRight - roadLeft) / 3;
    ctx.beginPath();
    ctx.moveTo(roadLeft + laneWidth, 0);
    ctx.lineTo(roadLeft + laneWidth, this.height);
    ctx.moveTo(roadLeft + laneWidth * 2, 0);
    ctx.lineTo(roadLeft + laneWidth * 2, this.height);
    ctx.stroke();
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
