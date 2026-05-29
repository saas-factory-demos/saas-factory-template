/** SSO provider 類型。 */
export type SsoProviderType = 'google-workspace' | 'entra' | 'saml';

/** Google Workspace SSO 設定（OIDC discover URL + client ID）。 */
export interface GoogleSsoConfig {
  type: 'google-workspace';
  hostedDomain: string;
  clientId: string;
  clientSecret: string;
}

/** Microsoft Entra ID（前 Azure AD）SSO 設定。 */
export interface EntraSsoConfig {
  type: 'entra';
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

/** SAML 2.0 SSO 設定。 */
export interface SamlSsoConfig {
  type: 'saml';
  entityId: string;
  idpSsoUrl: string;
  /** PEM 格式 IdP 簽章憑證（驗 assertion 用）。 */
  idpCertPem: string;
  /** 屬性對應：claim name → 內部欄位。 */
  attributeMap?: {
    email?: string;
    name?: string;
    department?: string;
    employeeId?: string;
  };
}

/** 聯合 SSO 設定。 */
export type SsoConfig = GoogleSsoConfig | EntraSsoConfig | SamlSsoConfig;

/** 企業帳號。 */
export interface B2BAccount {
  id: string;
  tenantId: string;
  companyName: string;
  /** 公司網域（多個用陣列）：用來自動 SSO 路由 + CSV 匯入驗證。 */
  domains: string[];
  /** 購買席次數。 */
  seatsTotal: number;
  /** 已用席次（同步來自 B2BLearner.status === 'active'）。 */
  seatsUsed: number;
  contractStartDate: Date;
  contractEndDate: Date;
  ssoConfig?: SsoConfig;
  /** 預先指派的課程 ID 清單（新員工進來自動 enroll）。 */
  autoEnrollCourses: string[];
  status: 'active' | 'suspended' | 'expired';
}

/** 學員（屬於某 B2BAccount）狀態。 */
export type B2BLearnerStatus = 'active' | 'inactive' | 'departed';

/** B2B 學員。 */
export interface B2BLearner {
  id: string;
  tenantId: string;
  b2bAccountId: string;
  /** 對應 user 系統的 userId（若已連帳號）。 */
  userId?: string;
  email: string;
  name?: string;
  employeeId?: string;
  department?: string;
  status: B2BLearnerStatus;
  invitedAt: Date;
  activatedAt?: Date;
  /** 來源：csv-import / sso-jit / manual。 */
  provisioningSource: 'csv-import' | 'sso-jit' | 'manual';
}

/** CSV 匯入單筆資料（最小欄位）。 */
export interface CsvLearnerRow {
  email: string;
  name?: string;
  employeeId?: string;
  department?: string;
}

/** CSV 匯入結果。 */
export interface CsvImportResult {
  imported: number;
  skipped: number;
  skippedReasons: Array<{ email: string; reason: string }>;
  reachedSeatLimit: boolean;
}

/** B2B store 介面。 */
export interface B2BStore {
  getAccount(id: string): Promise<B2BAccount | undefined>;
  upsertAccount(a: B2BAccount): Promise<void>;
  findAccountByDomain(tenantId: string, domain: string): Promise<B2BAccount | undefined>;
  upsertLearner(l: B2BLearner): Promise<void>;
  findLearnerByEmail(b2bAccountId: string, email: string): Promise<B2BLearner | undefined>;
  listLearners(b2bAccountId: string): Promise<B2BLearner[]>;
}
