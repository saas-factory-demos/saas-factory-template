import { signRequest } from '@saas-factory/factory-hmac';
import { describe, expect, it } from 'vitest';

import { verifyRegenerateSlotRequest } from './factory-regenerate-slot-verify.js';

const SECRET = 'a'.repeat(64);
const PATH = '/api/factory/regenerate-slot';
const NOW = 1700000000;

function makeBody(): string {
  return JSON.stringify({
    tenantId: 'demo-restaurant',
    pageSlug: 'home',
    blockId: 'block-3',
    path: ['items', 0, 'image'],
    alt: '新的炙燒鴨胸',
    b64: 'QUJD',
    mimeType: 'image/png',
    filename: 'regen-1700000001.png',
  });
}

function sign(body: string, timestamp = NOW): string {
  return signRequest(SECRET, { method: 'POST', path: PATH, body, timestamp });
}

describe('verifyRegenerateSlotRequest', () => {
  it('正確簽章 + 合法 body → ok（含 path[]）', () => {
    const body = makeBody();
    const r = verifyRegenerateSlotRequest({
      secret: SECRET,
      method: 'POST',
      path: PATH,
      rawBody: body,
      headers: { timestamp: String(NOW), signature: sign(body) },
      now: NOW,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.body.blockId).toBe('block-3');
      expect(r.body.path).toEqual(['items', 0, 'image']);
    }
  });

  it('secret 未設定 → config-missing（fail-closed）', () => {
    const r = verifyRegenerateSlotRequest({
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

  it('body 缺 path → body-invalid', () => {
    const body = JSON.stringify({
      tenantId: 't1',
      pageSlug: 'home',
      blockId: 'b1',
      alt: '',
      b64: 'AA',
      mimeType: 'image/png',
      filename: 'x.png',
    });
    const r = verifyRegenerateSlotRequest({
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

  it('path 含非 string/number 元素 → body-invalid', () => {
    const body = JSON.stringify({
      tenantId: 't1',
      pageSlug: 'home',
      blockId: 'b1',
      path: ['items', true, 'image'],
      alt: '',
      b64: 'AA',
      mimeType: 'image/png',
      filename: 'x.png',
    });
    const r = verifyRegenerateSlotRequest({
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
    const r = verifyRegenerateSlotRequest({
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
