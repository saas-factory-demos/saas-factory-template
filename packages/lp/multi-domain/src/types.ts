/** 網域驗證狀態。 */
export type DomainVerificationStatus = 'pending' | 'verified' | 'failed';

/** 一個對應到 LP 的網域繫結。 */
export interface LpDomainBinding {
  id: string;
  tenantId: string;
  /** custom domain（不含 scheme），例如 product-a.example.com。 */
  domain: string;
  /** 該網域對應的 page。 */
  pageId: string;
  /** 是否為該 page 的預設網域（用於分享連結）。 */
  isPrimary: boolean;
  verificationStatus: DomainVerificationStatus;
  /** DNS TXT 驗證 token。 */
  verificationToken: string;
  createdAt: Date;
  verifiedAt?: Date;
}

/** 路由解析結果：給 Next.js middleware 用，把 hostname 對應到 pageId。 */
export interface DomainRouteResolution {
  tenantId: string;
  pageId: string;
  domain: string;
  isPrimary: boolean;
}
