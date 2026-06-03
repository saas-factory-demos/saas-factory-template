import { describe, expect, it } from 'vitest';

import {
  buildAuthenticationOptions,
  buildRegistrationOptions,
  type WebAuthnConfig,
} from './webauthn.js';

const CFG: WebAuthnConfig = {
  rpName: 'SaaS Factory Test',
  rpId: 'example.com',
  origin: 'https://example.com',
};

describe('buildRegistrationOptions', () => {
  it('產出含 challenge + rp 資訊', async () => {
    const opts = await buildRegistrationOptions(CFG, {
      userId: 'user-123',
      userName: 'alice@example.com',
      userDisplayName: 'Alice',
    });
    expect(opts.challenge.length).toBeGreaterThan(0);
    expect(opts.rp.name).toBe(CFG.rpName);
    expect(opts.rp.id).toBe(CFG.rpId);
    expect(opts.user.name).toBe('alice@example.com');
    expect(opts.user.displayName).toBe('Alice');
  });

  it('excludeCredentials 帶現有 credentialId（避免重複註冊同把 key）', async () => {
    const opts = await buildRegistrationOptions(CFG, {
      userId: 'user-123',
      userName: 'alice@example.com',
      userDisplayName: 'Alice',
      existingCredentialIds: ['cred-a', 'cred-b'],
    });
    expect(opts.excludeCredentials).toHaveLength(2);
    expect(opts.excludeCredentials?.[0]?.id).toBe('cred-a');
  });

  it('預設 residentKey=preferred、userVerification=preferred', async () => {
    const opts = await buildRegistrationOptions(CFG, {
      userId: 'u',
      userName: 'a@b.com',
      userDisplayName: 'A',
    });
    expect(opts.authenticatorSelection?.residentKey).toBe('preferred');
    expect(opts.authenticatorSelection?.userVerification).toBe('preferred');
  });
});

describe('buildAuthenticationOptions', () => {
  it('產出含 challenge + allowCredentials', async () => {
    const opts = await buildAuthenticationOptions(CFG, {
      allowCredentials: [{ id: 'cred-a' }, { id: 'cred-b', transports: ['internal'] }],
    });
    expect(opts.challenge.length).toBeGreaterThan(0);
    expect(opts.allowCredentials).toHaveLength(2);
    expect(opts.rpId).toBe(CFG.rpId);
  });

  it('空 allowCredentials（首次登入 / discoverable credential）', async () => {
    const opts = await buildAuthenticationOptions(CFG, { allowCredentials: [] });
    expect(opts.allowCredentials).toEqual([]);
  });
});
