const Player = require('./player');
const ObstacleSystem = require('./obstacle');
const PowerUpSystem = require('./powerup');
const UI = require('./ui');
const InputHandler = require('./input');
const AdManager = require('./adManager');
const CityBackground = require('./cityBackground');
const { safeStorageGetNumber } = require('./utils');

// Canvas setup
const systemInfo = wx.getSystemInfoSync();
const canvas = wx.createCanvas();
canvas.width = systemInfo.windowWidth;
canvas.height = systemInfo.windowHeight;
const ctx = canvas.getContext('2d');

const GAME_STATE = {
  START: 'start',
  PLAYING: 'playing',
  GAME_OVER: 'gameOver'
};

class Game {
  constructor() {
    this.width = canvas.width;
    this.height = canvas.height;
    this.groundY = this.height - 180;

    this.laneCenters = [
      this.width * 0.22,
      this.width * 0.5,
      this.width * 0.78
    ];

    this.player = new Player(this.width, this.height, this.laneCenters);
    this.obstacles = new ObstacleSystem(this.laneCenters, this.width, this.groundY);
    this.powerups = new PowerUpSystem(this.laneCenters, this.width, this.groundY);
    this.ui = new UI(this.width, this.height);
    this.cityBackground = new CityBackground(this.width, this.height, this.groundY);
    this.input = new InputHandler();
    this.adManager = new AdManager();

    this.state = GAME_STATE.START;

    this.baseSpeed = 340;
    this.speedIncreaseInterval = 10000;
    this.speedLevel = 1;

    this.score = 0;
    this.highScore = safeStorageGetNumber('officeWorkerRushHighScore', 0);

    this.elapsedTime = 0;
    this.lastTimestamp = 0;

    this.bindInput();
    this.loop = this.loop.bind(this);
  }

  bindInput() {
    this.input.onLeft(() => {
      if (this.state === GAME_STATE.PLAYING) {
        this.player.moveLeft();
      }
    });

    this.input.onRight(() => {
      if (this.state === GAME_STATE.PLAYING) {
        this.player.moveRight();
      }
    });

    this.input.onUp(() => {
      if (this.state === GAME_STATE.PLAYING) {
        this.player.jump();
      }
    });

    this.input.onDown(() => {
      if (this.state === GAME_STATE.PLAYING) {
        this.player.slide();
      }
    });

    this.input.onTap((point) => {
      const startButton = this.ui.getStartButtonRect();
      const restartButton = this.ui.getRestartButtonRect();

      if (this.state === GAME_STATE.START && this.ui.isInsideButton(point, startButton.x, startButton.y, startButton.w, startButton.h)) {
        this.startGame();
      }

      if (this.state === GAME_STATE.GAME_OVER && this.ui.isInsideButton(point, restartButton.x, restartButton.y, restartButton.w, restartButton.h)) {
        this.startGame();
      }
    });
  }

  startGame() {
    this.state = GAME_STATE.PLAYING;
    this.player.reset();
    this.obstacles.reset();
    this.powerups.reset();

    this.score = 0;
    this.elapsedTime = 0;
    this.speedLevel = 1;
    this.cityBackground.reset();

    this.adManager.hideBanner();
  }

  currentSpeed() {
    const levelSpeed = this.baseSpeed + (this.speedLevel - 1) * 45;
    if (this.player.hasSpeedBoost()) {
      return levelSpeed * 1.35;
    }
    return levelSpeed;
  }

  update(deltaTime) {
    if (this.state !== GAME_STATE.PLAYING) {
      return;
    }

    this.elapsedTime += deltaTime;
    this.speedLevel = Math.floor(this.elapsedTime / this.speedIncreaseInterval) + 1;

    this.player.update(deltaTime);

    const speedPxPerSecond = this.currentSpeed();
    const moveDistance = speedPxPerSecond * (deltaTime / 1000);

    this.cityBackground.update(deltaTime, speedPxPerSecond);

    this.obstacles.update(deltaTime, moveDistance, this.speedLevel);
    this.powerups.update(deltaTime, moveDistance);

    const collected = this.powerups.checkCollection(this.player);
    if (collected) {
      if (collected.type === 'coffee') {
        this.player.applySpeedBoost(3500);
      } else if (collected.type === 'metroCard') {
        this.player.applyInvincible(4000);
      }
    }

    const hitObstacle = this.obstacles.checkCollision(this.player);
    if (hitObstacle && !this.player.isInvincible()) {
      this.gameOver();
      return;
    }

    this.score += moveDistance * 0.12;
  }

  gameOver() {
    this.state = GAME_STATE.GAME_OVER;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      wx.setStorageSync('officeWorkerRushHighScore', this.highScore);
    }

    // Placeholder ad strategy: show banner after game over.
    this.adManager.showBanner({
      top: this.height - 120,
      left: Math.max(0, (this.width - 320) / 2)
    });
  }

  render() {
    ctx.clearRect(0, 0, this.width, this.height);

    this.cityBackground.drawSideBackgrounds(ctx);
    this.cityBackground.drawLandmarks(ctx);
    this.cityBackground.drawRoad(ctx);

    if (this.state === GAME_STATE.START) {
      this.player.render(ctx);
      this.ui.drawStartScreen(ctx);
      return;
    }

    this.powerups.render(ctx);
    this.obstacles.render(ctx);
    this.player.render(ctx);

    const effects = [];
    if (this.player.hasSpeedBoost()) {
      effects.push('☕ 咖啡加速中');
    }
    if (this.player.isInvincible()) {
      effects.push('🚇 地铁卡无敌中');
    }

    this.ui.drawHUD(ctx, this.score, this.highScore, this.speedLevel, effects);

    if (this.state === GAME_STATE.GAME_OVER) {
      this.ui.drawGameOver(ctx, this.score, this.highScore);
    }
  }

  loop(timestamp) {
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }

    let deltaTime = timestamp - this.lastTimestamp;
    if (deltaTime > 60) {
      deltaTime = 60;
    }

    this.lastTimestamp = timestamp;

    this.update(deltaTime);
    this.render();

    canvas.requestAnimationFrame(this.loop);
  }

  start() {
    this.loop(0);
  }
}

const game = new Game();
game.start();
