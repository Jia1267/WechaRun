/**
 * Swipe input handler for WeChat touch events.
 */
class InputHandler {
  constructor() {
    this.startX = 0;
    this.startY = 0;
    this.callbacks = {
      left: null,
      right: null,
      up: null,
      down: null,
      tap: null
    };

    this.minSwipeDistance = 30;
    this.registerEvents();
  }

  registerEvents() {
    wx.onTouchStart((event) => {
      if (!event.touches || event.touches.length === 0) {
        return;
      }
      this.startX = event.touches[0].clientX;
      this.startY = event.touches[0].clientY;
    });

    wx.onTouchEnd((event) => {
      if (!event.changedTouches || event.changedTouches.length === 0) {
        return;
      }

      const endX = event.changedTouches[0].clientX;
      const endY = event.changedTouches[0].clientY;
      const dx = endX - this.startX;
      const dy = endY - this.startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (absX < this.minSwipeDistance && absY < this.minSwipeDistance) {
        if (this.callbacks.tap) {
          this.callbacks.tap({ x: endX, y: endY });
        }
        return;
      }

      if (absX > absY) {
        if (dx > 0 && this.callbacks.right) {
          this.callbacks.right();
        } else if (dx < 0 && this.callbacks.left) {
          this.callbacks.left();
        }
      } else if (dy > 0 && this.callbacks.down) {
        this.callbacks.down();
      } else if (dy < 0 && this.callbacks.up) {
        this.callbacks.up();
      }
    });
  }

  onLeft(callback) {
    this.callbacks.left = callback;
  }

  onRight(callback) {
    this.callbacks.right = callback;
  }

  onUp(callback) {
    this.callbacks.up = callback;
  }

  onDown(callback) {
    this.callbacks.down = callback;
  }

  onTap(callback) {
    this.callbacks.tap = callback;
  }
}

module.exports = InputHandler;
