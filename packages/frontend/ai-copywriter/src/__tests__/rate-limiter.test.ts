import { describe, expect, it } from 'vitest';

import { TokenBucketRateLimiter } from '../rate-limiter.js';

/**
 * 用可控時鐘 + 手動排程的 limiter 工廠。
 *
 * 排程器把 callback 推進 `pending` queue，由測試手動觸發，避免被真實 timer 拖慢。
 */
function makeTestLimiter(capacity: number, intervalMs: number): {
  limiter: TokenBucketRateLimiter;
  advance: (ms: number) => void;
} {
  let now = 0;
  const pending: Array<{ at: number; cb: () => void }> = [];
  const limiter = new TokenBucketRateLimiter({
    capacity,
    intervalMs,
    now: () => now,
    schedule: (cb, delay) => {
      pending.push({ at: now + delay, cb });
    },
  });
  const advance = (ms: number): void => {
    now += ms;
    // 依時間順序執行已到期 callback
    pending
      .filter((p) => p.at <= now)
      .sort((a, b) => a.at - b.at)
      .forEach((p) => {
        const idx = pending.indexOf(p);
        if (idx >= 0) {
          pending.splice(idx, 1);
        }
        p.cb();
      });
  };
  return { limiter, advance };
}

describe('TokenBucketRateLimiter', () => {
  it('初始可用 token 等於 capacity，連續 acquire 直到耗盡都 resolve', async () => {
    const { limiter } = makeTestLimiter(3, 60_000);
    expect(limiter.getRemaining()).toBe(3);
    await limiter.acquire();
    await limiter.acquire();
    await limiter.acquire();
    expect(limiter.getRemaining()).toBe(0);
  });

  it('超過容量時排隊，等到時間補滿才 resolve', async () => {
    const { limiter, advance } = makeTestLimiter(2, 1000);
    await limiter.acquire();
    await limiter.acquire();

    let resolved = false;
    const waiting = limiter.acquire().then(() => {
      resolved = true;
    });

    // 還沒前進時間，應該還在 pending
    await Promise.resolve();
    expect(resolved).toBe(false);

    // 推進半個補充週期（不夠補 1 token），仍 pending
    advance(400);
    await Promise.resolve();
    expect(resolved).toBe(false);

    // 再推進到超過 500ms（capacity=2 / intervalMs=1000 → 500ms/token），應該 resolve
    advance(200);
    await waiting;
    expect(resolved).toBe(true);
  });

  it('getRemaining 隨時間補回但不會超過 capacity', async () => {
    const { limiter, advance } = makeTestLimiter(5, 1000);
    await limiter.acquire();
    await limiter.acquire();
    expect(limiter.getRemaining()).toBe(3);

    // 推進 600ms，應補 3 個 token（5 token / 1000ms = 0.005/ms → 600ms 補 3 個），但上限 5
    advance(600);
    expect(limiter.getRemaining()).toBe(5);

    // 再推進 10 秒，仍卡在 5
    advance(10_000);
    expect(limiter.getRemaining()).toBe(5);
  });

  it('採預設值時 capacity = 10、intervalMs = 60000', async () => {
    const limiter = new TokenBucketRateLimiter();
    expect(limiter.getRemaining()).toBe(10);
    // 連續取 10 個都應該即時 resolve
    for (let i = 0; i < 10; i += 1) {
      await limiter.acquire();
    }
    expect(limiter.getRemaining()).toBe(0);
  });
});
