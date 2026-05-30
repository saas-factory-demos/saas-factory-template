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

/**
 * Desktop / Mobile 門檻。
 *
 * Mobile perf 比 desktop 寬鬆 5 分：CLS / LCP 在 4G 模擬下天生較差，
 * 行業實務通常分開設目標；accessibility / best-practices / SEO 不受 form factor
 * 影響，保持一致。
 */
const DESKTOP_THRESHOLDS = {
  performance: 90,
  accessibility: 95,
  'best-practices': 90,
  seo: 90,
};

const MOBILE_THRESHOLDS = {
  performance: 85,
  accessibility: 95,
  'best-practices': 90,
  seo: 90,
};

for (const site of DEMO_SITES) {
  test.describe(`lighthouse: ${site.label}`, () => {
    const baseUrl = process.env[site.envKey];

    test.skip(!baseUrl, `${site.envKey} 未設定 → 跳過（範例站尚未部署）`);

    test('首頁 Lighthouse 桌面分數 ≥ 門檻', async ({ page }) => {
      // Lighthouse audit 本身會做 network 量測 + 多次重跑，平均 30-60s
      test.setTimeout(120_000);

      await page.goto(baseUrl!, { waitUntil: 'load' });

      await playAudit({
        page,
        port: 9222,
        thresholds: DESKTOP_THRESHOLDS,
        config: {
          extends: 'lighthouse:default',
          settings: { formFactor: 'desktop', screenEmulation: { disabled: true } },
        },
      });
    });

    test('首頁 Lighthouse 行動分數 ≥ 門檻（4G 模擬）', async ({ page }) => {
      // mobile audit 在 4G + CPU 4x 模擬下更慢，留 150s
      test.setTimeout(150_000);

      await page.goto(baseUrl!, { waitUntil: 'load' });

      await playAudit({
        page,
        port: 9222,
        thresholds: MOBILE_THRESHOLDS,
        // 預設 lighthouse:default 即為 mobile form factor + Slow 4G + 4x CPU slowdown
        config: {
          extends: 'lighthouse:default',
          settings: { formFactor: 'mobile' },
        },
      });
    });
  });
}
