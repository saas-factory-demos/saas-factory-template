import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';

import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
} from '@simplewebauthn/server';

/**
 * WebAuthn / Passkey 服務（ADR-0010 §8 補充）。
 *
 * 流程：
 * 1. 註冊：server `generateRegistrationOptions` → client `navigator.credentials.create`
 *    → server `verifyRegistration` 存 credentialId / publicKey / counter
 * 2. 驗證：server `generateAuthenticationOptions` → client `navigator.credentials.get`
 *    → server `verifyAuthentication` 比對 + 更新 counter（防 replay）
 *
 * rpId：domain（不含 protocol / port）。例：'admin.example.com'
 * origin：完整 URL（含 protocol）。例：'https://admin.example.com'
 *
 * 一個 user 可註冊多把 Passkey（例如 1Password + iCloud Keychain + YubiKey）。
 */

/** 已註冊的 Passkey credential（存進 user-credentials collection）。 */
export interface PasskeyCredential {
  /** Credential ID（base64url 編碼，client 給的識別碼） */
  credentialId: string;
  /** Public key（base64url 編碼） */
  publicKey: string;
  /** Counter（每次驗證遞增，防 replay） */
  counter: number;
  /** Authenticator transports（usb / nfc / ble / internal / hybrid） */
  transports?: AuthenticatorTransportFuture[];
  /** 使用者命名（例：'iCloud Keychain' / 'YubiKey 5C'） */
  nickname?: string;
  /** 註冊時間 */
  createdAt: Date;
  /** 最後使用時間 */
  lastUsedAt?: Date;
}

export interface WebAuthnConfig {
  /** Relying Party 名稱（顯示給使用者，例：'SaaS Factory Admin'） */
  rpName: string;
  /** Relying Party ID（domain，不含 protocol） */
  rpId: string;
  /** 允許的 origin（含 protocol，array 支援多 origin） */
  origin: string | string[];
}

/**
 * 產生 Passkey 註冊 options，回傳給 client 餵 `navigator.credentials.create`。
 *
 * `challenge` 由 SimpleWebAuthn 自動產隨機 32 bytes，client 簽完送回 verify 時比對。
 * 需把 options.challenge 暫存（session / KV / DB）以對 verify 階段，避免 replay。
 */
export async function buildRegistrationOptions(
  cfg: WebAuthnConfig,
  input: {
    userId: string;
    userName: string;
    userDisplayName: string;
    existingCredentialIds?: string[];
  },
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  return generateRegistrationOptions({
    rpName: cfg.rpName,
    rpID: cfg.rpId,
    userID: new TextEncoder().encode(input.userId),
    userName: input.userName,
    userDisplayName: input.userDisplayName,
    attestationType: 'none',
    // 防重複註冊：把現有 credentialId 排除，client 端會自動避開
    excludeCredentials: (input.existingCredentialIds ?? []).map((id) => ({ id })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });
}

/**
 * 驗證 client 送回的註冊回應。
 *
 * 成功 → 取 `registrationInfo.credential.id` / `publicKey` / `counter` 寫進 collection。
 */
export async function verifyRegistration(
  cfg: WebAuthnConfig,
  input: {
    expectedChallenge: string;
    response: RegistrationResponseJSON;
  },
): Promise<VerifiedRegistrationResponse> {
  return verifyRegistrationResponse({
    response: input.response,
    expectedChallenge: input.expectedChallenge,
    expectedOrigin: cfg.origin,
    expectedRPID: cfg.rpId,
    requireUserVerification: false,
  });
}

/**
 * 產生 Passkey 登入 options。
 *
 * `allowCredentials` 列出此 user 已註冊的 credentialId，client 會用對應 Passkey 簽 challenge。
 */
export async function buildAuthenticationOptions(
  cfg: WebAuthnConfig,
  input: {
    allowCredentials: Array<{ id: string; transports?: AuthenticatorTransportFuture[] }>;
  },
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  return generateAuthenticationOptions({
    rpID: cfg.rpId,
    allowCredentials: input.allowCredentials,
    userVerification: 'preferred',
  });
}

/**
 * 驗證 client 送回的登入回應。
 *
 * 成功 → 取 `authenticationInfo.newCounter` 更新進 collection（防 replay 必要）。
 */
export async function verifyAuthentication(
  cfg: WebAuthnConfig,
  input: {
    expectedChallenge: string;
    response: AuthenticationResponseJSON;
    credential: {
      id: string;
      publicKey: Uint8Array<ArrayBuffer>;
      counter: number;
      transports?: AuthenticatorTransportFuture[];
    };
  },
): Promise<VerifiedAuthenticationResponse> {
  return verifyAuthenticationResponse({
    response: input.response,
    expectedChallenge: input.expectedChallenge,
    expectedOrigin: cfg.origin,
    expectedRPID: cfg.rpId,
    credential: input.credential,
    requireUserVerification: false,
  });
}
