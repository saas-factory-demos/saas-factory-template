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
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
