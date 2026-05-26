import { test } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

/**
 * 5 站 Lighthouse audit（perf≥90 / accessibility≥95 / best-practices≥90 / seo≥90）。
 *
 * 對應 goal 99.7 驗收項目：「Lighthouse perf≥90」「accessibility≥95」。
 *
 * 為何獨立 spec：playwright-lighthouse 需要 Chrome 開 remote-debugging-port，
 * 而一般 Playwright test 不會開 port，所以必須由 `lighthouse` project 跑
 * （見 playwright.config.ts）。port 9222 與 launchOptions args 對齊。
 *
 * env 缺值時用 `test.skip` 跳過（與 smoke spec 行為一致，不擋 CI）。
 *
 * 預期 env：
 * - DEMO_RESTAURANT_URL / DEMO_INTERIOR_URL / DEMO_CLINIC_URL / DEMO_ECOMMERCE_URL / DEMO_SAAS_URL
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

const THRESHOLDS = {
  performance: 90,
  accessibility: 95,
  'best-practices': 90,
  seo: 90,
};

for (const site of DEMO_SITES) {
  test.describe(`lighthouse: ${site.label}`, () => {
    const baseUrl = process.env[site.envKey];

    test.skip(!baseUrl, `${site.envKey} 未設定 → 跳過（範例站尚未部署）`);

    test('首頁 Lighthouse 分數 ≥ 門檻', async ({ page }) => {
      // Lighthouse audit 本身會做 network 量測 + 多次重跑，平均 30-60s
      test.setTimeout(120_000);

      await page.goto(baseUrl!, { waitUntil: 'load' });

      await playAudit({
        page,
        port: 9222,
        thresholds: THRESHOLDS,
        // 預設 desktop config——demo 站客戶多以桌面瀏覽決策，行動端 audit 待 goal-99.8
        config: {
          extends: 'lighthouse:default',
          settings: { formFactor: 'desktop', screenEmulation: { disabled: true } },
        },
      });
    });
  });
}
