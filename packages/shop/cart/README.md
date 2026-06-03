# @saas-factory/shop-cart

購物車模組（goal 03 §3）。

Lock：ADR-0011 §03-03 v1。

## 功能
- 登入 / 未登入共用 API
- 跨裝置同步（登入後合併匿名 cart）
- 滿額免運進度（`calcFreeShippingProgress`）
- 庫存自動驗證（缺貨移除、不足調整）
- 30 天保留（`CART_RETENTION_DAYS`）

## 設計
- `CartService` 內建 `now()` 注入點方便測試
- `ProductStatusChecker` 抽象由 inventory 端注入
- `unitPrice` 為加入時快照，後續調價不影響購物車
