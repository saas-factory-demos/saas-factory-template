import { requires2FA, type StaffRole } from './roles.js';

/**
 * 2FA 強制執行政策（ADR-0010 §8）。
 *
 * 規則：
 * - owner / admin 角色登入後 7 天緩衝期內未啟用 2FA → 強制導去 setup 頁
 * - 緩衝期過後仍未啟用 → 鎖到只能看 2FA setup 頁，其他後台路由全拒
 * - 已啟用 TOTP 或至少一把 Passkey 視為通過
 *
 * 為何拆獨立 helper：middleware / page guard / API route 都要套，邏輯統一在此維護。
 */

/** 緩衝期天數（從帳號建立日起算）。 */
export const TWO_FA_GRACE_PERIOD_DAYS = 7;

/** 2FA 強制執行檢查結果。 */
export type EnforcementResult =
  | { status: 'not-required'; reason: 'role-not-staff' | 'role-exempt' }
  | { status: 'satisfied'; method: 'totp' | 'passkey' | 'both' }
  | { status: 'grace-period'; daysRemaining: number }
  | { status: 'must-enable'; daysOverdue: number };

/**
 * 判斷 user 當前 2FA 狀態。
 *
 * @param user.role staff role
 * @param user.createdAt 帳號建立時間（緩衝期起算點）
 * @param user.totpEnabled 是否已啟用 TOTP
 * @param user.passkeyCount 已註冊 Passkey 數量
 * @param now 現在時間（測試可注入）
 */
export function check2FAEnforcement(
  user: {
    role: string;
    createdAt: Date;
    totpEnabled: boolean;
    passkeyCount: number;
  },
  now: Date = new Date(),
): EnforcementResult {
  // 非 staff role（純前台會員）→ 不強制
  if (!isStaffRole(user.role)) {
    return { status: 'not-required', reason: 'role-not-staff' };
  }
  if (!requires2FA(user.role)) {
    return { status: 'not-required', reason: 'role-exempt' };
  }

  // 已啟用任一種 → 通過
  const hasTotp = user.totpEnabled;
  const hasPasskey = user.passkeyCount > 0;
  if (hasTotp && hasPasskey) return { status: 'satisfied', method: 'both' };
  if (hasTotp) return { status: 'satisfied', method: 'totp' };
  if (hasPasskey) return { status: 'satisfied', method: 'passkey' };

  // 緩衝期判斷
  const elapsedMs = now.getTime() - user.createdAt.getTime();
  const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
  if (elapsedDays < TWO_FA_GRACE_PERIOD_DAYS) {
    return {
      status: 'grace-period',
      daysRemaining: TWO_FA_GRACE_PERIOD_DAYS - elapsedDays,
    };
  }
  return {
    status: 'must-enable',
    daysOverdue: elapsedDays - TWO_FA_GRACE_PERIOD_DAYS,
  };
}

/**
 * 是否應該擋使用者進入後台其他頁面（強制導到 2FA setup）。
 *
 * grace-period 階段也回 true，但 UI 應顯示「友善提示 + 倒數」而非「禁止」。
 * 緩衝期過 → 硬擋。
 */
export function shouldBlockUntil2FA(result: EnforcementResult): boolean {
  return result.status === 'must-enable';
}

/**
 * 是否應該在 UI 顯示提醒 banner（不擋，但提示使用者該開了）。
 */
export function shouldNudge2FA(result: EnforcementResult): boolean {
  return result.status === 'grace-period';
}

function isStaffRole(role: string): role is StaffRole {
  const staffRoles: ReadonlyArray<string> = [
    'owner',
    'admin',
    'marketing',
    'cs_lead',
    'cs',
    'accounting',
    'editor',
    'shipper',
    'instructor',
  ];
  return staffRoles.includes(role);
}
