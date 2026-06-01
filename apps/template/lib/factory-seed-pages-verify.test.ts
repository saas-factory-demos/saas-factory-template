import { signRequest } from '@saas-factory/factory-hmac';
import { describe, expect, it } from 'vitest';

import { verifySeedPagesRequest } from './factory-seed-pages-verify.js';

const SECRET = 'a'.repeat(64);
const PATH = '/api/factory/seed-pages';
const NOW = 1700000000;

function makeBody(): string {
  return JSON.stringify({
    tenantId: 'tenant-1',
    pages: [
      { pageKey: 'homepage', blocks: [] },
    ],
  });
}

function sign(body: string, timestamp = NOW): string {
  return signRequest(SECRET, { method: 'POST', path: PATH, body, timestamp });
}

describe('verifySeedPagesRequest', () => {
  it('正確簽章 + 合法 body → ok', () => {
    const body = makeBody();
    const sig = sign(body);
    const r = verifySeedPagesRequest({
      secret: SECRET,
      method: 'POST',
      path: PATH,
      rawBody: body,
      headers: { timestamp: String(NOW), signature: sig },
      now: NOW,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.body.tenantId).toBe('tenant-1');
      expect(r.body.pages).toHaveLength(1);
    }
  });

  it('secret 未設定 → config-missing（fail-closed）', () => {
    const r = verifySeedPagesRequest({
      secret: undefined,
      method: 'POST',
      path: PATH,
      rawBody: '{}',
      headers: { timestamp: String(NOW), signature: 'x' },
      now: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('config-missing');
  });

  it('缺 timestamp / signature → headers-missing', () => {
    const r = verifySeedPagesRequest({
      secret: SECRET,
      method: 'POST',
      path: PATH,
      rawBody: '{}',
      headers: { timestamp: null, signature: 'x' },
      now: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('headers-missing');
  });

  it('timestamp 非數字 → hmac-malformed', () => {
    const r = verifySeedPagesRequest({
      secret: SECRET,
      method: 'POST',
      path: PATH,
      rawBody: '{}',
      headers: { timestamp: 'not-a-number', signature: 'x' },
      now: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('hmac-malformed');
  });

  it('簽章不符 → hmac-mismatch', () => {
    const body = makeBody();
    const r = verifySeedPagesRequest({
      secret: SECRET,
      method: 'POST',
      path: PATH,
      rawBody: body,
      headers: { timestamp: String(NOW), signature: sign(body + 'tampered') },
      now: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('hmac-mismatch');
  });

  it('時間漂移 > 5 分鐘 → hmac-expired', () => {
    const body = makeBody();
    const sig = sign(body, NOW - 1000);
    const r = verifySeedPagesRequest({
      secret: SECRET,
      method: 'POST',
      path: PATH,
      rawBody: body,
      headers: { timestamp: String(NOW - 1000), signature: sig },
      now: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('hmac-expired');
  });

  it('body 非合法 JSON → body-invalid', () => {
    const bad = '{not-json';
    const sig = sign(bad);
    const r = verifySeedPagesRequest({
      secret: SECRET,
      method: 'POST',
      path: PATH,
      rawBody: bad,
      headers: { timestamp: String(NOW), signature: sig },
      now: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('body-invalid');
  });

  it('body 缺 tenantId → body-invalid', () => {
    const body = JSON.stringify({ pages: [] });
    const sig = sign(body);
    const r = verifySeedPagesRequest({
      secret: SECRET,
      method: 'POST',
      path: PATH,
      rawBody: body,
      headers: { timestamp: String(NOW), signature: sig },
      now: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('body-invalid');
  });

  it('body 內 pages 非 array → body-invalid', () => {
    const body = JSON.stringify({ tenantId: 't1', pages: 'oops' });
    const sig = sign(body);
    const r = verifySeedPagesRequest({
      secret: SECRET,
      method: 'POST',
      path: PATH,
      rawBody: body,
      headers: { timestamp: String(NOW), signature: sig },
      now: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('body-invalid');
  });

  it('body 內某頁缺 pageKey → body-invalid', () => {
    const body = JSON.stringify({
      tenantId: 't1',
      pages: [{ blocks: [] }],
    });
    const sig = sign(body);
    const r = verifySeedPagesRequest({
      secret: SECRET,
      method: 'POST',
      path: PATH,
      rawBody: body,
      headers: { timestamp: String(NOW), signature: sig },
      now: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('body-invalid');
  });
});
