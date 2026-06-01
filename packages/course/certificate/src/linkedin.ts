import type { Certificate } from './types.js';

export interface LinkedInShareInput {
  /** 機構在 LinkedIn 的 organization id（必填以正確掛上 issuer）。 */
  linkedInOrganizationId?: string;
  /** 機構顯示名稱（fallback）。 */
  issuerName: string;
  /** 公開驗證頁的 URL（例：https://example.com/certificates/ABC12345）。 */
  certificateVerifyUrl: string;
}

/**
 * 產生 LinkedIn「Add to Profile」連結。
 *
 * 規格參考：https://www.linkedin.com/help/linkedin/answer/a565738
 */
export function buildLinkedInAddToProfileUrl(
  cert: Certificate,
  input: LinkedInShareInput,
): string {
  const params = new URLSearchParams();
  params.set('startTask', 'CERTIFICATION_NAME');
  params.set('name', cert.courseTitle);
  if (input.linkedInOrganizationId) {
    params.set('organizationId', input.linkedInOrganizationId);
  } else {
    params.set('organizationName', input.issuerName);
  }
  params.set('issueYear', String(cert.issuedAt.getUTCFullYear()));
  params.set('issueMonth', String(cert.issuedAt.getUTCMonth() + 1));
  if (cert.expiresAt) {
    params.set('expirationYear', String(cert.expiresAt.getUTCFullYear()));
    params.set('expirationMonth', String(cert.expiresAt.getUTCMonth() + 1));
  }
  params.set('certUrl', input.certificateVerifyUrl);
  params.set('certId', cert.verificationCode);
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}
