import { randomBytes, randomUUID } from 'node:crypto';

import type { Certificate, CertificateStore } from './types.js';

export interface IssueCertificateInput {
  tenantId: string;
  courseId: string;
  userId: string;
  learnerName: string;
  courseTitle: string;
  completedAt: Date;
  issuerName: string;
  cpeCredits?: number;
  ceuCredits?: number;
  expiresAt?: Date;
  now?: Date;
}

/** 證書簽發 / 驗證 service。 */
export class CertificateService {
  constructor(private readonly store: CertificateStore) {}

  /** 簽發（同學員 + 同課程已有 issued 證書時直接回傳既有證書，避免重複）。 */
  async issueCertificate(input: IssueCertificateInput): Promise<Certificate> {
    const existing = await this.store.findByUserAndCourse(
      input.tenantId,
      input.userId,
      input.courseId,
    );
    if (existing && existing.status === 'issued') return existing;
    const cert: Certificate = {
      id: randomUUID(),
      tenantId: input.tenantId,
      courseId: input.courseId,
      userId: input.userId,
      learnerName: input.learnerName,
      courseTitle: input.courseTitle,
      completedAt: input.completedAt,
      issuedAt: input.now ?? new Date(),
      verificationCode: await this.generateUniqueCode(),
      cpeCredits: input.cpeCredits,
      ceuCredits: input.ceuCredits,
      expiresAt: input.expiresAt,
      issuerName: input.issuerName,
      status: 'issued',
    };
    await this.store.upsert(cert);
    return cert;
  }

  /** 公開驗證頁查詢（找不到 / 已撤銷 / 已過期都回傳 undefined）。 */
  async getValidByCode(code: string, now: Date = new Date()): Promise<Certificate | undefined> {
    const cert = await this.store.getByVerificationCode(code);
    if (!cert) return undefined;
    if (cert.status === 'revoked') return undefined;
    if (cert.expiresAt && now > cert.expiresAt) return undefined;
    return cert;
  }

  /** 撤銷證書（例如發現抄襲、退費、誤發）。 */
  async revoke(id: string, reason: string): Promise<void> {
    const cert = await this.store.get(id);
    if (!cert) return;
    cert.status = 'revoked';
    cert.revokedReason = reason;
    await this.store.upsert(cert);
  }

  /** 將證書登錄到學員 PDF 儲存路徑（PDF 由外部產生，產出後回填）。 */
  async attachPdf(id: string, storageKey: string): Promise<void> {
    const cert = await this.store.get(id);
    if (!cert) throw new Error(`找不到證書：${id}`);
    cert.pdfStorageKey = storageKey;
    await this.store.upsert(cert);
  }

  private async generateUniqueCode(): Promise<string> {
    // 8 碼 Crockford Base32（不易混淆字元）
    for (let i = 0; i < 5; i++) {
      const code = base32Crockford(randomBytes(5));
      const exists = await this.store.getByVerificationCode(code);
      if (!exists) return code;
    }
    throw new Error('產生驗證碼失敗（連續 5 次撞號）');
  }
}

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function base32Crockford(buf: Buffer): string {
  let out = '';
  let bits = 0;
  let value = 0;
  for (const b of buf) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += CROCKFORD[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += CROCKFORD[(value << (5 - bits)) & 31];
  return out.slice(0, 8);
}
