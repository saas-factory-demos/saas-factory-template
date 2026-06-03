import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 設定。
 *
 * - **CI 中**：`E2E_BASE_URL` 由 `preview-deploy.yml` 注入（Vercel preview URL）
 * - **本機**：未設 `E2E_BASE_URL` 則回退 `http://localhost:3000`，搭配 `pnpm --filter @saas-factory/factory dev`
 *
 * 目標：覆蓋 factory app 的關鍵路徑（homepage + health），客戶站 E2E 留待 99.1
 * 五個範例站實機部署後另起 spec。
 */
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      // lighthouse 專用 spec 由獨立 project 跑（需開 remote-debugging-port），這裡排除避免重複跑
      testIgnore: '**/*.lighthouse.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Lighthouse audit 需要 Chrome 開 remote-debugging-port，無法和一般 test 共用 browser context
      // 因此獨立成 project，僅跑 *.lighthouse.spec.ts
      name: 'lighthouse',
      testMatch: '**/*.lighthouse.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: ['--remote-debugging-port=9222'] },
      },
    },
  ],
});
