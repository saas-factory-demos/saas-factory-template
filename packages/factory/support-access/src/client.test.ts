import { describe, expect, it } from 'vitest';

import {
  SUPPORT_ACCESS_BASE_PATH,
  SUPPORT_ACCESS_HEADERS,
  createSupportAccessClient,
} from './client.js';

const SECRET = '0123456789abcdef0123456789abcdef'; // 32 chars
const SITE = 'https://demo-shop.vercel.app';

/** 建立一個會記錄呼叫並回傳指定 Response 的假 fetch。 */
function makeFetch(make: () => Response): {
  fetchImpl: typeof fetch;
  calls: Array<{ url: string; init: RequestInit }>;
} {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), init: init ?? {} });
    return make();
  };
  return { fetchImpl, calls };
}

describe('createSupportAccessClient', () => {
  it('secret 太短 → throw', () => {
    expect(() => createSupportAccessClient('short')).toThrow(/>= 32/);
  });

  it('provision 正確發出 POST + 帶 HMAC headers', async () => {
    const { fetchImpl, calls } = makeFetch(
      () =>
        new Response(
          JSON.stringify({ ok: true, initialPassword: 'P@ss123!', alreadyProvisioned: false }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
    );
    const client = createSupportAccessClient(SECRET, { fetchImpl, nowSeconds: () => 1_700_000_000 });
    const res = await client.provision({
      siteUrl: SITE,
      email: 'support+demo@example.com',
      actorEmail: 'me@example.com',
    });
    expect(res).toEqual({ ok: true, initialPassword: 'P@ss123!', alreadyProvisioned: false });
    expect(calls).toHaveLength(1);
    const firstCall = calls[0];
    if (!firstCall) throw new Error('fetch 未呼叫');
    expect(firstCall.url).toBe(`${SITE}${SUPPORT_ACCESS_BASE_PATH}/provision`);
    const headers = (firstCall.init.headers ?? {}) as Record<string, string>;
    expect(headers[SUPPORT_ACCESS_HEADERS.TIMESTAMP]).toBe('1700000000');
    expect(headers[SUPPORT_ACCESS_HEADERS.SIGNATURE]).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('rotatePassword 成功回傳 newPassword', async () => {
    const { fetchImpl } = makeFetch(
      () =>
        new Response(JSON.stringify({ ok: true, newPassword: 'NewP@ss!' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    );
    const client = createSupportAccessClient(SECRET, { fetchImpl });
    const res = await client.rotatePassword({
      siteUrl: SITE,
      actorEmail: 'me@example.com',
      reason: '修復結帳',
    });
    expect(res).toEqual({ ok: true, newPassword: 'NewP@ss!' });
  });

  it('server 回 401 + error body → 原樣回傳 error', async () => {
    const { fetchImpl } = makeFetch(
      () =>
        new Response(JSON.stringify({ ok: false, reason: 'hmac-mismatch', message: '簽章不對' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }),
    );
    const client = createSupportAccessClient(SECRET, { fetchImpl });
    const res = await client.status({ siteUrl: SITE, actorEmail: 'me@example.com' });
    expect(res).toEqual({ ok: false, reason: 'hmac-mismatch', message: '簽章不對' });
  });

  it('fetch throw → 回 internal-error', async () => {
    const fetchImpl: typeof fetch = async () => {
      throw new Error('ECONNREFUSED');
    };
    const client = createSupportAccessClient(SECRET, { fetchImpl });
    const res = await client.disable({
      siteUrl: SITE,
      actorEmail: 'me@example.com',
      reason: '客戶請求',
    });
    expect(res).toEqual({ ok: false, reason: 'internal-error', message: 'ECONNREFUSED' });
  });

  it('auditLog 帶分頁 + filterAction 參數，正確回傳 entries / nextCursor', async () => {
    const { fetchImpl, calls } = makeFetch(
      () =>
        new Response(
          JSON.stringify({
            ok: true,
            entries: [
              {
                action: 'rotate-password',
                actorEmail: 'ops@example.com',
                payloadSummary: '季度 rotate',
                timestamp: '2026-06-01T00:00:00.000Z',
              },
            ],
            nextCursor: '2026-05-15T00:00:00.000Z',
            totalEstimate: 42,
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
    );
    const client = createSupportAccessClient(SECRET, { fetchImpl });
    const res = await client.auditLog({
      siteUrl: SITE,
      actorEmail: 'me@example.com',
      limit: 20,
      filterAction: 'rotate-password',
    });
    expect(res).toMatchObject({
      ok: true,
      entries: [{ action: 'rotate-password', actorEmail: 'ops@example.com' }],
      nextCursor: '2026-05-15T00:00:00.000Z',
      totalEstimate: 42,
    });
    const firstCall = calls[0];
    if (!firstCall) throw new Error('fetch 未呼叫');
    expect(firstCall.url).toBe(`${SITE}${SUPPORT_ACCESS_BASE_PATH}/audit-log`);
    const sentBody = JSON.parse((firstCall.init.body ?? '{}') as string) as {
      limit: number;
      filterAction: string;
    };
    expect(sentBody.limit).toBe(20);
    expect(sentBody.filterAction).toBe('rotate-password');
  });

  it('server 回非 JSON → 回 internal-error', async () => {
    const { fetchImpl } = makeFetch(
      () =>
        new Response('<html>500</html>', {
          status: 500,
          headers: { 'content-type': 'text/html' },
        }),
    );
    const client = createSupportAccessClient(SECRET, { fetchImpl });
    const res = await client.enable({
      siteUrl: SITE,
      actorEmail: 'me@example.com',
      reason: '恢復服務',
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe('internal-error');
      expect(res.message).toMatch(/JSON/);
    }
  });
});
