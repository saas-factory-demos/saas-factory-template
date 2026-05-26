# @saas-factory/auth

認證 + 授權 + 2FA + OAuth + OTP。對應 goal 01 §1 + ADR-0010 §1～§4、§8。

## Collections

- `users`（員工）：8 角色 + 多 tenant + 2FA 欄位
- `customers`（前台會員）：email / phone / OAuth + 生命週期 + 行銷同意（細分）
- `sessions`：Database session（14 天 rolling）
- `login-attempts`：防爆破

## 模組

| 模組               | 用途                                                  |
| ------------------ | ----------------------------------------------------- |
| `password-policy`  | 8 字 + 大小寫英數、黑名單擋常見密碼                   |
| `two-factor`       | TOTP（RFC 6238、30s 視窗、6 位碼）+ recovery codes    |
| `oauth-provider`   | Google / LINE / Facebook 抽象                         |
| `otp-provider`     | 三竹 + Twilio 雙 provider routing                     |
| `roles`            | 9 角色定義、`requires2FA(role)`                       |

## 用法

### 註冊 collections

```typescript
import {
  UsersCollection,
  CustomersCollection,
  SessionsCollection,
  LoginAttemptsCollection,
} from '@saas-factory/auth';
import { tenantScoped } from '@saas-factory/tenants';

export default buildConfig({
  collections: [
    UsersCollection, // 已在 GLOBAL_COLLECTIONS、不套 tenantScoped
    tenantScoped(CustomersCollection),
    SessionsCollection,
    LoginAttemptsCollection,
  ],
});
```

### 密碼驗證

```typescript
import { validatePassword } from '@saas-factory/auth';

const result = validatePassword(input);
if (!result.ok) {
  return { errors: result.errors };
}
```

### 2FA 啟用

```typescript
import { generateTotpSetup, verifyTotp } from '@saas-factory/auth';

const setup = generateTotpSetup(user.email);
// 把 setup.otpauthUrl 渲染成 QR code 給 user 掃
// 存 setup.secret 至 user.totpSecret、存 hashed setup.recoveryCodes
// user 提交 6 位驗證碼：
const ok = verifyTotp(user.totpSecret, code);
```

### OTP 簡訊

```typescript
import {
  MitakeProvider,
  OtpRouter,
  TwilioProvider,
  generateOtpCode,
} from '@saas-factory/auth';

const router = new OtpRouter(
  new MitakeProvider({
    user: process.env.SMS_MITAKE_USER!,
    password: process.env.SMS_MITAKE_PASS!,
  }),
  new TwilioProvider({
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    fromNumber: process.env.TWILIO_FROM_NUMBER!,
  }),
);

const code = generateOtpCode();
await router.send({ phone: '+886912345678', code, templateId: 'otp.login' });
```

### OAuth

```typescript
import { GoogleOAuthProvider } from '@saas-factory/auth';

const google = new GoogleOAuthProvider({
  clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
  clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
  redirectUri: `${process.env.APP_URL}/api/auth/callback/google`,
});

// 1. 跳轉到 Google
res.redirect(google.getAuthorizationUrl(state));

// 2. callback 收 code，換 profile
const profile = await google.exchangeCodeForProfile(code);
```

## 待補（pending credentials）

- 三竹 / Twilio HTTP 整合（目前 stub）
- OAuth `exchangeCodeForProfile` 實作
- pwned-passwords API 整合

## 指令

```bash
pnpm typecheck
pnpm lint
pnpm test
```
