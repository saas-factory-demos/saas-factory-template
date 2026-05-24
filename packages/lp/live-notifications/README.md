# @saas-factory/lp-live-notifications

LP 即時購買通知（左下角飄）。

## 模式

- `simulated`：後台手動輸入名單，每則自動標 `compliance: sample`
- `real`：透過 `realOrderSource` hook 從 orders 庫拉最近訂單，自動標 `compliance: verified`

合規要求：前端渲染時 **必須** 顯示對應 compliance 標籤（「示意」/「真實」），由前台元件依此值決定。

## 用法

```ts
import { LiveNotificationService } from '@saas-factory/lp-live-notifications';

const svc = new LiveNotificationService({
  realOrderSource: async ({ tenantId, productIds, sinceMinutes }) =>
    orders.listRecent({ tenantId, productIds, sinceMinutes }),
});

// 取下一筆
const payload = await svc.next(config);
// 等下一輪
const delay = svc.nextDelaySeconds(config, false);
```

`preview(config, count)` 給後台預覽名單用。
