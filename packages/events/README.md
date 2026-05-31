# @saas-factory/events

Domain event bus。對應 ADR-0010 §10。

## 用途

- 跨 module / 跨 package 解耦：訂單模組 emit `order.completed`、發票模組 / 通知模組各自監聽
- 非 collection 事件來源（cron、外部 webhook、CLI script）也走這條

## 使用

```typescript
import { getEventBus } from '@saas-factory/events';

const bus = getEventBus();

// 監聽
bus.on('order.completed', async (event) => {
  // event.payload 型別自動收斂為 { orderId, tenantId, total }
});

// 發布
await bus.emit({
  type: 'order.completed',
  payload: { orderId: 'O-1', tenantId: 'T-1', total: 1000 },
});
```

## 規則

1. 所有事件必須在 `src/types.ts` 的 `DomainEvent` union 中定義、不准用字串開洞
2. payload 必含 `tenantId`（除非全域系統事件）
3. handler 內部要 try/catch；本 bus 用 `Promise.allSettled` 確保單一 handler 噴錯不拖垮其他
4. 跨 process 不支援；多 region 部署時升級到 Redis pub/sub 或 Inngest（再開新 ADR）

## 指令

```bash
pnpm typecheck
pnpm lint
pnpm test
```
