import { describe, expect, it } from 'vitest';

import {
  InMemoryCountdownStore,
  issueCountdownToken,
  verifyCountdownToken,
} from './countdown-timer.js';

const SECRET = 'test-secret';

describe('issueCountdownToken', () => {
  it('首次造訪建立新 endsAt 並簽章', async () => {
    const store = new InMemoryCountdownStore();
    const now = new Date('2026-05-15T10:00:00Z');
    const t = await issueCountdownToken({
      store,
      visitorId: 'v1',
      blockId: 'b1',
      perVisitorMinutes: 30,
      secret: SECRET,
      now: () => now,
    });
    expect(new Date(t.endsAt).getTime()).toBe(now.getTime() + 30 * 60_000);
    expect(t.sig).toMatch(/^[0-9a-f]{64}$/);
  });

  it('同訪客同 block 在 endsAt 之前重複呼叫沿用同一 endsAt', async () => {
    const store = new InMemoryCountdownStore();
    const t1 = await issueCountdownToken({
      store,
      visitorId: 'v1',
      blockId: 'b1',
      perVisitorMinutes: 30,
      secret: SECRET,
      now: () => new Date('2026-05-15T10:00:00Z'),
    });
    const t2 = await issueCountdownToken({
      store,
      visitorId: 'v1',
      blockId: 'b1',
      perVisitorMinutes: 30,
      secret: SECRET,
      now: () => new Date('2026-05-15T10:10:00Z'),
    });
    expect(t1.endsAt).toBe(t2.endsAt);
    expect(t1.sig).toBe(t2.sig);
  });

  it('endsAt 過期後重新發新的 token', async () => {
    const store = new InMemoryCountdownStore();
    const t1 = await issueCountdownToken({
      store,
      visitorId: 'v1',
      blockId: 'b1',
      perVisitorMinutes: 1,
      secret: SECRET,
      now: () => new Date('2026-05-15T10:00:00Z'),
    });
    const t2 = await issueCountdownToken({
      store,
      visitorId: 'v1',
      blockId: 'b1',
      perVisitorMinutes: 5,
      secret: SECRET,
      now: () => new Date('2026-05-15T11:00:00Z'),
    });
    expect(t1.endsAt).not.toBe(t2.endsAt);
  });
});

describe('verifyCountdownToken', () => {
  it('合法 token → true', async () => {
    const store = new InMemoryCountdownStore();
    const t = await issueCountdownToken({
      store,
      visitorId: 'v1',
      blockId: 'b1',
      perVisitorMinutes: 30,
      secret: SECRET,
      now: () => new Date('2026-05-15T10:00:00Z'),
    });
    expect(
      verifyCountdownToken({
        visitorId: 'v1',
        blockId: 'b1',
        endsAt: t.endsAt,
        sig: t.sig,
        secret: SECRET,
      }),
    ).toBe(true);
  });

  it('被竄改的 endsAt → false', async () => {
    const store = new InMemoryCountdownStore();
    const t = await issueCountdownToken({
      store,
      visitorId: 'v1',
      blockId: 'b1',
      perVisitorMinutes: 30,
      secret: SECRET,
      now: () => new Date('2026-05-15T10:00:00Z'),
    });
    expect(
      verifyCountdownToken({
        visitorId: 'v1',
        blockId: 'b1',
        endsAt: '2099-01-01T00:00:00.000Z',
        sig: t.sig,
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it('換訪客 → false', async () => {
    const store = new InMemoryCountdownStore();
    const t = await issueCountdownToken({
      store,
      visitorId: 'v1',
      blockId: 'b1',
      perVisitorMinutes: 30,
      secret: SECRET,
      now: () => new Date('2026-05-15T10:00:00Z'),
    });
    expect(
      verifyCountdownToken({
        visitorId: 'v2',
        blockId: 'b1',
        endsAt: t.endsAt,
        sig: t.sig,
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it('錯誤 secret → false', async () => {
    const store = new InMemoryCountdownStore();
    const t = await issueCountdownToken({
      store,
      visitorId: 'v1',
      blockId: 'b1',
      perVisitorMinutes: 30,
      secret: SECRET,
      now: () => new Date('2026-05-15T10:00:00Z'),
    });
    expect(
      verifyCountdownToken({
        visitorId: 'v1',
        blockId: 'b1',
        endsAt: t.endsAt,
        sig: t.sig,
        secret: 'other-secret',
      }),
    ).toBe(false);
  });

  it('長度不同的 sig → false（防 timingSafeEqual 噴錯）', () => {
    expect(
      verifyCountdownToken({
        visitorId: 'v1',
        blockId: 'b1',
        endsAt: '2026-05-15T10:30:00.000Z',
        sig: 'short',
        secret: SECRET,
      }),
    ).toBe(false);
  });
});
