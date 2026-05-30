import { expect, test } from '@playwright/test';

/**
 * Factory app 公開 API 測試。
 *
 * 認證 API（/api/wizard、/api/projects 等）在 v1.0 已加 bearer + rate-limit，
 * E2E 暫不打（需注入 FACTORY_BEARER_TOKEN），留待 99.7 後續補。
 */

test.describe('Factory public APIs', () => {
  test('/api/health 回 200 JSON 且 status=ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.app).toBe('factory');
    expect(typeof body.timestamp).toBe('string');
  });

  test('受保護 API 未帶 token 應回 401', async ({ request }) => {
    const res = await request.get('/api/projects');
    expect([401, 403]).toContain(res.status());
  });
});
