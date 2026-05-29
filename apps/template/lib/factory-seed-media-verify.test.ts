import { signRequest } from '@saas-factory/factory-hmac';
import { describe, expect, it } from 'vitest';

import { verifySeedMediaRequest } from './factory-seed-media-verify.js';

const SECRET = 'a'.repeat(64);
const PATH = '/api/factory/seed-media';
const NOW = 1700000000;

function makeBody(): string {
  return JSON.stringify({
    tenantId: 'demo-test',
    alt: '主視覺',
    b64: 'QUJD',
    mimeType: 'image/png',
    filename: 'gen-demo-test-hero.png',
  });
}

function sign(body: string, timestamp = NOW): string {
  return signRequest(SECRET, { method: 'POST', path: PATH, body, timestamp });
}

describe('verifySeedMediaRequest', () => {
  it('正確簽章 + 合法 body → ok', () => {
    const body = makeBody();
    const r = verifySeedMediaRequest({
      secret: SECRET,
      method: 'POST',
      path: PATH,
      rawBody: body,
      headers: { timestamp: String(NOW), signature: sign(body) },
      now: NOW,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.body.filename).toBe('gen-demo-test-hero.png');
      expect(r.body.mimeType).toBe('image/png');
    }
  });

  it('secret 未設定 → config-missing（fail-closed）', () => {
    const r = verifySeedMediaRequest({
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

  it('body 缺欄位 → body-invalid', () => {
    const body = JSON.stringify({ tenantId: 'demo-test', alt: 'x' });
    const r = verifySeedMediaRequest({
      secret: SECRET,
      method: 'POST',
      path: PATH,
      rawBody: body,
      headers: { timestamp: String(NOW), signature: sign(body) },
      now: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('body-invalid');
  });

  it('簽章不符 → hmac-mismatch', () => {
    const body = makeBody();
    const r = verifySeedMediaRequest({
      secret: SECRET,
      method: 'POST',
      path: PATH,
      rawBody: body,
      headers: { timestamp: String(NOW), signature: 'deadbeef' },
      now: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('hmac-mismatch');
  });
});
