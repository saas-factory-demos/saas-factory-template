/**
 * 員工角色定義（對應 goal 01 §1）。
 *
 * 對應 packages/types BackofficeRole（goal-00 已定義）。
 */
export const STAFF_ROLES = [
  'owner',
  'admin',
  'marketing',
  'cs_lead',
  'cs',
  'accounting',
  'editor',
  'shipper',
  'instructor',
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

/**
 * 強制 2FA 的角色（ADR-0010 §8）。
 */
export const ROLES_REQUIRING_2FA: ReadonlyArray<StaffRole> = ['owner', 'admin'];

export function requires2FA(role: StaffRole): boolean {
  return ROLES_REQUIRING_2FA.includes(role);
}
