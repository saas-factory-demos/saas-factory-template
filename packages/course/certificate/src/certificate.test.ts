import { describe, expect, it } from 'vitest';

import { InMemoryCertificateStore } from './in-memory-store.js';
import { buildLinkedInAddToProfileUrl } from './linkedin.js';
import { renderCertificateHtml } from './render-html.js';
import { CertificateService } from './service.js';

import type { CertificateTemplate } from './types.js';

const TENANT = 't1';

function setup() {
  const store = new InMemoryCertificateStore();
  return { store, svc: new CertificateService(store) };
}

const baseInput = {
  tenantId: TENANT,
  courseId: 'c1',
  userId: 'u1',
  learnerName: '王小明',
  courseTitle: 'TypeScript 進階',
  completedAt: new Date(Date.UTC(2026, 4, 15)),
  issuerName: 'SaaS Factory',
};

describe('CertificateService.issueCertificate', () => {
  it('簽發新證書，verificationCode 為 8 碼', async () => {
    const { svc } = setup();
    const cert = await svc.issueCertificate(baseInput);
    expect(cert.status).toBe('issued');
    expect(cert.verificationCode).toMatch(/^[0-9A-HJ-NP-TV-Z]{8}$/);
  });

  it('同學員 + 同課程再次簽發 → 回傳既有證書', async () => {
    const { svc } = setup();
    const a = await svc.issueCertificate(baseInput);
    const b = await svc.issueCertificate(baseInput);
    expect(a.id).toBe(b.id);
  });
});

describe('CertificateService.getValidByCode', () => {
  it('正常簽發 → 找得到', async () => {
    const { svc } = setup();
    const c = await svc.issueCertificate(baseInput);
    expect(await svc.getValidByCode(c.verificationCode)).toBeDefined();
  });

  it('撤銷後 → 找不到', async () => {
    const { svc } = setup();
    const c = await svc.issueCertificate(baseInput);
    await svc.revoke(c.id, '抄襲');
    expect(await svc.getValidByCode(c.verificationCode)).toBeUndefined();
  });

  it('已過期 → 找不到', async () => {
    const { svc } = setup();
    const c = await svc.issueCertificate({
      ...baseInput,
      expiresAt: new Date(Date.UTC(2026, 0, 1)),
    });
    expect(await svc.getValidByCode(c.verificationCode, new Date(Date.UTC(2026, 6, 1)))).toBeUndefined();
  });
});

describe('CertificateService.attachPdf', () => {
  it('儲存 PDF key', async () => {
    const { svc, store } = setup();
    const c = await svc.issueCertificate(baseInput);
    await svc.attachPdf(c.id, 'certs/abc.pdf');
    const got = await store.get(c.id);
    expect(got?.pdfStorageKey).toBe('certs/abc.pdf');
  });
});

describe('LinkedIn share URL', () => {
  it('組出標準參數', async () => {
    const { svc } = setup();
    const cert = await svc.issueCertificate(baseInput);
    const url = buildLinkedInAddToProfileUrl(cert, {
      issuerName: 'SaaS Factory',
      certificateVerifyUrl: 'https://example.com/v/' + cert.verificationCode,
      linkedInOrganizationId: '123456',
    });
    expect(url).toContain('linkedin.com/profile/add');
    expect(url).toContain('organizationId=123456');
    expect(url).toContain(`certId=${cert.verificationCode}`);
    expect(url).toContain('issueYear=2026');
  });
});

describe('renderCertificateHtml', () => {
  it('輸出含學員姓名 + 驗證碼 + 課程名稱', async () => {
    const { svc } = setup();
    const cert = await svc.issueCertificate({ ...baseInput, cpeCredits: 5 });
    const template: CertificateTemplate = {
      signerName: '李執行長',
      signerTitle: 'CEO',
      themeColor: '#0f172a',
    };
    const html = renderCertificateHtml(cert, template, 'https://example.com/v/' + cert.verificationCode);
    expect(html).toContain('王小明');
    expect(html).toContain('TypeScript 進階');
    expect(html).toContain(cert.verificationCode);
    expect(html).toContain('CPE 學分：5');
  });

  it('HTML escape 防 XSS', async () => {
    const { svc } = setup();
    const cert = await svc.issueCertificate({
      ...baseInput,
      learnerName: '<script>alert(1)</script>',
    });
    const html = renderCertificateHtml(
      cert,
      { signerName: '' },
      'https://example.com/v/' + cert.verificationCode,
    );
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
