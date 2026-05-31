import { createHash } from 'node:crypto';

import { z } from 'zod';

/**
 * 密碼政策（ADR-0010 §3）：
 * - 至少 8 字
 * - 必含大寫英文 + 小寫英文 + 數字
 * - 不強制特殊字元
 * - 不強制定期改密碼
 */
export const passwordSchema = z
  .string()
  .min(8, '密碼至少 8 字')
  .refine((v) => /[A-Z]/.test(v), '密碼必須包含至少一個大寫英文')
  .refine((v) => /[a-z]/.test(v), '密碼必須包含至少一個小寫英文')
  .refine((v) => /[0-9]/.test(v), '密碼必須包含至少一個數字');

/**
 * 常見弱密碼黑名單（節錄 top 50）。離線快速判定，無需網路。
 *
 * 生產環境建議再串 `checkPwnedPassword`（HIBP k-anonymity API）做雙保險。
 */
const WEAK_PASSWORDS = new Set([
  'Password1',
  'Qwerty123',
  'Admin1234',
  'Welcome1',
  'Letmein1',
  'Iloveyou1',
  'Sunshine1',
  'Football1',
  'Abc12345',
  'Password123',
]);

export function isWeakPassword(password: string): boolean {
  return WEAK_PASSWORDS.has(password);
}

export interface PasswordValidationResult {
  ok: boolean;
  errors: string[];
}

/**
 * 驗證密碼（離線部分）。
 *
 * 回傳結構化結果（不 throw）便於前端逐條顯示。
 *
 * pwned-passwords 線上檢查請另呼叫 `checkPwnedPassword`（async）後合併。
 */
export function validatePassword(password: string): PasswordValidationResult {
  const result = passwordSchema.safeParse(password);
  const errors: string[] = [];
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(issue.message);
    }
  }
  if (isWeakPassword(password)) {
    errors.push('密碼太常見，請換一組');
  }
  return { ok: errors.length === 0, errors };
}

/**
 * HIBP（Have I Been Pwned）pwned-passwords API endpoint。
 *
 * 用 k-anonymity 模式：只傳 SHA-1 hash 前 5 碼，server 回所有同前綴的尾段 + 計數。
 * 客戶端比對全段 hash 即可判定密碼是否外洩。**原始密碼從不離開本機**。
 *
 * Docs: https://haveibeenpwned.com/API/v3#PwnedPasswords
 */
const HIBP_RANGE_URL = 'https://api.pwnedpasswords.com/range';

/**
 * pwned-passwords 檢查結果。
 */
export interface PwnedCheckResult {
  /** 密碼是否被列為外洩。fetch 失敗時為 false（fail-open 不阻擋登入；errors 會帶錯誤訊息）。 */
  pwned: boolean;
  /** 在 HIBP 紀錄中出現次數；0 = 未外洩，> 0 = 已外洩。 */
  count: number;
  /** fetch / parse 錯誤訊息（fail-open 訊號）。 */
  error?: string;
}

/**
 * 對單一密碼跑 HIBP k-anonymity 檢查。
 *
 * fail-open 設計：HIBP 服務掛掉時不阻擋使用者註冊（會額外標 error），避免單一第三方服務拖垮整個註冊流程。
 * 重大外洩仍可透過離線黑名單 + 8 字長度 + 字元組成擋掉多數弱密碼。
 *
 * @param password 明文密碼
 * @param fetchImpl 可注入的 fetch（測試用）
 */
export async function checkPwnedPassword(
  password: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PwnedCheckResult> {
  const sha1 = createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const res = await fetchImpl(`${HIBP_RANGE_URL}/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    });
    if (!res.ok) {
      return { pwned: false, count: 0, error: `HIBP HTTP ${res.status}` };
    }
    const text = await res.text();
    for (const line of text.split('\n')) {
      const [hashSuffix, countStr] = line.trim().split(':');
      if (hashSuffix === suffix) {
        const count = Number.parseInt(countStr ?? '0', 10);
        if (count > 0) return { pwned: true, count };
      }
    }
    return { pwned: false, count: 0 };
  } catch (err) {
    return {
      pwned: false,
      count: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
