import { expect, test } from '@playwright/test';

/**
 * Template app [locale] routing 冒煙測試。
 *
 * - 測哪：template app（goal-09i / goal-10）的 `/`、`/zh-TW`、`/en`、middleware locale 重導
 * - baseURL：跟 playwright.config.ts 一致；CI 走 Vercel preview，本機走 :3000
 * - 跳過條件：TEMPLATE_E2E !== '1' 時略過（避免 factory-smoke 跑時誤撞）
 *
 * 用法：
 *   TEMPLATE_E2E=1 pnpm test:e2e tests/e2e/template-locale.spec.ts
 *   或本機開 template：`pnpm --filter @saas-factory/template dev` 後執行
 *
 * 預期前提：未連 Payload DB（fallback 至 placeholder），或已 seed 首頁。
 * 兩種情況都該 HTTP 200 + 含 brandName。
 */

const ENABLED = process.env.TEMPLATE_E2E === '1';

test.describe('template app [locale] routing', () => {
  test.skip(!ENABLED, 'TEMPLATE_E2E !== "1"，預設略過避免撞 factory app');

  test('GET / → 重導至預設 locale /zh-TW', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.status(), 'final response status').toBeLessThan(400);
    expect(page.url(), 'middleware 重導後 URL').toMatch(/\/zh-TW(\/|$)/);
  });

  test('GET /zh-TW → 200 + 含 brandName', async ({ page }) => {
    const response = await page.goto('/zh-TW', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    /* 不論真資料 / placeholder 都應該帶 brandName（projectConfig.meta.brandName） */
    await expect(page.locator('body')).toContainText(/SaaS Factory|Demo/);
  });

  test('GET /en → 200', async ({ page }) => {
    const response = await page.goto('/en', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
  });

  test('GET /admin → bypass locale 不重導', async ({ page }) => {
    /* admin 走 Payload，middleware 應該放行不加 locale 前綴 */
    const response = await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    /* admin 未登入會 302 → /admin/login，仍不該加 /zh-TW 前綴 */
    expect(page.url(), 'admin URL 不含 locale 前綴').not.toMatch(/\/zh-TW\/admin|\/en\/admin/);
    expect(response?.status()).toBeLessThan(500);
  });

  test('GET /api/health → bypass locale + 200', async ({ page }) => {
    const response = await page.request.get('/api/health');
    /* /api/health 在 template app 可能不存在；不丟 404 即可接受（200/404 都算 middleware 沒擋） */
    expect([200, 404]).toContain(response.status());
  });

  test('不支援的 locale segment → notFound', async ({ page }) => {
    /* layout.tsx 設 dynamicParams=false + generateStaticParams 只列 zh-TW/en
     * → /fr 應該 404 */
    const response = await page.goto('/fr', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(404);
  });
});
