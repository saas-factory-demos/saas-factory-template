# @saas-factory/shop-products

商品模組（goal 03 §1）。

Lock：ADR-0011 §03-01 v1。

## 內容
- 三個 Payload Collections：`products`／`product-variants`／`categories`
- variant matrix 展開器
- 商品標題 70 字長度驗證（Google Shopping 規範）
- slug 格式驗證
- 排程上架判斷

## 後續 goal 連動
- inventory 模組 consume `productId` + `variantId` 做庫存
- orders 模組記下單時的 product snapshot
- feeds 模組讀 `products.seo` 與 `gallery` 輸出 GMC XML
