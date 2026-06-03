# @saas-factory/shop-wishlist-reviews

願望清單 + 評價模組。

## 願望清單

- 每使用者一份預設清單（不可刪），可建多份命名清單。
- 同清單同 variant 不重複加入。

## 評價

- 防灌水：未購買不可評價（`hasPurchased`），且一單一商品一評（`hasReviewed`）。
- 1-5 星 + 標題 + 內文 + 圖片 / 影片 URL。
- 商家回覆（保留回覆者 + 時間）。
- 後台可下架（visible=false）。
- 出貨後 14 天自動排程邀請（由 cron 撈到期清單）。

## 使用

```ts
import {
  WishlistService,
  ReviewService,
  InMemoryWishlistStore,
  InMemoryReviewStore,
} from '@saas-factory/shop-wishlist-reviews';

const wishlist = new WishlistService(wishlistStore);
const reviews = new ReviewService(reviewStore, { invitationDelayDays: 14 });
```

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
