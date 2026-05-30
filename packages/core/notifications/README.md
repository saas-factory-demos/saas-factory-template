# @saas-factory/notifications

統一通知中心。對應 goal 01 §7。

## Channel

`email` / `sms` / `line` / `push` / `in-app`

每個 channel 一個 `ChannelDispatcher` 實作，由 apps 端注入。

## 通知分類

- `transactional`：交易類（訂單、付款），不受同意/偏好控管
- `security`：安全類（登入警示），強制送
- `marketing`：行銷類，需 `marketingConsent[channel] === true`
- `system`：系統通知

## 用法

```typescript
import { NotificationCenter, InMemoryNotificationStore } from '@saas-factory/notifications';

const center = new NotificationCenter({
  dispatchers: [emailDispatcher, smsDispatcher, ...],
  store: payloadStore,
  profileResolver: { get: (id) => loadProfile(id) },
});

await center.send({
  userId: 'u1',
  channels: ['email', 'in-app'],
  templateId: 'order-confirmed',
  category: 'transactional',
  data: { orderNumber: 'O-1234' },
  dedupeWindowMs: 60_000,
});
```

## 法規同意

行銷類強制檢查 `marketingConsent[channel]`；security 類強制送（即使使用者關閉偏好）。

## 指令

```bash
pnpm typecheck
pnpm lint
pnpm test
```
