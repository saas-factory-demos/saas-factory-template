import { EventEmitter } from 'node:events';

import type { DomainEvent, DomainEventHandler, DomainEventType } from './types.js';

/**
 * 事件匯流排介面。
 *
 * 對應 ADR-0010 §10。
 * - 第一版用 Node 內建 EventEmitter，單 process。
 * - 跨 process（多 region 部署）時換 Redis pub/sub 或 Inngest。
 */
export interface EventBus {
  emit(event: DomainEvent): Promise<void>;
  on<T extends DomainEventType>(type: T, handler: DomainEventHandler<T>): void;
  off<T extends DomainEventType>(type: T, handler: DomainEventHandler<T>): void;
  /** 測試用：清空所有 listener。 */
  clear(): void;
}

class NodeEventBus implements EventBus {
  private readonly emitter = new EventEmitter();

  constructor() {
    // 防止單個事件 listener 過多時噴警告（業務上很常見多個 handler）
    this.emitter.setMaxListeners(50);
  }

  async emit(event: DomainEvent): Promise<void> {
    const handlers = this.emitter.listeners(event.type) as Array<
      DomainEventHandler<typeof event.type>
    >;
    // 包 Promise.resolve().then 讓 sync throw 也轉成 rejected promise，
    // 避免單一 handler 噴錯拖垮其他 handler
    await Promise.allSettled(
      handlers.map((handler) =>
        Promise.resolve().then(() => handler(event)),
      ),
    );
  }

  on<T extends DomainEventType>(type: T, handler: DomainEventHandler<T>): void {
    this.emitter.on(type, handler as (event: DomainEvent) => void);
  }

  off<T extends DomainEventType>(type: T, handler: DomainEventHandler<T>): void {
    this.emitter.off(type, handler as (event: DomainEvent) => void);
  }

  clear(): void {
    this.emitter.removeAllListeners();
  }
}

/**
 * 取得全域唯一 EventBus 實例。
 *
 * 在同一個 Node process 內共享、避免每個模組各自 new 一份。
 */
let singleton: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!singleton) {
    singleton = new NodeEventBus();
  }
  return singleton;
}

/** 測試用：重置 singleton（讓單測之間隔離）。 */
export function resetEventBus(): void {
  singleton = null;
}
