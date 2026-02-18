/**
 * Ad manager placeholder.
 * Replace adUnitId values with real IDs before release.
 */
class AdManager {
  constructor() {
    this.rewardedVideoAd = null;
    this.bannerAd = null;

    this.rewardedVideoAdUnitId = 'adunit-xxxxxxxxxxxxxxxx';
    this.bannerAdUnitId = 'adunit-yyyyyyyyyyyyyyyy';

    this.initRewardedVideoAd();
  }

  initRewardedVideoAd() {
    if (!wx.createRewardedVideoAd) {
      console.log('[AdManager] Rewarded video ad API not available in current environment.');
      return;
    }

    this.rewardedVideoAd = wx.createRewardedVideoAd({
      adUnitId: this.rewardedVideoAdUnitId
    });

    this.rewardedVideoAd.onError((err) => {
      console.log('[AdManager] rewarded video error:', err);
    });
  }

  showRewardedVideo(onRewardGranted) {
    if (!this.rewardedVideoAd) {
      console.log('[AdManager] rewarded video ad not initialized.');
      return;
    }

    this.rewardedVideoAd
      .show()
      .catch(() => this.rewardedVideoAd.load().then(() => this.rewardedVideoAd.show()))
      .catch((err) => {
        console.log('[AdManager] failed to show rewarded video ad:', err);
      });

    this.rewardedVideoAd.offClose();
    this.rewardedVideoAd.onClose((res) => {
      const completed = res && (res.isEnded || res === undefined);
      if (completed && onRewardGranted) {
        onRewardGranted();
      }
    });
  }

  showBanner(style = {}) {
    if (!wx.createBannerAd) {
      console.log('[AdManager] banner ad API not available in current environment.');
      return;
    }

    if (this.bannerAd) {
      this.bannerAd.show();
      return;
    }

    const defaultStyle = {
      left: 0,
      top: 620,
      width: 320
    };

    this.bannerAd = wx.createBannerAd({
      adUnitId: this.bannerAdUnitId,
      style: Object.assign(defaultStyle, style)
    });

    this.bannerAd.onError((err) => {
      console.log('[AdManager] banner error:', err);
    });

    this.bannerAd.show();
  }

  hideBanner() {
    if (this.bannerAd) {
      this.bannerAd.hide();
    }
  }

  destroyBanner() {
    if (this.bannerAd) {
      this.bannerAd.destroy();
      this.bannerAd = null;
    }
  }
}

module.exports = AdManager;
