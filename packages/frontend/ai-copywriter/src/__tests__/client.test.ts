import { describe, expect, it, vi } from 'vitest';

import { AnthropicClient, generateCopy } from '../client.js';
import { AnthropicAPIError, BudgetExceededError } from '../errors.js';

/** 建一個假的 fetch 回傳 Anthropic 標準 messages 回應結構。 */
function makeFakeFetch(textOutput: string, status = 200): typeof fetch {
  return vi.fn(async () => {
    const body = {
      content: [{ type: 'text', text: textOutput }],
    };
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }) as unknown as typeof fetch;
}

describe('generateCopy', () => {
  it('組出 Anthropic Messages 請求並回傳 text', async () => {
    const fakeFetch = vi.fn(async (input: Request | string | URL, init?: RequestInit) => {
      // 驗證 URL
      const url = typeof input === 'string' ? input : input.toString();
      expect(url).toBe('https://api.anthropic.com/v1/messages');

      // 驗證 headers
      const headers = init?.headers as Record<string, string>;
      expect(headers['x-api-key']).toBe('sk-test-key');
      expect(headers['anthropic-version']).toBe('2023-06-01');

      // 驗證 body 結構
      const parsed = JSON.parse(init?.body as string) as {
        model: string;
        system: string;
        messages: Array<{ role: string; content: string }>;
      };
      expect(parsed.model).toBe('claude-opus-4-6');
      expect(parsed.system).toContain('保健食品');
      expect(parsed.messages[0]?.content).toContain('喔喔牌');

      return new Response(
        JSON.stringify({ content: [{ type: 'text', text: '產出文案 OK' }] }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }) as unknown as typeof fetch;

    const result = await generateCopy({
      industry: 'supplement',
      blockType: 'hero',
      variables: { brandName: '喔喔牌', productName: '葉黃素' },
      apiKey: 'sk-test-key',
      fetchImpl: fakeFetch,
    });
    expect(result).toBe('產出文案 OK');
  });

  it('apiKey 未提供 + env 也沒設定時 throw', async () => {
    const original = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      await expect(
        generateCopy({
          industry: 'supplement',
          blockType: 'hero',
          variables: {},
          fetchImpl: makeFakeFetch('shouldnt reach'),
        }),
      ).rejects.toThrow(/ANTHROPIC_API_KEY/);
    } finally {
      if (original !== undefined) {
        process.env.ANTHROPIC_API_KEY = original;
      }
    }
  });

  it('API 回傳非 2xx 時 throw 帶錯誤訊息', async () => {
    const failingFetch = vi.fn(
      async () =>
        new Response('bad request', {
          status: 400,
          headers: { 'content-type': 'text/plain' },
        }),
    ) as unknown as typeof fetch;

    await expect(
      generateCopy({
        industry: 'restaurant',
        blockType: 'cta',
        variables: { brandName: '阿明餐館' },
        apiKey: 'sk-test',
        fetchImpl: failingFetch,
      }),
    ).rejects.toThrow(/400/);
  });

  it('content 找不到 text block 時 throw', async () => {
    const weirdFetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ content: [{ type: 'image' }] }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    ) as unknown as typeof fetch;

    await expect(
      generateCopy({
        industry: 'fitness-gym',
        blockType: 'pricing',
        variables: { brandName: '硬派健身' },
        apiKey: 'sk-test',
        fetchImpl: weirdFetch,
      }),
    ).rejects.toThrow(/text block/);
  });

  it('支援自訂 model 參數', async () => {
    const fetchSpy = vi.fn(async (_input: Request | string | URL, init?: RequestInit) => {
      const parsed = JSON.parse(init?.body as string) as { model: string };
      expect(parsed.model).toBe('claude-sonnet-4');
      return new Response(JSON.stringify({ content: [{ type: 'text', text: 'ok' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }) as unknown as typeof fetch;

    await generateCopy({
      industry: 'saas-software',
      blockType: 'hero',
      variables: { brandName: 'TestSaaS' },
      apiKey: 'sk-test',
      model: 'claude-sonnet-4',
      fetchImpl: fetchSpy,
    });
  });
});

describe('AnthropicClient hardening', () => {
  /** 製造一個指定狀態碼 + body 的 fetch（可附 headers）。 */
  function makeFailingFetch(status: number, body: string, headers?: Record<string, string>) {
    return vi.fn(
      async () =>
        new Response(body, {
          status,
          headers: { 'content-type': 'text/plain', ...(headers ?? {}) },
        }),
    ) as unknown as typeof fetch;
  }

  /** 製造一個依序回應的 fetch（第一次 N1，第二次 N2…）。 */
  function makeSequencedFetch(responses: Array<() => Response>) {
    let i = 0;
    return vi.fn(async () => {
      const idx = Math.min(i, responses.length - 1);
      const next = responses[idx];
      i += 1;
      if (!next) {
        throw new Error('sequenced fetch 用盡');
      }
      return next();
    }) as unknown as typeof fetch;
  }

  /** 立即 resolve 的 fake sleep，避免測試卡 setTimeout。 */
  const fastSleep = (): Promise<void> => Promise.resolve();

  it('429 會用 retry-after 重試，最終成功', async () => {
    const sleepCalls: number[] = [];
    const fetchImpl = makeSequencedFetch([
      () =>
        new Response('slow down', {
          status: 429,
          headers: { 'retry-after': '2', 'content-type': 'text/plain' },
        }),
      () =>
        new Response(JSON.stringify({ content: [{ type: 'text', text: 'recovered' }] }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    ]);

    const result = await generateCopy({
      industry: 'restaurant',
      blockType: 'hero',
      variables: { brandName: '老王牛肉麵' },
      apiKey: 'sk-test',
      fetchImpl,
      retry: {
        maxAttempts: 3,
        baseDelayMs: 10,
        sleep: async (ms) => {
          sleepCalls.push(ms);
        },
      },
      rateLimit: false,
    });

    expect(result).toBe('recovered');
    // 第一次重試前應該等 2000ms（retry-after 解析）
    expect(sleepCalls[0]).toBe(2000);
  });

  it('5xx 連續失敗達上限後拋 AnthropicAPIError', async () => {
    const fetchImpl = makeFailingFetch(503, 'upstream gone');

    await expect(
      generateCopy({
        industry: 'fitness-gym',
        blockType: 'cta',
        variables: { brandName: '硬派健身' },
        apiKey: 'sk-test',
        fetchImpl,
        retry: { maxAttempts: 2, baseDelayMs: 1, sleep: fastSleep },
        rateLimit: false,
      }),
    ).rejects.toBeInstanceOf(AnthropicAPIError);

    // 首次 + 2 次重試 = 3 次呼叫
    expect((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(3);
  });

  it('4xx（非 429）不會重試，直接拋 AnthropicAPIError', async () => {
    const fetchImpl = makeFailingFetch(401, 'invalid api key');

    await expect(
      generateCopy({
        industry: 'supplement',
        blockType: 'hero',
        variables: { brandName: '喔喔牌' },
        apiKey: 'sk-test',
        fetchImpl,
        retry: { maxAttempts: 5, baseDelayMs: 1, sleep: fastSleep },
        rateLimit: false,
      }),
    ).rejects.toBeInstanceOf(AnthropicAPIError);

    expect((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
  });

  it('budget guard：預估超過 maxUsd 時直接拋 BudgetExceededError，不打 API', async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const client = new AnthropicClient({
      apiKey: 'sk-test',
      fetchImpl,
      rateLimit: false,
      // 1024 output token * $75/M = $0.0768，遠超 0.0001 上限
      budget: { maxUsd: 0.0001 },
      maxTokens: 1024,
    });

    await expect(
      client.generateCopy({
        industry: 'beauty-skincare',
        blockType: 'hero',
        variables: { brandName: '美麗牌' },
      }),
    ).rejects.toBeInstanceOf(BudgetExceededError);

    expect((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0);
  });

});
