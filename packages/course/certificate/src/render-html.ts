import type { Certificate, CertificateTemplate } from './types.js';

/**
 * 產出證書 HTML（A4 橫向，給 Puppeteer / Playwright 之類的工具轉 PDF 用）。
 *
 * 此函式只負責輸出標準 HTML 字串，PDF 引擎由呼叫端決定。
 */
export function renderCertificateHtml(
  cert: Certificate,
  template: CertificateTemplate,
  verifyUrl: string,
): string {
  const theme = template.themeColor ?? '#0f172a';
  const logo = template.logoUrl
    ? `<img src="${escapeHtml(template.logoUrl)}" alt="logo" style="height:48px;margin-bottom:18px" />`
    : '';
  const signImg = template.signatureImageUrl
    ? `<img src="${escapeHtml(template.signatureImageUrl)}" alt="signature" style="height:48px" />`
    : '';
  const cpe = cert.cpeCredits
    ? `<div style="margin-top:12px;font-size:13px;color:#475569">CPE 學分：${cert.cpeCredits}</div>`
    : '';
  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(cert.courseTitle)} 證書</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  body { font-family: "Noto Sans TC", sans-serif; margin: 0; }
  .cert {
    width: 297mm; height: 210mm;
    box-sizing: border-box; padding: 32mm 28mm;
    display: flex; flex-direction: column; justify-content: space-between;
    background: linear-gradient(135deg, #fff, #f8fafc);
    border: 8px solid ${escapeHtml(theme)};
    border-radius: 20px;
  }
  h1 { font-size: 42px; color: ${escapeHtml(theme)}; margin: 0; letter-spacing: 4px; }
  .learner { font-size: 36px; margin: 16px 0 8px; }
  .course { font-size: 24px; color: #1e293b; margin: 24px 0 16px; }
  .footer { display: flex; justify-content: space-between; align-items: end; }
  .code { font-family: ui-monospace, SF Mono, monospace; color: #475569; }
</style>
</head>
<body>
  <div class="cert">
    <header>
      ${logo}
      <h1>結業證書</h1>
    </header>
    <main>
      <div>茲證明</div>
      <div class="learner">${escapeHtml(cert.learnerName)}</div>
      <div>完成下列課程：</div>
      <div class="course">${escapeHtml(cert.courseTitle)}</div>
      <div>完成日期：${formatDate(cert.completedAt)}</div>
      ${cpe}
    </main>
    <footer class="footer">
      <div>
        ${signImg}
        <div>${escapeHtml(template.signerName)}</div>
        ${template.signerTitle ? `<div style="color:#475569;font-size:13px">${escapeHtml(template.signerTitle)}</div>` : ''}
      </div>
      <div style="text-align:right;font-size:12px;color:#475569">
        <div>驗證碼：<span class="code">${escapeHtml(cert.verificationCode)}</span></div>
        <div>驗證頁：${escapeHtml(verifyUrl)}</div>
        ${template.footerText ? `<div style="margin-top:8px">${template.footerText}</div>` : ''}
      </div>
    </footer>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(d: Date): string {
  return `${d.getUTCFullYear()} 年 ${d.getUTCMonth() + 1} 月 ${d.getUTCDate()} 日`;
}
