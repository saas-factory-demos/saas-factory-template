import { STAFF_ROLES } from './roles.js';

import type { CollectionConfig, CollectionSlug } from 'payload';

/**
 * 從 req.user 抽 role；consumer 端 payload-types 的 User 可能沒有 role 欄位
 * （例：template 用最小 users collection），所以這裡走 unknown cast 取值。
 */
function userRole(user: unknown): string {
  if (!user || typeof user !== 'object') return '';
  const v = (user as { role?: unknown }).role;
  return typeof v === 'string' ? v : '';
}

/**
 * Passkey / WebAuthn credentials collection。
 *
 * 一個 user 可有多筆（多裝置 / 多 authenticator）。
 *
 * 安全考量：
 * - `publicKey` 是公鑰（可公開），但仍只限 owner/admin 可讀避免列舉攻擊
 * - `credentialId` 唯一索引，註冊時去重
 * - `counter` 每次驗證遞增；若 server-side counter > client-side → 可能 replay attack，拒絕
 */
export const UserCredentialsCollection: CollectionConfig = {
  slug: 'user-credentials',
  admin: {
    useAsTitle: 'nickname',
    defaultColumns: ['user', 'nickname', 'createdAt', 'lastUsedAt'],
    description: 'WebAuthn / Passkey 公鑰憑證。對應 ADR-0010 §8 補充。',
  },
  access: {
    read: ({ req }) => {
      const role = userRole(req.user);
      return role === 'owner' || role === 'admin';
    },
    create: () => true,
    update: () => true,
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'credentialId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'base64url 編碼，由 authenticator 提供' },
    },
    {
      name: 'publicKey',
      type: 'text',
      required: true,
      admin: { hidden: true, description: 'base64url 編碼公鑰' },
    },
    {
      name: 'counter',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { description: '每次驗證遞增，counter 不增 = replay attack' },
    },
    {
      name: 'transports',
      type: 'json',
      admin: { description: 'usb / nfc / ble / internal / hybrid' },
    },
    {
      name: 'nickname',
      type: 'text',
      admin: { description: '使用者命名（例：iCloud Keychain / YubiKey 5C）' },
    },
    {
      name: 'lastUsedAt',
      type: 'date',
      admin: { description: '最後一次成功驗證時間' },
    },
  ],
  timestamps: true,
};

/**
 * Users（員工 / 管理員）collection。
 *
 * - 用 Payload 內建 `auth: true`（含 email / password / 重設密碼 token）
 * - `tenants` 陣列存可存取的 tenant id；owner / admin 可看全部
 * - 2FA 欄位：totpSecret（base32）、totpEnabled、recoveryCodes（hashed）
 */
export const UsersCollection: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'tenants', 'totpEnabled', 'createdAt'],
    description: '後台員工 / 管理員。對應 ADR-0010 §8 強制 owner/admin 開 2FA。',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'cs',
      options: STAFF_ROLES.map((r) => ({ label: r, value: r })),
      index: true,
    },
    {
      name: 'tenants',
      type: 'relationship',
      // 'tenants' collection 由 consumer 端決定是否掛載；用 cast 避免硬綁
      relationTo: 'tenants' as CollectionSlug,
      hasMany: true,
      admin: { description: '可存取的 tenant 清單；owner / admin 不受此限制' },
    },
    {
      name: 'totpSecret',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'totpEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: '是否已啟用 2FA' },
    },
    {
      name: 'recoveryCodes',
      type: 'json',
      admin: { hidden: true },
    },
    {
      name: 'totpEnabledAt',
      type: 'date',
      admin: { description: '2FA 啟用時間（用於 7 天緩衝期判斷）' },
    },
  ],
};

/**
 * Customers（前台會員）collection。
 *
 * - 用 Payload 內建 auth（前台會員獨立 collection）
 * - tenant-scoped（後續會 wrap with tenantScoped）
 * - 多 channel 註冊：email / phone / oauth
 */
export const CustomersCollection: CollectionConfig = {
  slug: 'customers',
  auth: {
    useAPIKey: false,
    cookies: { sameSite: 'Lax' },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'phone', 'lifecycleStage', 'tenantId', 'createdAt'],
  },
  fields: [
    { name: 'phone', type: 'text', index: true },
    { name: 'displayName', type: 'text' },
    {
      name: 'oauthAccounts',
      type: 'array',
      admin: { description: 'OAuth 已連結的第三方帳號' },
      fields: [
        {
          name: 'provider',
          type: 'select',
          options: [
            { label: 'Google', value: 'google' },
            { label: 'LINE', value: 'line' },
            { label: 'Facebook', value: 'facebook' },
          ],
          required: true,
        },
        { name: 'providerId', type: 'text', required: true },
      ],
    },
    {
      name: 'lifecycleStage',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: '新註冊', value: 'new' },
        { label: '活躍', value: 'active' },
        { label: '流失風險', value: 'at-risk' },
        { label: '休眠', value: 'dormant' },
        { label: '流失', value: 'lost' },
      ],
      index: true,
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      index: true,
      admin: { description: 'CRM 標籤（goal 01 出欄位骨架、規則 goal 07）' },
    },
    {
      name: 'marketingConsent',
      type: 'group',
      admin: { description: '行銷同意（個資法細分）' },
      fields: [
        { name: 'email', type: 'checkbox', defaultValue: false },
        { name: 'sms', type: 'checkbox', defaultValue: false },
        { name: 'line', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
};

/**
 * Sessions collection（ADR-0010 §4 Database session）。
 *
 * - 每登入產一筆、登出刪除
 * - admin 可列出全 session 並單筆撤銷
 */
export const SessionsCollection: CollectionConfig = {
  slug: 'sessions',
  admin: {
    useAsTitle: 'userId',
    defaultColumns: ['userId', 'tenantId', 'ip', 'userAgent', 'expiresAt'],
  },
  access: {
    read: ({ req }) => {
      const role = userRole(req.user);
      return role === 'owner' || role === 'admin';
    },
    create: () => true,
    update: () => false,
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'tenantId', type: 'text', index: true },
    { name: 'ip', type: 'text' },
    { name: 'userAgent', type: 'text' },
    { name: 'expiresAt', type: 'date', required: true, index: true },
  ],
  timestamps: true,
};

/**
 * LoginAttempts collection（防爆破）。
 *
 * - 每次 login（成功 / 失敗）寫一筆
 * - 短時間內同 IP / 同 email 失敗達閾值 → 暫時鎖
 */
export const LoginAttemptsCollection: CollectionConfig = {
  slug: 'login-attempts',
  admin: {
    useAsTitle: 'identifier',
    defaultColumns: ['identifier', 'ip', 'success', 'reason', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      const role = userRole(req.user);
      return role === 'owner' || role === 'admin';
    },
    create: () => true,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'identifier',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'Email 或 phone' },
    },
    { name: 'ip', type: 'text', index: true },
    { name: 'success', type: 'checkbox', required: true, index: true },
    { name: 'reason', type: 'text' },
    { name: 'userAgent', type: 'text' },
  ],
  timestamps: true,
};
