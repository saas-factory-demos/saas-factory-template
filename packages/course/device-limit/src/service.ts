import { randomUUID } from 'node:crypto';

import type {
  DeviceLimitConfig,
  DeviceSession,
  DeviceSessionStore,
  RegisterSessionInput,
  RegisterSessionResult,
} from './types.js';

const DEFAULT_MAX = 3;
const DEFAULT_IDLE = 30 * 60;
const DEFAULT_GEO_WINDOW = 3600;

/** 裝置同時數限制 / 跨地理偵測 service。 */
export class DeviceLimitService {
  private readonly store: DeviceSessionStore;
  private readonly maxConcurrent: number;
  private readonly idleTimeoutSeconds: number;
  private readonly geoAnomalyWindowSeconds: number;

  constructor(store: DeviceSessionStore, config: DeviceLimitConfig = {}) {
    this.store = store;
    this.maxConcurrent = config.maxConcurrent ?? DEFAULT_MAX;
    this.idleTimeoutSeconds = config.idleTimeoutSeconds ?? DEFAULT_IDLE;
    this.geoAnomalyWindowSeconds = config.geoAnomalyWindowSeconds ?? DEFAULT_GEO_WINDOW;
  }

  /**
   * 註冊（或重新啟用）一筆裝置 session。
   *
   * - 同一個 deviceId 已存在：直接更新時間 + 狀態，不佔額外名額
   * - 超過 maxConcurrent：強制下線最舊的 active session
   * - 跨地理 + 短時間（< geoAnomalyWindowSeconds）：geoAnomaly = true（不阻擋，前端可顯示警告）
   */
  async registerSession(input: RegisterSessionInput): Promise<RegisterSessionResult> {
    const now = input.now ?? new Date();
    const existing = await this.store.list(input.tenantId, input.userId);
    const sweptExisting = this.sweepIdle(existing, now);

    // 同裝置 → 直接更新
    const same = sweptExisting.find((s) => s.deviceId === input.deviceId && s.status === 'active');
    if (same) {
      same.lastSeenAt = now;
      same.ip = input.ip ?? same.ip;
      same.userAgent = input.userAgent ?? same.userAgent;
      same.geoCountry = input.geoCountry ?? same.geoCountry;
      same.geoCity = input.geoCity ?? same.geoCity;
      await this.store.upsert(same);
      return { session: same, revoked: [], geoAnomaly: false };
    }

    // 跨地理偵測：上一筆 active 在 geoAnomalyWindowSeconds 內、且國家不同
    const geoAnomaly = this.detectGeoAnomaly(sweptExisting, input, now);

    // 寫入新 session
    const session: DeviceSession = {
      id: randomUUID(),
      tenantId: input.tenantId,
      userId: input.userId,
      deviceId: input.deviceId,
      userAgent: input.userAgent,
      ip: input.ip,
      geoCountry: input.geoCountry,
      geoCity: input.geoCity,
      status: 'active',
      createdAt: now,
      lastSeenAt: now,
    };
    await this.store.upsert(session);

    // 算上新進來的這一筆是否超過 maxConcurrent
    const activeAfter = sweptExisting.filter((s) => s.status === 'active').concat(session);
    const revoked: DeviceSession[] = [];
    if (activeAfter.length > this.maxConcurrent) {
      const sortedOldFirst = activeAfter
        .filter((s) => s.id !== session.id)
        .sort((a, b) => a.lastSeenAt.getTime() - b.lastSeenAt.getTime());
      const overflow = activeAfter.length - this.maxConcurrent;
      for (let i = 0; i < overflow; i++) {
        const victim = sortedOldFirst[i];
        if (!victim) break;
        victim.status = 'revoked';
        victim.revokedReason = 'force-logout-on-limit';
        await this.store.upsert(victim);
        revoked.push(victim);
      }
    }

    return { session, revoked, geoAnomaly };
  }

  /** 心跳更新；若 session 已撤銷或過期，回傳 false 給前端要求重新登入。 */
  async heartbeat(sessionId: string, now: Date = new Date()): Promise<boolean> {
    const s = await this.store.get(sessionId);
    if (!s) return false;
    if (s.status !== 'active') return false;
    if (this.isIdleExpired(s, now)) {
      s.status = 'expired';
      s.revokedReason = 'expired';
      await this.store.upsert(s);
      return false;
    }
    s.lastSeenAt = now;
    await this.store.upsert(s);
    return true;
  }

  /** 列出該使用者所有 active session（會順帶 sweep 過期的）。 */
  async listActive(tenantId: string, userId: string, now: Date = new Date()): Promise<DeviceSession[]> {
    const sessions = await this.store.list(tenantId, userId);
    const swept = await this.sweepAndPersist(sessions, now);
    return swept.filter((s) => s.status === 'active');
  }

  /** 手動撤銷指定 session（例如使用者在帳號設定按「登出此裝置」）。 */
  async revokeSession(sessionId: string, reason = 'manual'): Promise<void> {
    const s = await this.store.get(sessionId);
    if (!s || s.status !== 'active') return;
    s.status = 'revoked';
    s.revokedReason = reason;
    await this.store.upsert(s);
  }

  /** 撤銷該使用者所有 session（密碼變更 / 帳號鎖定後呼叫）。 */
  async revokeAll(tenantId: string, userId: string, reason = 'manual'): Promise<number> {
    const sessions = await this.store.list(tenantId, userId);
    let n = 0;
    for (const s of sessions) {
      if (s.status === 'active') {
        s.status = 'revoked';
        s.revokedReason = reason;
        await this.store.upsert(s);
        n++;
      }
    }
    return n;
  }

  private sweepIdle(sessions: DeviceSession[], now: Date): DeviceSession[] {
    return sessions.map((s) => {
      if (s.status === 'active' && this.isIdleExpired(s, now)) {
        return { ...s, status: 'expired', revokedReason: 'expired' } satisfies DeviceSession;
      }
      return s;
    });
  }

  private async sweepAndPersist(sessions: DeviceSession[], now: Date): Promise<DeviceSession[]> {
    const result: DeviceSession[] = [];
    for (const s of sessions) {
      if (s.status === 'active' && this.isIdleExpired(s, now)) {
        const expired: DeviceSession = { ...s, status: 'expired', revokedReason: 'expired' };
        await this.store.upsert(expired);
        result.push(expired);
      } else {
        result.push(s);
      }
    }
    return result;
  }

  private isIdleExpired(s: DeviceSession, now: Date): boolean {
    const idle = (now.getTime() - s.lastSeenAt.getTime()) / 1000;
    return idle > this.idleTimeoutSeconds;
  }

  private detectGeoAnomaly(
    existing: DeviceSession[],
    input: RegisterSessionInput,
    now: Date,
  ): boolean {
    if (!input.geoCountry) return false;
    const recent = existing
      .filter((s) => s.status === 'active' && s.geoCountry && s.geoCountry !== input.geoCountry)
      .sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime());
    const last = recent[0];
    if (!last) return false;
    const deltaSec = (now.getTime() - last.lastSeenAt.getTime()) / 1000;
    return deltaSec <= this.geoAnomalyWindowSeconds;
  }
}
