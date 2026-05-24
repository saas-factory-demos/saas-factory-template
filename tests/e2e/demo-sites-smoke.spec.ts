import { expect, test } from '@playwright/test';

/**
 * Demo sites smoke：5 個範例客戶站的最小可用性檢查。
 *
 * 對應 goal 99.7（依賴 99.1 五範例站實機部署）。spec 樣板先寫好，等 5 站 deploy 後
 * 把對應 env 注入即可跑。env 缺值時 spec 用 `test.skip` 跳過（不擋 CI）。
 *
 * 預期 env（每站獨立 base URL，部署完 Vercel preview / production URL 後填入）：
 * - DEMO_RESTAURANT_URL
 * - DEMO_INTERIOR_URL
 * - DEMO_CLINIC_URL
 * - DEMO_ECOMMERCE_URL
 * - DEMO_SAAS_URL
 *
 * 每站基本檢查（跨行業共用，避免 spec 為每站客製化）：
 * 1. 首頁 200 + body 可見
 * 2. /admin（Payload 後台路徑）至少回 200 / 302（登入導向）
 * 3. /api/health 回 ok（template app/api/health/route.ts 已存在）
 * 4. 無 unhandled JS 例外
 *
 * 不檢核：實際內容字串（會隨 CMS 改動而 flaky）、登入流程（每站憑證不同）、付款流程
 * （需 sandbox 環境且超出 smoke 範疇）。
 */

interface DemoSite {
  key: string;
  label: string;
  envKey: string;
}

const DEMO_SITES: ReadonlyArray<DemoSite> = [
  { key: 'restaurant', label: '餐飲（橙光小館）', envKey: 'DEMO_RESTAURANT_URL' },
  { key: 'interior-design', label: '室內設計（木紋設計工作室）', envKey: 'DEMO_INTERIOR_URL' },
  { key: 'clinic', label: '診所（晨光牙醫診所）', envKey: 'DEMO_CLINIC_URL' },
  { key: 'ecommerce', label: '電商（日青選物）', envKey: 'DEMO_ECOMMERCE_URL' },
  { key: 'saas', label: 'SaaS（Pipeline Cloud）', envKey: 'DEMO_SAAS_URL' },
];

for (const site of DEMO_SITES) {
  test.describe(`demo site: ${site.label}`, () => {
    const baseUrl = process.env[site.envKey];

    test.skip(!baseUrl, `${site.envKey} 未設定 → 跳過（範例站尚未部署）`);

    test('首頁 200 + body 可見 + 無 JS 例外', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('pageerror', (err) => consoleErrors.push(err.message));

      const response = await page.goto(baseUrl!, { waitUntil: 'load' });
      expect(response?.status(), '首頁 HTTP 狀態').toBeLessThan(400);

      await expect(page.locator('body')).toBeVisible();

      expect(consoleErrors, '首頁不應有 unhandled JS 例外').toEqual([]);
    });

    test('/api/health 回 ok', async ({ request }) => {
      const res = await request.get(`${baseUrl}/api/health`);
      expect(res.status(), '/api/health HTTP 狀態').toBeLessThan(400);
      const body = (await res.json()) as { ok?: boolean };
      expect(body.ok, '/api/health.ok 應為 true').toBe(true);
    });

    test('/admin 回登入頁（200 或 302）', async ({ request }) => {
      const res = await request.get(`${baseUrl}/admin`, { maxRedirects: 0 });
      // Payload 後台未登入時可能回 200（顯示登入表單）或 302/307（重導至登入頁）
      const status = res.status();
      expect(
        [200, 302, 307].includes(status),
        `/admin 應回 200/302/307，實際 ${status}`,
      ).toBe(true);
    });
  });
}
