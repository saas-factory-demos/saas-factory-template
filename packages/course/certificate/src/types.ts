/** 證書狀態。 */
export type CertificateStatus = 'issued' | 'revoked' | 'expired';

/** 證書資料。 */
export interface Certificate {
  id: string;
  tenantId: string;
  courseId: string;
  userId: string;
  /** 學員姓名（snapshot，避免日後改名影響歷史證書）。 */
  learnerName: string;
  /** 課程名稱（snapshot）。 */
  courseTitle: string;
  /** 完成時間（學員達成證書條件的時間）。 */
  completedAt: Date;
  /** 簽發時間。 */
  issuedAt: Date;
  /** 公開驗證碼（短、唯一、URL-safe，例如 8 碼 base32）。 */
  verificationCode: string;
  /** PDF 在物件儲存的 key（lazy 生成；首次下載前可能為空）。 */
  pdfStorageKey?: string;
  /** CPE 學分（如有專業認證需求，預設 0）。 */
  cpeCredits?: number;
  /** CEU 學分（部分美規教育機構使用）。 */
  ceuCredits?: number;
  /** 證書效期截止（undefined = 永久）。 */
  expiresAt?: Date;
  /** 簽發單位 / 講師名稱。 */
  issuerName: string;
  status: CertificateStatus;
  /** 撤銷原因（撤銷時填）。 */
  revokedReason?: string;
}

/** 證書版型（每門課可不同）。 */
export interface CertificateTemplate {
  /** 顯示在頂部的 logo URL。 */
  logoUrl?: string;
  /** 主視覺色（hex）。 */
  themeColor?: string;
  /** 講師 / 校長簽名圖檔 URL。 */
  signatureImageUrl?: string;
  /** 簽名下方人名。 */
  signerName: string;
  /** 簽名下方頭銜。 */
  signerTitle?: string;
  /** 自訂底部說明文字（HTML 安全字串）。 */
  footerText?: string;
}

/** 證書儲存介面。 */
export interface CertificateStore {
  get(id: string): Promise<Certificate | undefined>;
  getByVerificationCode(code: string): Promise<Certificate | undefined>;
  findByUserAndCourse(
    tenantId: string,
    userId: string,
    courseId: string,
  ): Promise<Certificate | undefined>;
  upsert(c: Certificate): Promise<void>;
  list(tenantId: string, userId: string): Promise<Certificate[]>;
}
