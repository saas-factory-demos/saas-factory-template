/**
 * 全域 collection 白名單。
 *
 * 列在這裡的 collection slug **不會**被 `tenantScoped` 套用 tenant filter，
 * 任何 user 都可以讀（依該 collection 自己的 access control）。
 *
 * 對應 ADR-0007「共用資源白名單」要求。
 *
 * 加入新項目時必須在 PR 註記理由。
 */
export const GLOBAL_COLLECTIONS = [
  /** 系統參數（時區、版本、feature flag），全租戶共用。 */
  'system-settings',
  /** Email 預設模板（客戶可 fork 出 tenant 版覆寫，原版仍全域）。 */
  'email-templates',
  /** Audit log 全域寫入，依 `tenantId` 欄位過濾顯示，不靠 tenant filter。 */
  'audit-logs',
  /** Users（員工）本身有獨立的多 tenant 存取機制（`tenants` 欄位陣列）。 */
  'users',
  /** Tenants collection 自己。 */
  'tenants',
  /** Sessions：以 userId / tenantId 直接 query、不走 tenant filter。 */
  'sessions',
  /** LoginAttempts：跨 tenant 觀察暴力破解。 */
  'login-attempts',
] as const;

export type GlobalCollectionSlug = (typeof GLOBAL_COLLECTIONS)[number];

export function isGlobalCollection(slug: string): boolean {
  return (GLOBAL_COLLECTIONS as readonly string[]).includes(slug);
}
