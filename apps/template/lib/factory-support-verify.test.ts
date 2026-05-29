import { signRequest } from '@saas-factory/factory-hmac';
import {
  SUPPORT_ACCESS_BASE_PATH,
  type SupportAccessAction,
} from '@saas-factory/factory-support-access';
import { describe, expect, it } from 'vitest';

import { validateSupportAccessBody, verifyFactorySupportRequest } from './factory-support-verify.js';

const SECRET = 'abcdef0123456789abcdef0123456789'; // 32 chars

function buildRequest(action: SupportAccessAction, body: unknown, now = 1_700_000_000) {
  const path = `${SUPPORT_ACCESS_BASE_PATH}/${action}`;
  const rawBody = JSON.stringify(body);
  const signature = signRequest(SECRET, {
    method: 'POST',
    path,
    body: rawBody,
    timestamp: now,
  });
  return {
    secret: SECRET,
    method: 'POST',
    path,
    action,
    rawBody,
    headers: { timestamp: String(now), signature },
    now,
  };
}

describe('validateSupportAccessBody', () => {
  it('provision：email + actorEmail 缺 → 拒絕', () => {
    expect(validateSupportAccessBody('provision', {})).toMatch(/email/);
    expect(validateSupportAccessBody('provision', { email: 'bad' })).toMatch(/email/);
    expect(
      validateSupportAccessBody('provision', { email: 'a@b.com' }),
    ).toMatch(/actorEmail/);
  });

  it('provision：完整 → ok', () => {
    expect(
      validateSupportAccessBody('provision', {
        email: 'support@example.com',
        actorEmail: 'me@example.com',
      }),
    ).toBe(true);
  });

  it('rotate-password / disable / enable：缺 reason → 拒絕', () => {
    for (const action of ['rotate-password', 'disable', 'enable'] as const) {
      expect(validateSupportAccessBody(action, { actorEmail: 'me@example.com' })).toMatch(
        /reason/,
      );
    }
  });

  it('rotate-password：完整 → ok', () => {
    expect(
      validateSupportAccessBody('rotate-password', {
        actorEmail: 'me@example.com',
        reason: '修復結帳',
      }),
    ).toBe(true);
  });

  it('status：缺 actorEmail → 拒絕', () => {
    expect(validateSupportAccessBody('status', {})).toMatch(/actorEmail/);
    expect(validateSupportAccessBody('status', { actorEmail: 'me@example.com' })).toBe(true);
  });

  it('audit-log：缺 actorEmail → 拒絕', () => {
    expect(validateSupportAccessBody('audit-log', {})).toMatch(/actorEmail/);
  });

  it('audit-log：limit 越界 → 拒絕', () => {
    expect(
      validateSupportAccessBody('audit-log', { actorEmail: 'me@example.com', limit: 0 }),
    ).toMatch(/limit/);
    expect(
      validateSupportAccessBody('audit-log', { actorEmail: 'me@example.com', limit: 101 }),
    ).toMatch(/limit/);
    expect(
      validateSupportAccessBody('audit-log', { actorEmail: 'me@example.com', limit: 1.5 }),
    ).toMatch(/limit/);
  });

  it('audit-log：完整參數 → ok', () => {
    expect(
      validateSupportAccessBody('audit-log', {
        actorEmail: 'me@example.com',
        limit: 20,
        before: '2026-06-01T00:00:00.000Z',
        filterAction: 'rotate-password',
      }),
    ).toBe(true);
  });

  it('audit-log：before / filterAction 型別錯 → 拒絕', () => {
    expect(
      validateSupportAccessBody('audit-log', { actorEmail: 'me@example.com', before: 123 }),
    ).toMatch(/before/);
    expect(
      validateSupportAccessBody('audit-log', { actorEmail: 'me@example.com', filterAction: 1 }),
    ).toMatch(/filterAction/);
  });
});

describe('verifyFactorySupportRequest', () => {
  it('完整 provision → ok', () => {
    const req = buildRequest('provision', {
      email: 'support@example.com',
      actorEmail: 'me@example.com',
    });
    const r = verifyFactorySupportRequest(req);
    expect(r.ok).toBe(true);
  });

  it('rotate-password 缺 reason → body-invalid', () => {
    const req = buildRequest('rotate-password', { actorEmail: 'me@example.com' });
    const r = verifyFactorySupportRequest(req);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('body-invalid');
  });

  it('secret 未設 → config-missing', () => {
    const req = buildRequest('provision', {
      email: 'support@example.com',
      actorEmail: 'me@example.com',
    });
    const r = verifyFactorySupportRequest({ ...req, secret: undefined });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('config-missing');
  });
});
