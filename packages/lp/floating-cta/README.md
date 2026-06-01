# @saas-factory/lp-floating-cta

LP 浮動 CTA 顯示邏輯（不含 DOM，純資料邏輯）。

- 行動裝置：底部固定 bar
- 桌機：右下浮動 or 滾動跟隨
- 捲到結帳區自動隱藏（避免重複）
- 多語系：label map 對 locale 取字串
- `showAfterScrollPx`：捲過此距離才顯示，避免 hero 就跳出來打擾

## 用法

```ts
import { resolveFloatingCta } from '@saas-factory/lp-floating-cta';

const cta = resolveFloatingCta(config, isMobile ? 'mobile' : 'desktop', locale, {
  scrollY: window.scrollY,
  anchorInView: anchorObserver.isVisible,
  checkoutVisible: checkoutObserver.isVisible,
});

if (cta.visible) {
  // render with cta.label, cta.placement, cta.targetAnchor
}
```

前台元件透過 `placement` 對應 class 即可：`mobile-bottom-bar` / `bottom-right-float` / `sticky-follow`。
