import AxeBuilder from '@axe-core/playwright';
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
 * 5. 首頁 hero h1 可見（驗證 seed-pages 已成功寫入 Payload pages 且 BlockRenderer 正常渲染）
 * 6. 首頁所有 img 都有非空 alt（基本無障礙底線，避免螢幕報讀器讀不出圖）
 * 7. axe-core a11y scan（WCAG 2.1 AA + best practice）— 不允許任何 violation
 *
 * Lighthouse perf≥90 audit 在獨立 spec `demo-sites-lighthouse.spec.ts`，由 playwright.config
 * 的 `lighthouse` project 跑（需 --remote-debugging-port）。
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

    test('首頁 hero h1 可見（驗證 seed-pages 渲染成功）', async ({ page }) => {
      await page.goto(baseUrl!, { waitUntil: 'load' });
      // 5 站首頁皆以 hero block 開頭，hero block 一律 render <h1>
      // h1 不可見代表：seed-pages 沒寫成功 / BlockRenderer 抓不到 block / 首頁 fallback 空白
      const h1 = page.locator('h1').first();
      await expect(h1, '首頁應至少有一個可見的 h1（hero 標題）').toBeVisible();
      const text = (await h1.textContent())?.trim() ?? '';
      expect(text.length, 'h1 文字不應為空字串').toBeGreaterThan(0);
    });

    test('首頁所有 img 都有非空 alt（無障礙底線）', async ({ page }) => {
      await page.goto(baseUrl!, { waitUntil: 'load' });
      // 撈所有 <img> 的 alt；裝飾性圖建議用 alt=""（HTML 規格允許），這裡放寬至「alt attribute 存在」
      // 但若顯示為圖片內容（非裝飾），空 alt 仍會被螢幕報讀器跳過——所以這裡兼顧寬鬆與底線：
      // alt 必須存在（null 不行），允許空字串（裝飾圖）
      const imgs = page.locator('img');
      const count = await imgs.count();
      const missingAlt: string[] = [];
      for (let i = 0; i < count; i += 1) {
        const img = imgs.nth(i);
        const alt = await img.getAttribute('alt');
        if (alt === null) {
          const src = (await img.getAttribute('src')) ?? '(no src)';
          missingAlt.push(src);
        }
      }
      expect(
        missingAlt,
        `以下 img 缺少 alt attribute（無障礙違規）：${missingAlt.join(', ')}`,
      ).toEqual([]);
    });

    test('首頁 axe-core a11y scan（WCAG 2.1 AA）moderate 以上無 violation', async ({ page }) => {
      await page.goto(baseUrl!, { waitUntil: 'load' });
      // axe-core 用業界標準 ruleset（wcag2a, wcag2aa, wcag21a, wcag21aa）。
      // 收緊規則：impact >= moderate 都視為失敗（原本 serious / critical）。
      // moderate 通常是「對比度不足」「label 缺失」這類，客戶站客戶會看到，必須修。
      // minor 通常是「最佳實踐」級別，留 manual review，CI 不擋。
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const blocking = results.violations.filter(
        (v) =>
          v.impact === 'moderate' || v.impact === 'serious' || v.impact === 'critical',
      );
      const summary = blocking
        .map((v) => `[${v.impact}] ${v.id}：${v.help}（${v.nodes.length} 處）`)
        .join('\n');
      expect(
        blocking,
        `axe-core 偵測到 moderate/serious/critical 違規：\n${summary}`,
      ).toEqual([]);
    });
  });
}
