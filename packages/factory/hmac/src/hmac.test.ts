import { describe, expect, it } from 'vitest';

import { signRequest, verifyRequest } from './index.js';

describe('HMAC', () => {
  const secret = 'sekret';
  const base = {
    method: 'POST',
    path: '/api/factory/bootstrap-admin',
    body: JSON.stringify({ projectId: 'p1', adminEmail: 'a@b.tw' }),
    timestamp: 1715731200,
  };

  it('簽出可驗證', () => {
    const sig = signRequest(secret, base);
    expect(verifyRequest(secret, { ...base, signature: sig }, { now: base.timestamp })).toEqual({
      ok: true,
    });
  });

  it('竄改 body → mismatch', () => {
    const sig = signRequest(secret, base);
    const r = verifyRequest(
      secret,
      { ...base, body: '{"projectId":"X","adminEmail":"a@b.tw"}', signature: sig },
      { now: base.timestamp },
    );
    expect(r).toEqual({ ok: false, reason: 'mismatch' });
  });

  it('竄改 path → mismatch', () => {
    const sig = signRequest(secret, base);
    const r = verifyRequest(
      secret,
      { ...base, path: '/api/factory/other', signature: sig },
      { now: base.timestamp },
    );
    expect(r).toEqual({ ok: false, reason: 'mismatch' });
  });

  it('時間漂移 → expired', () => {
    const sig = signRequest(secret, base);
    const r = verifyRequest(
      secret,
      { ...base, signature: sig },
      { now: base.timestamp + 600, skewSeconds: 60 },
    );
    expect(r).toEqual({ ok: false, reason: 'expired' });
  });

  it('signature 為空 → malformed', () => {
    expect(
      verifyRequest(secret, { ...base, signature: '' }, { now: base.timestamp }),
    ).toEqual({ ok: false, reason: 'malformed' });
  });

  it('不同 secret 偽造 → mismatch', () => {
    const sig = signRequest('attacker-guess', base);
    const r = verifyRequest(secret, { ...base, signature: sig }, { now: base.timestamp });
    expect(r.ok).toBe(false);
  });
});
