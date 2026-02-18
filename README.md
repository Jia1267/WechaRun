# Office Worker Rush（打工人下班冲刺）

一个使用 **WeChat Mini Game Canvas API** + **纯 JavaScript** 开发的 2D 三车道跑酷小游戏。

## 游戏玩法

- 角色自动向前奔跑。
- 三车道系统：左 / 中 / 右。
- 手势操作：
  - 左滑：切换到左车道
  - 右滑：切换到右车道
  - 上滑：跳跃
  - 下滑：滑铲
- 障碍物碰撞会导致游戏结束。

## 障碍与道具

### 障碍物
- **文件堆（fileStack）**：必须跳跃通过
- **老板（boss）**：必须通过换道躲避
- **开会同事（coworker）**：必须滑铲通过

### 道具
- **咖啡（coffee）**：短时间加速
- **地铁卡（metroCard）**：短时间无敌

## 计分规则

- 分数根据前进距离实时增长。
- 每 10 秒速度等级提升一次。
- 显示当前分数与历史最高分。

## 项目结构

```text
.
├── adManager.js
├── app.js
├── app.json
├── cityBackground.js
├── game.js
├── game.json
├── input.js
├── obstacle.js
├── player.js
├── powerup.js
├── project.config.json
├── README.md
├── ui.js
├── utils.js
└── assets/
    ├── placeholders.json
    └── cities/
        └── beijing/
            ├── background_left.png
            ├── background_right.png
            └── landmarks/
                ├── landmark1.png
                └── landmark2.png
```

> 说明：游戏当前使用 Canvas 直接绘制角色/障碍/道具。`assets/placeholders.json` 仅提供文本占位元数据，方便后续替换为真实素材。


## 资源说明（当前版本）

- 当前版本**只使用 Canvas 代码绘制（矩形/圆形）**角色、障碍物和道具。
- 运行游戏**不依赖任何图片/音频/字体二进制素材**。
- `assets/placeholders.json` 仅作为后续接入真实美术资源的文本占位元数据。


## 城市侧边背景与地标系统

- 新增 `cityBackground.js`，将屏幕划分为三段：左侧背景（0%-20%）、道路（20%-80%）、右侧背景（80%-100%）。
- 左右侧可加载北京主题背景图（若图片未加载则自动回退到 Canvas 色块绘制）。
- 新增 LandmarkSystem：每隔数秒在左/右侧随机生成地标，从屏幕顶部向下移动，移动速度与当前游戏速度联动，离开屏幕后自动回收。
- 渲染顺序：左右城市背景 → 地标 → 道路 → 障碍/道具 → 角色 → UI。

## 在微信开发者工具中运行

1. 打开 **微信开发者工具**。
2. 选择 **小游戏** 项目。
3. 导入本目录（`/workspace/WechaRun`）。
4. 使用 `project.config.json` 默认配置（`appid` 使用 `touristappid` 可本地体验）。
5. 点击编译运行。

## 广告模块说明

`adManager.js` 已包含广告占位代码：

- 激励视频广告（Rewarded Video）
- Banner 广告

上线前请替换：

- `rewardedVideoAdUnitId`
- `bannerAdUnitId`

并根据业务场景调用：

- `showRewardedVideo(onRewardGranted)`
- `showBanner(style)` / `hideBanner()`

## 开发说明

- 游戏采用模块化拆分：主循环、玩家、障碍、道具、输入、UI、广告管理独立维护。
- `utils.js` 中统一维护随机数、碰撞检测和数值裁剪等通用逻辑，方便扩展。
