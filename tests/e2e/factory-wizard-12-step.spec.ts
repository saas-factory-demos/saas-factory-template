import { expect, test } from '@playwright/test';

/**
 * Wizard 12 步 happy path：supplement → organic-wellness preset。
 *
 * 策略：pre-seed localStorage 草稿（完整且通過 zod 的 FormState），mount 後
 * wizard restore 草稿，逐步 click「下一步」走完 12 步，最後驗收「啟動生成」
 * 出現。**不點啟動生成**——/api/wizard 需 FACTORY_ADMIN_TOKEN，UI 自己沒帶；
 * 真實送出留給整合測試（goal-99.7）。
 *
 * 此 spec 焦點：UI 步驟編排 + 各步 zod schema 不擋已知 valid 資料。
 */

const DRAFT_KEY = 'saas-factory:wizard-draft';

/** 完整 valid FormState：通過 wizardOutputSchema。 */
function seedFormState() {
  return {
    client: {
      clientName: '範例保健公司',
      brandName: 'WellVita',
      contactEmail: 'owner@wellvita.example',
      contactPhone: '0912345678',
      subdomain: 'wellvita',
    },
    industry: 'supplement',
    siteTypes: { enabled: ['shop', 'lp'], lpCount: 2 },
    /* 留空 → wizard goNext 從 step 2 → 3 時用 defaultEnabledModules() 帶入合法 slug。 */
    modules: { enabled: [] },
    integrations: {
      payments: ['newebpay'],
      shipping: ['tcat', 'seven-eleven'],
      invoice: { providers: ['ezpay'], mode: 'realtime' },
      notifications: ['email', 'line'],
    },
    theme: {
      presetId: 'organic-wellness',
      primaryColor: '#2f6b4f',
      accentColor: '#f59e0b',
      radius: 'soft',
      font: 'sans',
      density: 'normal',
      darkMode: 'light',
      motionLevel: 3,
    },
    frontend: {
      pages: [],
      effects: { spotlight: false, magneticCTA: false, parallax: false, meshGradient: false },
      aiCopy: { enabled: false },
    },
    blocks: [],
    i18n: {
      defaultLocale: 'zh-TW',
      enabledLocales: ['zh-TW'],
      multiCurrency: false,
      multiTimezone: false,
    },
    deploy: {
      target: 'vercel',
      repoName: 'wellvita-site',
      environments: ['staging', 'production'],
    },
  };
}

test.describe('Wizard 12 步 happy path（supplement → organic-wellness）', () => {
  test.beforeEach(async ({ context }) => {
    /* mount 前先在 origin 上塞草稿 envelope（draft-storage.ts 預期格式）。 */
    await context.addInitScript(
      ([key, payload]) => {
        const env = {
          version: 1,
          savedAt: new Date().toISOString(),
          data: payload,
        };
        try {
          window.localStorage.setItem(key as string, JSON.stringify(env));
        } catch {
          /* 無痕模式 silent fail，測試環境正常 */
        }
      },
      [DRAFT_KEY, seedFormState()] as const,
    );
  });

  test('草稿還原後可逐步前進到 Review，啟動生成按鈕出現', async ({ page }) => {
    await page.goto('/new');

    /* 草稿還原提示應出現。 */
    await expect(page.getByText('已從上次離開的進度自動還原草稿。')).toBeVisible({ timeout: 5000 });

    /* 走 11 次「下一步」應到達 step 11（Review，0-indexed）。 */
    for (let i = 0; i < 11; i++) {
      const nextBtn = page.getByRole('button', { name: /下一步/ });
      await expect(nextBtn, `step ${i} 應有「下一步」`).toBeEnabled();
      await nextBtn.click();
    }

    /* Review 步驟：啟動生成 button 應出現，且「下一步」不再出現。 */
    await expect(page.getByRole('button', { name: '啟動生成' })).toBeVisible();
    await expect(page.getByRole('button', { name: /下一步/ })).toHaveCount(0);
  });

  test('步驟指示器顯示 12 個 label', async ({ page }) => {
    await page.goto('/new');
    const indicator = page.locator('ol').first();
    await expect(indicator.locator('li')).toHaveCount(12);
  });
});
