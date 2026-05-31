# @saas-factory/course-watermark

課程影片動態浮水印生成器（防盜錄）。

## 功能

- 浮水印文字組合：顯示名稱 + 遮罩 Email / 手機尾 4 碼 + userId 前綴
- Email 中段 `***` 遮罩（避免完整個資外洩）
- 每 5 秒（可調）換一次位置；位置由 seed 決定（同觀眾 + 同影片可重現以利追蹤）
- 連續兩段位置不重複，避免長時間停在同一處
- 預設半透明 0.35，可覆寫
- `positionToStyle()` 直接吐 CSS 給播放器 overlay 用

## 用法

```ts
import { generateFrames, getFrameAt, positionToStyle } from '@saas-factory/course-watermark';

const frames = generateFrames(
  { userId: 'u-123', displayName: '王小明', email: 'foo@bar.com' },
  { durationSeconds: 600, segmentSeconds: 5 },
);

// 播放器每秒查一次：
const f = getFrameAt(frames, currentTime);
if (f) {
  overlay.textContent = f.text;
  overlay.style.opacity = String(f.opacity);
  Object.assign(overlay.style, positionToStyle(f.position));
}
```
