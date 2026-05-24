import { signRequest } from '@saas-factory/factory-hmac';
import { describe, expect, it } from 'vitest';

import { verifyBootstrapRequest } from './factory-bootstrap-verify.js';

const SECRET = '0123456789abcdef0123456789abcdef'; // 32 chars
const PATH = '/api/factory/bootstrap-admin';
const METHOD = 'POST';
const BODY = JSON.stringify({
  adminEmail: 'owner@example.com',
  adminPassword: 'StrongPass!23',
  client: { clientName: 'Acme', brandName: 'Acme Brand' },
});

function signed(body: string, timestamp: number) {
  return signRequest(SECRET, { method: METHOD, path: PATH, body, timestamp });
}

describe('verifyBootstrapRequest', () => {
  it('secret 未設定 → config-missing', () => {
    const r = verifyBootstrapRequest({
      secret: undefined,
      method: METHOD,
      path: PATH,
      rawBody: BODY,
      headers: { timestamp: '0', signature: 'x' },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('config-missing');
  });

  it('headers 缺失 → headers-missing', () => {
    const r = verifyBootstrapRequest({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      rawBody: BODY,
      headers: { timestamp: null, signature: null },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('headers-missing');
  });

  it('timestamp 非數字 → hmac-malformed', () => {
    const r = verifyBootstrapRequest({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      rawBody: BODY,
      headers: { timestamp: 'not-a-number', signature: 'x' },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('hmac-malformed');
  });

  it('timestamp 過時 → hmac-expired', () => {
    const t = 1_000_000;
    const sig = signed(BODY, t);
    const r = verifyBootstrapRequest({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      rawBody: BODY,
      headers: { timestamp: String(t), signature: sig },
      now: t + 10_000, // 10000 秒後
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('hmac-expired');
  });

  it('簽章不對 → hmac-mismatch', () => {
    const t = 1_000_000;
    const wrong = signRequest('WRONG_SECRET_padded_to_32_chars_!!!', {
      method: METHOD,
      path: PATH,
      body: BODY,
      timestamp: t,
    });
    const r = verifyBootstrapRequest({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      rawBody: BODY,
      headers: { timestamp: String(t), signature: wrong },
      now: t,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('hmac-mismatch');
  });

  it('body 非 JSON → body-invalid', () => {
    const t = 1_000_000;
    const raw = 'NOT_JSON';
    const sig = signed(raw, t);
    const r = verifyBootstrapRequest({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      rawBody: raw,
      headers: { timestamp: String(t), signature: sig },
      now: t,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('body-invalid');
  });

  it('body 缺欄位 → body-invalid', () => {
    const t = 1_000_000;
    const raw = JSON.stringify({ adminEmail: 'x@y.com' });
    const sig = signed(raw, t);
    const r = verifyBootstrapRequest({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      rawBody: raw,
      headers: { timestamp: String(t), signature: sig },
      now: t,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('body-invalid');
  });

  it('密碼太短 → body-invalid', () => {
    const t = 1_000_000;
    const raw = JSON.stringify({
      adminEmail: 'x@y.com',
      adminPassword: 'short',
      client: { clientName: 'A', brandName: 'B' },
    });
    const sig = signed(raw, t);
    const r = verifyBootstrapRequest({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      rawBody: raw,
      headers: { timestamp: String(t), signature: sig },
      now: t,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('body-invalid');
  });

  it('合法請求 → ok + body parsed', () => {
    const t = 1_000_000;
    const sig = signed(BODY, t);
    const r = verifyBootstrapRequest({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      rawBody: BODY,
      headers: { timestamp: String(t), signature: sig },
      now: t,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.body.adminEmail).toBe('owner@example.com');
      expect(r.body.client.brandName).toBe('Acme Brand');
    }
  });
});
