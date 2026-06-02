import { signRequest } from '@saas-factory/factory-hmac';
import { describe, expect, it } from 'vitest';

import { SUPPORT_ACCESS_BASE_PATH } from './client.js';
import { verifySupportAccessRequest } from './verify.js';

const SECRET = '0123456789abcdef0123456789abcdef'; // 32 chars
const ACTION = 'provision';
const PATH = `${SUPPORT_ACCESS_BASE_PATH}/${ACTION}`;
const METHOD = 'POST';
const BODY = JSON.stringify({ email: 'support@example.com', actorEmail: 'me@example.com' });

function signed(body: string, timestamp: number, path = PATH) {
  return signRequest(SECRET, { method: METHOD, path, body, timestamp });
}

describe('verifySupportAccessRequest', () => {
  it('secret 未設定 → config-missing', () => {
    const r = verifySupportAccessRequest({
      secret: undefined,
      method: METHOD,
      path: PATH,
      action: ACTION,
      rawBody: BODY,
      headers: { timestamp: '0', signature: 'x' },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('config-missing');
  });

  it('secret 太短 → config-missing', () => {
    const r = verifySupportAccessRequest({
      secret: 'too-short',
      method: METHOD,
      path: PATH,
      action: ACTION,
      rawBody: BODY,
      headers: { timestamp: '0', signature: 'x' },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('config-missing');
  });

  it('action 不合法 → not-found', () => {
    const r = verifySupportAccessRequest({
      secret: SECRET,
      method: METHOD,
      path: '/api/factory/support-access/launch-nukes',
      action: 'launch-nukes',
      rawBody: BODY,
      headers: { timestamp: '0', signature: 'x' },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('not-found');
  });

  it('headers 缺失 → headers-missing', () => {
    const r = verifySupportAccessRequest({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      action: ACTION,
      rawBody: BODY,
      headers: { timestamp: null, signature: null },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('headers-missing');
  });

  it('timestamp 非數字 → hmac-malformed', () => {
    const r = verifySupportAccessRequest({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      action: ACTION,
      rawBody: BODY,
      headers: { timestamp: 'abc', signature: 'x' },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('hmac-malformed');
  });

  it('path 與 action 不符 → hmac-malformed', () => {
    const t = 1_700_000_000;
    const sig = signed(BODY, t);
    const r = verifySupportAccessRequest({
      secret: SECRET,
      method: METHOD,
      path: '/api/factory/support-access/wrong',
      action: ACTION,
      rawBody: BODY,
      headers: { timestamp: String(t), signature: sig },
      now: t,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('hmac-malformed');
  });

  it('timestamp 過時 → hmac-expired', () => {
    const t = 1_700_000_000;
    const sig = signed(BODY, t);
    const r = verifySupportAccessRequest({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      action: ACTION,
      rawBody: BODY,
      headers: { timestamp: String(t), signature: sig },
      now: t + 600, // 10 分鐘後
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('hmac-expired');
  });

  it('簽章不對 → hmac-mismatch', () => {
    const t = 1_700_000_000;
    const wrong = signRequest('WRONG_SECRET_padded_to_32_chars!', {
      method: METHOD,
      path: PATH,
      body: BODY,
      timestamp: t,
    });
    const r = verifySupportAccessRequest({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      action: ACTION,
      rawBody: BODY,
      headers: { timestamp: String(t), signature: wrong },
      now: t,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('hmac-mismatch');
  });

  it('body 非合法 JSON → body-invalid', () => {
    const t = 1_700_000_000;
    const raw = 'not-json';
    const sig = signRequest(SECRET, { method: METHOD, path: PATH, body: raw, timestamp: t });
    const r = verifySupportAccessRequest({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      action: ACTION,
      rawBody: raw,
      headers: { timestamp: String(t), signature: sig },
      now: t,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('body-invalid');
  });

  it('validator 拒絕 → body-invalid', () => {
    const t = 1_700_000_000;
    const sig = signed(BODY, t);
    const r = verifySupportAccessRequest({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      action: ACTION,
      rawBody: BODY,
      headers: { timestamp: String(t), signature: sig },
      now: t,
      validateBody: () => '缺少必要欄位',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toBe('body-invalid');
      expect(r.message).toBe('缺少必要欄位');
    }
  });

  it('audit-log action：path 帶 audit-log 也通過驗證', () => {
    const auditPath = `${SUPPORT_ACCESS_BASE_PATH}/audit-log`;
    const auditBody = JSON.stringify({ actorEmail: 'me@example.com' });
    const t = 1_700_000_000;
    const sig = signed(auditBody, t, auditPath);
    const r = verifySupportAccessRequest({
      secret: SECRET,
      method: METHOD,
      path: auditPath,
      action: 'audit-log',
      rawBody: auditBody,
      headers: { timestamp: String(t), signature: sig },
      now: t,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.action).toBe('audit-log');
  });

  it('完整成功 → ok + 解析 body', () => {
    const t = 1_700_000_000;
    const sig = signed(BODY, t);
    const r = verifySupportAccessRequest<{ email: string; actorEmail: string }>({
      secret: SECRET,
      method: METHOD,
      path: PATH,
      action: ACTION,
      rawBody: BODY,
      headers: { timestamp: String(t), signature: sig },
      now: t,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.action).toBe('provision');
      expect(r.body.email).toBe('support@example.com');
    }
  });
});
