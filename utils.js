/**
 * Shared utility helpers for the mini-game.
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function safeStorageGetNumber(key, fallback = 0) {
  const value = Number(wx.getStorageSync(key));
  return Number.isFinite(value) ? value : fallback;
}

module.exports = {
  clamp,
  randomInt,
  rectsOverlap,
  safeStorageGetNumber
};
