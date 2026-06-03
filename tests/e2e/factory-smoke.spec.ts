import { expect, test } from '@playwright/test';

/**
 * Factory app 冒煙測試：首頁可載入、關鍵元素存在、無 JS 例外。
 *
 * 不檢核任何客戶 / 專案資料，只測 shell —— 真實資料測試要等到 99.1 範例站 + DB 接好。
 */

test.describe('Factory app smoke', () => {
  test('homepage 載入並顯示標題與新增按鈕', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    const response = await page.goto('/');
    expect(response?.status(), 'homepage HTTP 狀態').toBeLessThan(400);

    await expect(page.locator('h1')).toContainText('SaaS Factory');
    await expect(page.getByRole('link', { name: /新增客戶專案/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /健康度/ })).toBeVisible();

    expect(consoleErrors, '不應有未捕獲 JS 例外').toEqual([]);
  });

  test('health 頁面載入', async ({ page }) => {
    const response = await page.goto('/health');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();
  });

  test('/new 12 步驟 Wizard 入口存在', async ({ page }) => {
    const response = await page.goto('/new');
    expect(response?.status()).toBeLessThan(400);
    // wizard 第一步應該至少有一個 input 或 form 元素
    const formElements = page.locator('form, input, button').first();
    await expect(formElements).toBeVisible();
  });
});
