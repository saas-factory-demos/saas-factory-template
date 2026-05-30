import { describe, expect, it } from 'vitest';

import { LiveNotificationService, type RealOrderSource } from './service.js';

import type { LiveNotificationConfig } from './types.js';

function baseConfig(overrides: Partial<LiveNotificationConfig> = {}): LiveNotificationConfig {
  return {
    tenantId: 't1',
    pageId: 'p1',
    enabled: true,
    mode: 'simulated',
    position: 'bottom-left',
    firstDelaySeconds: 5,
    intervalRange: { minSeconds: 30, maxSeconds: 60 },
    simulatedPool: [
      { displayName: '陳O芳', productTitle: '三盒組', locationHint: '台北市' },
      { displayName: '林O明', productTitle: '單盒', locationHint: '高雄市' },
    ],
    ...overrides,
  };
}

describe('LiveNotificationService.next - simulated', () => {
  it('回隨機 payload 並掛上 sample 合規標籤', async () => {
    const svc = new LiveNotificationService({ random: () => 0, genId: () => 'ln1' });
    const p = await svc.next(baseConfig());
    expect(p).toBeDefined();
    expect(p?.compliance).toBe('sample');
    expect(p?.displayName).toBe('陳O芳');
    expect(p?.position).toBe('bottom-left');
  });

  it('disabled → undefined', async () => {
    const svc = new LiveNotificationService();
    expect(await svc.next(baseConfig({ enabled: false }))).toBeUndefined();
  });

  it('simulatedPool 空 → undefined', async () => {
    const svc = new LiveNotificationService();
    expect(await svc.next(baseConfig({ simulatedPool: [] }))).toBeUndefined();
  });
});

describe('LiveNotificationService.next - real', () => {
  it('回 verified 合規標籤 + timeAgo 字串', async () => {
    const realOrderSource: RealOrderSource = async () => [
      {
        id: 'o1',
        displayName: '王O美',
        productId: 'p1',
        productTitle: '雙盒組',
        locationHint: '台中市',
        createdAt: new Date('2026-05-15T09:55:00Z'),
      },
    ];
    const svc = new LiveNotificationService({
      now: () => new Date('2026-05-15T10:00:00Z'),
      random: () => 0,
      realOrderSource,
      genId: () => 'ln_r1',
    });
    const p = await svc.next(baseConfig({ mode: 'real' }));
    expect(p?.compliance).toBe('verified');
    expect(p?.timeAgoLabel).toBe('5 分鐘前');
  });

  it('沒注入 realOrderSource → throw', async () => {
    const svc = new LiveNotificationService({ now: () => new Date('2026-05-15T10:00:00Z') });
    await expect(svc.next(baseConfig({ mode: 'real' }))).rejects.toThrow(/realOrderSource/);
  });

  it('source 空 → undefined（自動跳過顯示）', async () => {
    const realOrderSource: RealOrderSource = async () => [];
    const svc = new LiveNotificationService({ realOrderSource });
    expect(await svc.next(baseConfig({ mode: 'real' }))).toBeUndefined();
  });
});

describe('LiveNotificationService.nextDelaySeconds', () => {
  it('首則使用 firstDelaySeconds', () => {
    const svc = new LiveNotificationService();
    expect(svc.nextDelaySeconds(baseConfig(), true)).toBe(5);
  });

  it('後續按 range 隨機', () => {
    const svc = new LiveNotificationService({ random: () => 0.5 });
    const v = svc.nextDelaySeconds(baseConfig(), false);
    expect(v).toBeGreaterThanOrEqual(30);
    expect(v).toBeLessThanOrEqual(60);
  });

  it('range max < min → throw', () => {
    const svc = new LiveNotificationService();
    expect(() =>
      svc.nextDelaySeconds(baseConfig({ intervalRange: { minSeconds: 60, maxSeconds: 30 } }), false),
    ).toThrow(/min/);
  });
});

describe('LiveNotificationService.preview', () => {
  it('依名單回最多 N 筆', () => {
    const svc = new LiveNotificationService();
    const list = svc.preview(baseConfig(), 5);
    expect(list).toHaveLength(2);
    expect(list[0]?.compliance).toBe('sample');
  });
});
