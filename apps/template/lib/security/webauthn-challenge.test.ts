import { describe, expect, it } from 'vitest';

import { issueChallenge, verifyChallenge } from './webauthn-challenge.js';

const SECRET = 'test-secret-do-not-use-in-prod';

describe('webauthn-challenge', () => {
  it('issue + verify 同 user 同 purpose 通過', () => {
    const { challenge, cookieValue } = issueChallenge(SECRET, {
      userId: 'u-1',
      purpose: 'register',
    });
    const r = verifyChallenge(SECRET, cookieValue, { userId: 'u-1', purpose: 'register' });
    expect(r).not.toBeNull();
    expect(r?.challenge).toBe(challenge);
  });

  it('purpose 不符（register 簽 → authenticate 驗）→ reject', () => {
    const { cookieValue } = issueChallenge(SECRET, { userId: 'u-1', purpose: 'register' });
    const r = verifyChallenge(SECRET, cookieValue, { userId: 'u-1', purpose: 'authenticate' });
    expect(r).toBeNull();
  });

  it('userId 不符 → reject', () => {
    const { cookieValue } = issueChallenge(SECRET, { userId: 'u-1', purpose: 'register' });
    const r = verifyChallenge(SECRET, cookieValue, { userId: 'u-2', purpose: 'register' });
    expect(r).toBeNull();
  });

  it('簽章被竄改 → reject', () => {
    const { cookieValue } = issueChallenge(SECRET, { userId: 'u-1', purpose: 'register' });
    const [body] = cookieValue.split('.');
    const tampered = `${body}.AAAA`;
    const r = verifyChallenge(SECRET, tampered, { userId: 'u-1', purpose: 'register' });
    expect(r).toBeNull();
  });

  it('body 被竄改 → reject（簽章對不上）', () => {
    const { cookieValue } = issueChallenge(SECRET, { userId: 'u-1', purpose: 'register' });
    const [, sig] = cookieValue.split('.');
    const fakeBody = Buffer.from('{"x":1}', 'utf8').toString('base64url');
    const r = verifyChallenge(SECRET, `${fakeBody}.${sig}`, {
      userId: 'u-1',
      purpose: 'register',
    });
    expect(r).toBeNull();
  });

  it('超過 60 秒 → reject', () => {
    const { cookieValue } = issueChallenge(SECRET, { userId: 'u-1', purpose: 'register' });
    const future = Date.now() + 61_000;
    const r = verifyChallenge(SECRET, cookieValue, {
      userId: 'u-1',
      purpose: 'register',
      now: future,
    });
    expect(r).toBeNull();
  });

  it('用錯 secret → reject', () => {
    const { cookieValue } = issueChallenge(SECRET, { userId: 'u-1', purpose: 'register' });
    const r = verifyChallenge('other-secret', cookieValue, {
      userId: 'u-1',
      purpose: 'register',
    });
    expect(r).toBeNull();
  });

  it('空 cookie → null', () => {
    expect(verifyChallenge(SECRET, undefined, { userId: 'u', purpose: 'register' })).toBeNull();
    expect(verifyChallenge(SECRET, '', { userId: 'u', purpose: 'register' })).toBeNull();
  });

  it('未設 secret → issue throw', () => {
    expect(() => issueChallenge('', { userId: 'u', purpose: 'register' })).toThrow();
  });

  it('格式錯（無 dot） → reject', () => {
    const r = verifyChallenge(SECRET, 'nodothere', { userId: 'u', purpose: 'register' });
    expect(r).toBeNull();
  });
});
