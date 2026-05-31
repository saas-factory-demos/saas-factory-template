import { describe, expect, it } from 'vitest';

import {
  TWO_FA_GRACE_PERIOD_DAYS,
  check2FAEnforcement,
  shouldBlockUntil2FA,
  shouldNudge2FA,
} from './enforce-2fa.js';

const NOW = new Date('2026-05-19T12:00:00Z');

function daysAgo(n: number): Date {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);
}

describe('check2FAEnforcement', () => {
  it('非 staff role → not-required（role-not-staff）', () => {
    const r = check2FAEnforcement(
      { role: 'customer', createdAt: daysAgo(30), totpEnabled: false, passkeyCount: 0 },
      NOW,
    );
    expect(r.status).toBe('not-required');
    expect(r).toMatchObject({ reason: 'role-not-staff' });
  });

  it('staff 但非 owner/admin → not-required（role-exempt）', () => {
    const r = check2FAEnforcement(
      { role: 'cs', createdAt: daysAgo(30), totpEnabled: false, passkeyCount: 0 },
      NOW,
    );
    expect(r.status).toBe('not-required');
    expect(r).toMatchObject({ reason: 'role-exempt' });
  });

  it('owner 已啟用 TOTP → satisfied(totp)', () => {
    const r = check2FAEnforcement(
      { role: 'owner', createdAt: daysAgo(30), totpEnabled: true, passkeyCount: 0 },
      NOW,
    );
    expect(r).toEqual({ status: 'satisfied', method: 'totp' });
  });

  it('admin 已註冊 Passkey → satisfied(passkey)', () => {
    const r = check2FAEnforcement(
      { role: 'admin', createdAt: daysAgo(30), totpEnabled: false, passkeyCount: 2 },
      NOW,
    );
    expect(r).toEqual({ status: 'satisfied', method: 'passkey' });
  });

  it('owner TOTP + Passkey 都有 → satisfied(both)', () => {
    const r = check2FAEnforcement(
      { role: 'owner', createdAt: daysAgo(1), totpEnabled: true, passkeyCount: 1 },
      NOW,
    );
    expect(r).toEqual({ status: 'satisfied', method: 'both' });
  });

  it('owner 帳號 3 天前建、未啟用 → grace-period（4 天剩餘）', () => {
    const r = check2FAEnforcement(
      { role: 'owner', createdAt: daysAgo(3), totpEnabled: false, passkeyCount: 0 },
      NOW,
    );
    expect(r).toEqual({
      status: 'grace-period',
      daysRemaining: TWO_FA_GRACE_PERIOD_DAYS - 3,
    });
  });

  it('owner 帳號 10 天前建、未啟用 → must-enable（3 天逾期）', () => {
    const r = check2FAEnforcement(
      { role: 'owner', createdAt: daysAgo(10), totpEnabled: false, passkeyCount: 0 },
      NOW,
    );
    expect(r).toEqual({
      status: 'must-enable',
      daysOverdue: 10 - TWO_FA_GRACE_PERIOD_DAYS,
    });
  });

  it('剛好第 7 天 → must-enable（0 天逾期）', () => {
    const r = check2FAEnforcement(
      { role: 'admin', createdAt: daysAgo(7), totpEnabled: false, passkeyCount: 0 },
      NOW,
    );
    expect(r).toEqual({ status: 'must-enable', daysOverdue: 0 });
  });
});

describe('shouldBlockUntil2FA', () => {
  it('must-enable → 擋', () => {
    expect(shouldBlockUntil2FA({ status: 'must-enable', daysOverdue: 1 })).toBe(true);
  });

  it('grace-period → 不擋（只是提示）', () => {
    expect(shouldBlockUntil2FA({ status: 'grace-period', daysRemaining: 3 })).toBe(false);
  });

  it('satisfied → 不擋', () => {
    expect(shouldBlockUntil2FA({ status: 'satisfied', method: 'totp' })).toBe(false);
  });

  it('not-required → 不擋', () => {
    expect(shouldBlockUntil2FA({ status: 'not-required', reason: 'role-exempt' })).toBe(false);
  });
});

describe('shouldNudge2FA', () => {
  it('grace-period → 提示', () => {
    expect(shouldNudge2FA({ status: 'grace-period', daysRemaining: 3 })).toBe(true);
  });

  it('must-enable → 不算 nudge（已擋）', () => {
    expect(shouldNudge2FA({ status: 'must-enable', daysOverdue: 1 })).toBe(false);
  });

  it('satisfied → 無提示', () => {
    expect(shouldNudge2FA({ status: 'satisfied', method: 'totp' })).toBe(false);
  });
});
