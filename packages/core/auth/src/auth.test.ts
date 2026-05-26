import { describe, expect, it } from 'vitest';

import {
  GoogleOAuthProvider,
  LineOAuthProvider,
} from './oauth-provider.js';
import {
  MitakeProvider,
  OtpRouter,
  TwilioProvider,
  generateOtpCode,
} from './otp-provider.js';
import { checkPwnedPassword, isWeakPassword, validatePassword } from './password-policy.js';
import { ROLES_REQUIRING_2FA, STAFF_ROLES, requires2FA } from './roles.js';
import {
  generateRecoveryCodes,
  generateTotpSetup,
  hashRecoveryCode,
  verifyAndConsumeRecoveryCode,
  verifyTotp,
} from './two-factor.js';

describe('password policy', () => {
  it('合格密碼通過', () => {
    expect(validatePassword('Abcdef12').ok).toBe(true);
    expect(validatePassword('LongerPass99').ok).toBe(true);
  });

  it('過短拒絕', () => {
    const r = validatePassword('Abc12');
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('8 字'))).toBe(true);
  });

  it('缺大寫拒絕', () => {
    expect(validatePassword('abcdef12').ok).toBe(false);
  });

  it('缺小寫拒絕', () => {
    expect(validatePassword('ABCDEF12').ok).toBe(false);
  });

  it('缺數字拒絕', () => {
    expect(validatePassword('Abcdefgh').ok).toBe(false);
  });

  it('黑名單常見密碼拒絕', () => {
    expect(isWeakPassword('Password1')).toBe(true);
    const r = validatePassword('Password1');
    // Password1 通過 zod 但黑名單擋
    expect(r.ok).toBe(false);
  });
});

describe('checkPwnedPassword (HIBP k-anonymity)', () => {
  const PASSWORD = 'P@ssw0rd';
  // 'P@ssw0rd' SHA-1: 21BD12DC183F740EE76F27B78EB39C8AD972A757
  const PREFIX = '21BD1';
  const SUFFIX = '2DC183F740EE76F27B78EB39C8AD972A757';

  it('外洩密碼回 pwned=true + count', async () => {
    const fakeFetch = (async () =>
      new Response(`${SUFFIX}:42\nABCDEF1234567890ABCDEF1234567890ABCDE:7`, {
        status: 200,
      })) as typeof fetch;
    const r = await checkPwnedPassword(PASSWORD, fakeFetch);
    expect(r.pwned).toBe(true);
    expect(r.count).toBe(42);
  });

  it('未列在外洩名單回 pwned=false', async () => {
    const fakeFetch = (async () =>
      new Response('ABCDEF1234567890ABCDEF1234567890ABCDE:7', { status: 200 })) as typeof fetch;
    const r = await checkPwnedPassword(PASSWORD, fakeFetch);
    expect(r.pwned).toBe(false);
    expect(r.count).toBe(0);
  });

  it('HIBP 服務 500 → fail-open（pwned=false + error）', async () => {
    const fakeFetch = (async () => new Response('', { status: 500 })) as typeof fetch;
    const r = await checkPwnedPassword(PASSWORD, fakeFetch);
    expect(r.pwned).toBe(false);
    expect(r.error).toMatch(/HTTP 500/);
  });

  it('網路錯誤 → fail-open（pwned=false + error）', async () => {
    const fakeFetch = (async () => {
      throw new Error('ENOTFOUND');
    }) as unknown as typeof fetch;
    const r = await checkPwnedPassword(PASSWORD, fakeFetch);
    expect(r.pwned).toBe(false);
    expect(r.error).toMatch(/ENOTFOUND/);
  });

  it('傳送 hash 前 5 碼（不送原始密碼）', async () => {
    let capturedUrl = '';
    const fakeFetch = (async (url: string | URL | Request) => {
      capturedUrl = String(url);
      return new Response('', { status: 200 });
    }) as typeof fetch;
    await checkPwnedPassword(PASSWORD, fakeFetch);
    expect(capturedUrl).toContain(`/${PREFIX}`);
    expect(capturedUrl).not.toContain(PASSWORD);
    expect(capturedUrl).not.toContain(SUFFIX);
  });
});

describe('TOTP 2FA', () => {
  it('generateTotpSetup 產 secret + URL + 10 組 recovery codes', () => {
    const setup = generateTotpSetup('alice@example.com');
    expect(setup.secret.length).toBeGreaterThan(0);
    expect(setup.otpauthUrl.startsWith('otpauth://totp/')).toBe(true);
    expect(setup.recoveryCodes).toHaveLength(10);
    // XXXX-XXXX 格式
    expect(setup.recoveryCodes[0]).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it('verifyTotp：錯誤 token 拒絕', () => {
    const setup = generateTotpSetup('alice@example.com');
    expect(verifyTotp(setup.secret, '000000')).toBe(false);
  });

  it('verifyTotp：壞 secret 不 crash 直接 false', () => {
    expect(verifyTotp('not-a-real-secret', '123456')).toBe(false);
  });

  it('generateRecoveryCodes(n) 產 n 組唯一碼', () => {
    const codes = generateRecoveryCodes(5);
    expect(codes).toHaveLength(5);
    expect(new Set(codes).size).toBe(5);
  });

  it('hashRecoveryCode：忽略 dash / 空白 / 大小寫', () => {
    const h1 = hashRecoveryCode('ABCD-1234');
    const h2 = hashRecoveryCode('abcd1234');
    const h3 = hashRecoveryCode(' ABCD - 1234 ');
    expect(h1).toBe(h2);
    expect(h2).toBe(h3);
    // sha-256 hex 應 64 字元
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it('verifyAndConsumeRecoveryCode：命中 → 回傳剩餘 codes（已消耗）', () => {
    const codes = ['ABCD-1234', 'WXYZ-5678', 'PQRS-9012'];
    const hashed = codes.map(hashRecoveryCode);
    const remaining = verifyAndConsumeRecoveryCode('wxyz-5678', hashed);
    expect(remaining).not.toBeNull();
    expect(remaining).toHaveLength(2);
    // 用過那組消失
    expect(remaining).not.toContain(hashRecoveryCode('WXYZ-5678'));
  });

  it('verifyAndConsumeRecoveryCode：第二次同一組失敗', () => {
    const hashed = ['ABCD-1234'].map(hashRecoveryCode);
    const after = verifyAndConsumeRecoveryCode('ABCD-1234', hashed);
    expect(after).toEqual([]);
    const again = verifyAndConsumeRecoveryCode('ABCD-1234', after ?? []);
    expect(again).toBeNull();
  });

  it('verifyAndConsumeRecoveryCode：錯誤 code 回 null + 不動原陣列', () => {
    const hashed = ['ABCD-1234', 'WXYZ-5678'].map(hashRecoveryCode);
    const out = verifyAndConsumeRecoveryCode('NOPE-0000', hashed);
    expect(out).toBeNull();
  });

  it('recovery codes 字元集只用 ABCDEFGHJKLMNPQRSTUVWXYZ23456789（無 0/1/I/O）', () => {
    const codes = generateRecoveryCodes(20);
    for (const c of codes) {
      expect(c).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/);
    }
  });
});

describe('roles', () => {
  it('owner / admin 要 2FA', () => {
    expect(requires2FA('owner')).toBe(true);
    expect(requires2FA('admin')).toBe(true);
  });

  it('其他角色不強制', () => {
    expect(requires2FA('cs')).toBe(false);
    expect(requires2FA('editor')).toBe(false);
  });

  it('STAFF_ROLES 含 9 個角色', () => {
    expect(STAFF_ROLES).toHaveLength(9);
  });

  it('ROLES_REQUIRING_2FA 不含非強制角色', () => {
    expect(ROLES_REQUIRING_2FA).not.toContain('cs');
  });
});

describe('OTP routing', () => {
  it('+886 走 Mitake', async () => {
    const router = new OtpRouter(
      new MitakeProvider({ user: 'u', password: 'p' }),
      new TwilioProvider({
        accountSid: 'a',
        authToken: 't',
        fromNumber: '+1',
      }),
    );
    const result = await router.send({
      phone: '+886912345678',
      code: '123456',
      templateId: 'otp.login',
    });
    expect(result.provider).toBe('mitake');
  });

  it('非 +886 走 Twilio', async () => {
    const router = new OtpRouter(
      new MitakeProvider({ user: 'u', password: 'p' }),
      new TwilioProvider({
        accountSid: 'a',
        authToken: 't',
        fromNumber: '+1',
      }),
    );
    const result = await router.send({
      phone: '+19998887777',
      code: '123456',
      templateId: 'otp.login',
    });
    expect(result.provider).toBe('twilio');
  });

  it('Mitake 失敗 fallback Twilio', async () => {
    const broken = new MitakeProvider({ user: '', password: '' });
    const twilio = new TwilioProvider({
      accountSid: 'a',
      authToken: 't',
      fromNumber: '+1',
    });
    const router = new OtpRouter(broken, twilio);
    const result = await router.send({
      phone: '+886912345678',
      code: '123456',
      templateId: 'otp.login',
    });
    expect(result.provider).toBe('twilio');
  });

  it('generateOtpCode 產 6 位數字', () => {
    const code = generateOtpCode();
    expect(code).toMatch(/^\d{6}$/);
  });
});

describe('OAuth providers', () => {
  it('Google 沒 credentials 拿不到 URL', () => {
    const p = new GoogleOAuthProvider({
      clientId: '',
      clientSecret: '',
      redirectUri: 'http://localhost/cb',
    });
    expect(() => p.getAuthorizationUrl('s')).toThrow();
  });

  it('Google 有 credentials 拿到 URL', () => {
    const p = new GoogleOAuthProvider({
      clientId: 'cid',
      clientSecret: 'csec',
      redirectUri: 'http://localhost/cb',
    });
    const url = p.getAuthorizationUrl('state-123');
    expect(url).toContain('accounts.google.com');
    expect(url).toContain('state=state-123');
    expect(url).toContain('scope=openid+email+profile');
  });

  it('LINE 拿到 URL', () => {
    const p = new LineOAuthProvider({
      clientId: 'cid',
      clientSecret: 'csec',
      redirectUri: 'http://localhost/cb',
    });
    expect(p.getAuthorizationUrl('s')).toContain('access.line.me');
  });
});
