import { afterEach, describe, expect, it, vi } from 'vitest';

import { getEventBus, resetEventBus } from './bus.js';

describe('EventBus', () => {
  afterEach(() => {
    resetEventBus();
  });

  it('註冊 handler 後 emit 對應事件能收到 payload', async () => {
    const bus = getEventBus();
    const handler = vi.fn();
    bus.on('order.completed', handler);

    await bus.emit({
      type: 'order.completed',
      payload: { orderId: 'O-1', tenantId: 'T-1', total: 1000 },
    });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0]?.[0]).toEqual({
      type: 'order.completed',
      payload: { orderId: 'O-1', tenantId: 'T-1', total: 1000 },
    });
  });

  it('單一 handler 噴錯不會拖垮其他 handler', async () => {
    const bus = getEventBus();
    const good = vi.fn();
    bus.on('order.refunded', () => {
      throw new Error('boom');
    });
    bus.on('order.refunded', good);

    await bus.emit({
      type: 'order.refunded',
      payload: { orderId: 'O-2', tenantId: 'T-1', amount: 500 },
    });

    expect(good).toHaveBeenCalledOnce();
  });

  it('off() 後 handler 不再被觸發', async () => {
    const bus = getEventBus();
    const handler = vi.fn();
    bus.on('auth.login', handler);
    bus.off('auth.login', handler);

    await bus.emit({
      type: 'auth.login',
      payload: { userId: 'U-1', tenantId: 'T-1', ip: '127.0.0.1' },
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('singleton：多次 getEventBus 拿到同一實例', () => {
    expect(getEventBus()).toBe(getEventBus());
  });
});
