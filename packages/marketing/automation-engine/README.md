# @saas-factory/marketing-automation-engine

跨網站類型的行銷自動化核心引擎。提供事件 → 條件 → 動作 → 延遲 → 重試 的 workflow runner。

## 概念

```
event ─→ engine.dispatch
        │
        ▼
   match workflows (event name + trigger conditions)
        │
        ▼
   spawn run per workflow → advance through steps
        │
        ├─ action  → call ActionHandler, write contextPatch, 失敗排程重試
        ├─ delay   → 標 waiting，呼 Scheduler.schedule(runId, resumeAt)
        └─ gate    → 條件不符 onFalse=stop / continue
```

## 用法

```ts
import {
  AutomationEngine,
  InMemoryWorkflowStore,
  InMemoryWorkflowRunStore,
} from '@saas-factory/marketing-automation-engine';

const engine = new AutomationEngine(
  new InMemoryWorkflowStore(),
  new InMemoryWorkflowRunStore(),
  {
    actions: {
      'send-email': async (params, ctx) => {
        await emailService.send(ctx.customerEmail, params.template);
        return { ok: true };
      },
    },
    scheduler: {
      async schedule(runId, at) {
        await bullmq.add('automation-resume', { runId }, { delay: at.getTime() - Date.now() });
      },
    },
  },
);

await engine.createWorkflow({
  tenantId,
  name: '棄單第一封',
  trigger: { event: 'cart.abandoned' },
  steps: [
    { kind: 'delay', delayMs: 60 * 60 * 1000 },
    {
      kind: 'gate',
      condition: { field: 'cart.totalMinor', op: 'gte', value: 50000 },
      onFalse: 'stop',
    },
    { kind: 'action', action: 'send-email', params: { template: 'cart-abandoned-1' } },
  ],
});

// 上游各模組發事件
await engine.dispatch({
  name: 'cart.abandoned',
  tenantId,
  payload: { cartId, customerEmail, cart: { totalMinor: 99000 } },
  at: new Date(),
});

// Worker 拉到時的 waiting run
await engine.resumeDue(new Date());
```

## 條件 DSL

```ts
type Condition =
  | { field: string; op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not-in' | 'exists' | 'not-exists'; value?: unknown }
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition };
```

`field` 用 dot-path 對 context 取值（如 `order.tier`、`customer.lifecycle`）。

## 重試策略

action 失敗時：
- 累計 `attempts`，指數退避（30s → 60s → 120s）排程重試
- 達 `maxAttempts`（預設 3）後標 `failed`
- 動作 throw exception 與回傳 `{ ok: false }` 等同處理
