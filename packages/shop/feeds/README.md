# @saas-factory/shop-feeds

商品 feed 產生器（GMC / Meta / LINE LAP / TikTok）。

## 支援格式

| 格式 | 用途 | Content-Type |
| --- | --- | --- |
| `gmc-xml` | Google Merchant Center / Google Shopping | `application/xml` |
| `meta-catalog` | Meta 商品目錄（FB / IG 動態廣告） | `text/csv` |
| `line-lap` | LINE Ads Platform 動態商品廣告 | `text/csv` |
| `tiktok` | TikTok 商品目錄 | `text/csv` |

## 使用

```ts
import { FeedService } from '@saas-factory/shop-feeds';

const service = new FeedService();
const out = service.generate('gmc-xml', items, {
  title: '我的商店',
  description: '優質商品',
  link: 'https://shop.example.com',
});
// out.body 即可直接回給 HTTP response
```

或一次產生全部：

```ts
const all = service.generateAll(items, metadata);
// all['gmc-xml'].body、all['meta-catalog'].body……
```

## 部署模式

每天透過 cron 重新產生並上傳到 R2 / Vercel，URL 給客戶填到 GMC / Meta Catalog / LAP / TikTok 後台投廣告。

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
