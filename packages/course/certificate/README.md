# @saas-factory/course-certificate

課程結業證書系統：簽發 + 公開驗證頁 + PDF HTML 模板 + LinkedIn 加入個人檔案 + CPE/CEU 學分。

## 功能

- 8 碼 Crockford Base32 唯一驗證碼（不含 I/L/O/U 避免混淆）
- 學員姓名 + 課程名稱 **snapshot**（避免事後改名影響歷史證書）
- 重複簽發回傳既有證書（idempotent）
- 公開驗證頁查詢：撤銷 / 過期都會回傳 undefined
- LinkedIn「Add to Profile」標準 URL 產生器
- A4 橫向 HTML 模板（給 Puppeteer / Playwright 轉 PDF）
- CPE / CEU 學分欄位
- Payload `course-certificates` collection（含 unique verificationCode index）

## 用法

```ts
const svc = new CertificateService(new InMemoryCertificateStore());
const cert = await svc.issueCertificate({
  tenantId, courseId, userId,
  learnerName: '王小明', courseTitle: 'TS 進階',
  completedAt: new Date(), issuerName: 'SaaS Factory',
  cpeCredits: 5,
});

const html = renderCertificateHtml(cert, template, `https://example.com/v/${cert.verificationCode}`);
// → 交給 Puppeteer 印 PDF，再呼叫 svc.attachPdf(cert.id, storageKey)
```
