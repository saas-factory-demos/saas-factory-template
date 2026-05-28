/**
 * 後台 Users 登入策略 + 寫入策略（純邏輯，可單元測試）。
 *
 * 對應：
 * - ADR-0100：factory-support 通道凍結時阻擋登入
 * - 99.4-2FA-2：owner / admin 7 天緩衝期未啟用 TOTP → 鎖帳
 * - ADR-0100 防禦深化：客戶端不可手動建 / 改成 factory-support 角色
 *
 * 為何拆檔：payload `beforeLogin` / `beforeChange` hook 依賴 req.payload runtime
 * 無法純測；把判斷邏輯抽到本檔後，可以對所有分支寫 unit test。
 */

/** beforeLogin 取得的 user shape 子集。 */
export interface LoginUserSnapshot {
  role?: string | null;
  factoryAccessDisabledAt?: string | null;
  totpEnabled?: boolean | null;
  createdAt?: string | null;
}

/** 評估結果：ok 放行 / reason 拒絕原因。 */
export type LoginPolicyResult =
  | { ok: true }
  | { ok: false; reason: 'support-disabled' | 'totp-grace-expired'; message: string };

/**
 * 給 beforeLogin hook 用的純函式。
 * - factory-support 帳號被客戶 disable → 拒絕
 * - owner / admin 註冊滿 `gracePeriodDays` 天但未啟用 TOTP → 拒絕
 *
 * factory-support 不走 TOTP（密碼由工廠 HMAC rotate 管理），不適用 7 天規則。
 */
export function evaluateLoginPolicy(
  user: LoginUserSnapshot,
  options: { now?: number; gracePeriodDays?: number } = {},
): LoginPolicyResult {
  const now = options.now ?? Date.now();
  const gracePeriodDays = options.gracePeriodDays ?? 7;

  if (user.role === 'factory-support' && user.factoryAccessDisabledAt) {
    return {
      ok: false,
      reason: 'support-disabled',
      message: 'Factory Support 通道已被客戶停用，請先呼叫工廠端 enable API 解除',
    };
  }

  if (user.role === 'owner' || user.role === 'admin') {
    const createdAt = user.createdAt ? new Date(user.createdAt).getTime() : now;
    const ageDays = (now - createdAt) / 86_400_000;
    if (ageDays > gracePeriodDays && !user.totpEnabled) {
      return {
        ok: false,
        reason: 'totp-grace-expired',
        message: `此帳號註冊已超過 ${gracePeriodDays} 天但未啟用 TOTP 2FA；依資安政策已鎖定，請聯絡管理員開啟 2FA 後再登入。`,
      };
    }
  }

  return { ok: true };
}

/** evaluateRoleChangePolicy 的 input。 */
export interface RoleChangeInput {
  /** 即將寫入的資料（new role）。 */
  incomingRole?: string | null;
  /** 既有資料的 role（update 場景）；新建時為 undefined。 */
  existingRole?: string | null;
  /** 即將寫入的 isFactoryManaged。 */
  incomingIsFactoryManaged?: boolean | null;
  /** 操作者 — 由 HMAC route overrideAccess 寫入時為 undefined。 */
  operationContext: 'admin-ui' | 'hmac-override' | 'system';
}

export type RoleChangePolicyResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'forbidden-factory-support-create' | 'forbidden-role-escalation';
      message: string;
    };

/**
 * 評估 Users collection 寫入時的角色變更策略（防禦深化，ADR-0100）。
 *
 * - admin-ui 操作：禁止 `role=factory-support` 或 `isFactoryManaged=true` 的任何
 *   寫入 / 更新（客戶端的 owner / admin 都不能繞）
 * - hmac-override 操作：放行（factory ↔ template 的 HMAC API 走 overrideAccess: true）
 * - system 操作：放行（migration / seed 等內部腳本）
 *
 * 為何要在 application layer 多此一層：Payload 的 access control 走 RBAC，
 * 客戶站 owner 預設可建立任何 user / 改任何 role；ADR-0100 要求只有 factory
 * HMAC 能管理此服務帳號，故需要 collection-level beforeChange hook 阻擋。
 */
export function evaluateRoleChangePolicy(input: RoleChangeInput): RoleChangePolicyResult {
  if (input.operationContext !== 'admin-ui') {
    return { ok: true };
  }
  // 客戶端禁止新建 / 改成 factory-support 角色
  if (input.incomingRole === 'factory-support') {
    return {
      ok: false,
      reason: 'forbidden-factory-support-create',
      message:
        'factory-support 角色僅供 SaaS Factory 透過 HMAC API 建立 / 維護；後台 UI 不可手動指定此角色（ADR-0100）。',
    };
  }
  // 客戶端不可手動標 isFactoryManaged=true
  if (input.incomingIsFactoryManaged === true && input.existingRole !== 'factory-support') {
    return {
      ok: false,
      reason: 'forbidden-factory-support-create',
      message: 'isFactoryManaged 旗標僅供 SaaS Factory 自動建立帳號時設定，後台 UI 不可手動勾選。',
    };
  }
  // 已是 factory-support 的帳號，不允許從後台改成非 factory-support 角色
  // （要先走 HMAC disable，再走退場流程刪除；不允許「降級偷用」）
  if (
    input.existingRole === 'factory-support' &&
    input.incomingRole &&
    input.incomingRole !== 'factory-support'
  ) {
    return {
      ok: false,
      reason: 'forbidden-role-escalation',
      message:
        'factory-support 帳號角色不可在後台 UI 變更；如要徹底移除，請走 ToS 第 6 條退場流程。',
    };
  }
  return { ok: true };
}

