/**
 * Shared utility helpers for the mini-game.
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rectsOverlap(a, b, margin = 12) {
  return !(
    a.x + a.width - margin < b.x ||
    a.x + margin > b.x + b.width ||
    a.y + a.height - margin < b.y ||
    a.y + margin > b.y + b.height
  );
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
