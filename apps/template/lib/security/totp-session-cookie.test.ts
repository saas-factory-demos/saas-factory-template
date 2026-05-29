import { describe, expect, it } from 'vitest';

import {
  TOTP_SESSION_MAX_AGE_SECONDS,
  issueTotpSessionToken,
  verifyTotpSessionToken,
} from './totp-session-cookie';

const SECRET = 'test-secret-1234';

describe('TOTP session cookie', () => {
  it('issue + verify round-trip 成功', () => {
    const token = issueTotpSessionToken(SECRET, 'user-1');
    const payload = verifyTotpSessionToken(SECRET, token, { userId: 'user-1' });
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe('user-1');
  });

  it('issue 缺 secret 直接 throw（fail-closed）', () => {
    expect(() => issueTotpSessionToken('', 'user-1')).toThrow();
  });

  it('verify 缺 secret 回 null', () => {
    const token = issueTotpSessionToken(SECRET, 'user-1');
    expect(verifyTotpSessionToken('', token, { userId: 'user-1' })).toBeNull();
  });

  it('verify 缺 cookie 回 null', () => {
    expect(verifyTotpSessionToken(SECRET, undefined, { userId: 'user-1' })).toBeNull();
  });

  it('簽章被竄改 → 拒絕', () => {
    const token = issueTotpSessionToken(SECRET, 'user-1');
    const [body] = token.split('.');
    const tampered = `${body}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`;
    expect(verifyTotpSessionToken(SECRET, tampered, { userId: 'user-1' })).toBeNull();
  });

  it('body 被竄改（更換 userId）→ 拒絕', () => {
    const token = issueTotpSessionToken(SECRET, 'user-1');
    const [, sig] = token.split('.');
    const fakeBody = Buffer.from(
      JSON.stringify({ userId: 'attacker', iat: Date.now() }),
      'utf8',
    ).toString('base64url');
    expect(verifyTotpSessionToken(SECRET, `${fakeBody}.${sig}`, { userId: 'attacker' })).toBeNull();
  });

  it('userId 與 expected 不符 → 拒絕（防瀏覽器切帳號用舊 cookie）', () => {
    const token = issueTotpSessionToken(SECRET, 'user-1');
    expect(verifyTotpSessionToken(SECRET, token, { userId: 'user-2' })).toBeNull();
  });

  it('過期 → 拒絕', () => {
    const token = issueTotpSessionToken(SECRET, 'user-1');
    const future = Date.now() + (TOTP_SESSION_MAX_AGE_SECONDS + 1) * 1000;
    expect(verifyTotpSessionToken(SECRET, token, { userId: 'user-1', now: future })).toBeNull();
  });

  it('剛好沒過期 → 通過', () => {
    const token = issueTotpSessionToken(SECRET, 'user-1');
    const justInside = Date.now() + (TOTP_SESSION_MAX_AGE_SECONDS - 1) * 1000;
    expect(
      verifyTotpSessionToken(SECRET, token, { userId: 'user-1', now: justInside }),
    ).not.toBeNull();
  });

  it('格式錯誤（無 dot）→ 拒絕', () => {
    expect(verifyTotpSessionToken(SECRET, 'not-a-token', { userId: 'user-1' })).toBeNull();
  });

  it('格式錯誤（三段）→ 拒絕', () => {
    expect(verifyTotpSessionToken(SECRET, 'a.b.c', { userId: 'user-1' })).toBeNull();
  });

  it('body 非 JSON → 拒絕', () => {
    const fakeBody = Buffer.from('not-json', 'utf8').toString('base64url');
    const sig = 'AAAA';
    expect(verifyTotpSessionToken(SECRET, `${fakeBody}.${sig}`, { userId: 'user-1' })).toBeNull();
  });
});
