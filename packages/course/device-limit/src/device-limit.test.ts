import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryDeviceSessionStore } from './in-memory-store.js';
import { DeviceLimitService } from './service.js';

const TENANT = 't1';
const USER = 'u1';

function svc(config = {}) {
  const store = new InMemoryDeviceSessionStore();
  const service = new DeviceLimitService(store, config);
  return { store, service };
}

function reg(svc: DeviceLimitService, opts: Partial<Parameters<DeviceLimitService['registerSession']>[0]>) {
  return svc.registerSession({
    tenantId: TENANT,
    userId: USER,
    deviceId: opts.deviceId ?? 'd1',
    ip: opts.ip,
    geoCountry: opts.geoCountry,
    userAgent: opts.userAgent,
    now: opts.now,
  });
}

describe('DeviceLimitService.registerSession', () => {
  let service: DeviceLimitService;
  beforeEach(() => {
    service = svc({ maxConcurrent: 3 }).service;
  });

  it('未滿上限 → 直接新增', async () => {
    const r1 = await reg(service, { deviceId: 'd1', now: new Date(2026, 4, 15, 10, 0, 0) });
    const r2 = await reg(service, { deviceId: 'd2', now: new Date(2026, 4, 15, 10, 1, 0) });
    expect(r1.revoked).toHaveLength(0);
    expect(r2.revoked).toHaveLength(0);
  });

  it('同 deviceId 重複註冊 → 不佔額外名額', async () => {
    await reg(service, { deviceId: 'd1', now: new Date(2026, 4, 15, 10, 0, 0) });
    const r = await reg(service, { deviceId: 'd1', now: new Date(2026, 4, 15, 10, 5, 0) });
    expect(r.revoked).toHaveLength(0);
    const list = await service.listActive(TENANT, USER, new Date(2026, 4, 15, 10, 6, 0));
    expect(list).toHaveLength(1);
  });

  it('超過 3 台 → 踢掉最舊', async () => {
    await reg(service, { deviceId: 'd1', now: new Date(2026, 4, 15, 10, 0, 0) });
    await reg(service, { deviceId: 'd2', now: new Date(2026, 4, 15, 10, 1, 0) });
    await reg(service, { deviceId: 'd3', now: new Date(2026, 4, 15, 10, 2, 0) });
    const r = await reg(service, { deviceId: 'd4', now: new Date(2026, 4, 15, 10, 3, 0) });
    expect(r.revoked).toHaveLength(1);
    expect(r.revoked[0]?.deviceId).toBe('d1');
    expect(r.revoked[0]?.revokedReason).toBe('force-logout-on-limit');
  });
});

describe('DeviceLimitService geo anomaly', () => {
  it('1 小時內換國家 → geoAnomaly = true', async () => {
    const { service } = svc({ geoAnomalyWindowSeconds: 3600 });
    await reg(service, { deviceId: 'd1', geoCountry: 'TW', now: new Date(2026, 4, 15, 10, 0, 0) });
    const r = await reg(service, {
      deviceId: 'd2',
      geoCountry: 'JP',
      now: new Date(2026, 4, 15, 10, 30, 0),
    });
    expect(r.geoAnomaly).toBe(true);
  });

  it('超過時間窗 → 不告警', async () => {
    const { service } = svc({ geoAnomalyWindowSeconds: 3600 });
    await reg(service, { deviceId: 'd1', geoCountry: 'TW', now: new Date(2026, 4, 15, 10, 0, 0) });
    const r = await reg(service, {
      deviceId: 'd2',
      geoCountry: 'JP',
      now: new Date(2026, 4, 15, 13, 0, 0),
    });
    expect(r.geoAnomaly).toBe(false);
  });
});

describe('DeviceLimitService heartbeat', () => {
  it('active session heartbeat 成功更新 lastSeenAt', async () => {
    const { service, store } = svc();
    const t1 = new Date(2026, 4, 15, 10, 0, 0);
    const t2 = new Date(2026, 4, 15, 10, 5, 0);
    const r = await reg(service, { deviceId: 'd1', now: t1 });
    expect(await service.heartbeat(r.session.id, t2)).toBe(true);
    const updated = await store.get(r.session.id);
    expect(updated?.lastSeenAt.getTime()).toBe(t2.getTime());
  });

  it('idle 超時 → 自動 expire', async () => {
    const { service } = svc({ idleTimeoutSeconds: 60 });
    const t1 = new Date(2026, 4, 15, 10, 0, 0);
    const t2 = new Date(2026, 4, 15, 10, 5, 0);
    const r = await reg(service, { deviceId: 'd1', now: t1 });
    expect(await service.heartbeat(r.session.id, t2)).toBe(false);
  });

  it('已撤銷的 session heartbeat → false', async () => {
    const { service } = svc();
    const r = await reg(service, { deviceId: 'd1' });
    await service.revokeSession(r.session.id);
    expect(await service.heartbeat(r.session.id)).toBe(false);
  });
});

describe('DeviceLimitService revoke', () => {
  it('revokeAll 撤銷所有 active', async () => {
    const { service } = svc();
    await reg(service, { deviceId: 'd1', now: new Date(2026, 4, 15, 10, 0, 0) });
    await reg(service, { deviceId: 'd2', now: new Date(2026, 4, 15, 10, 1, 0) });
    const n = await service.revokeAll(TENANT, USER, 'password-changed');
    expect(n).toBe(2);
    const list = await service.listActive(TENANT, USER, new Date(2026, 4, 15, 10, 2, 0));
    expect(list).toHaveLength(0);
  });
});
