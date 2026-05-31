import { describe, expect, it, vi } from 'vitest';

import {
  GeminiImageAdapter,
  ImageBudgetExceededError,
  ImageBudgetTracker,
  ImageGenAPIError,
  MockImageGenAdapter,
  NoImageReturnedError,
  OpenAIImageAdapter,
  createImageGenAdapter,
  generateBestImage,
} from '../index.js';

import type { ImageGenRequest } from '../index.js';

const REQ: ImageGenRequest = { prompt: '招牌料理', aspectRatio: '16:9', count: 3 };

/** 造一個回固定 Response 的 fetch mock。 */
function mockFetch(handler: (url: string, init?: RequestInit) => Response): typeof fetch {
  return vi.fn((input: string | URL | Request, init?: RequestInit) =>
    Promise.resolve(handler(String(input), init)),
  ) as unknown as typeof fetch;
}

describe('MockImageGenAdapter', () => {
  it('回 count 張、零成本、尺寸對齊長寬比', async () => {
    const adapter = new MockImageGenAdapter();
    const out = await adapter.generate(REQ);
    expect(out).toHaveLength(3);
    expect(out[0]?.width).toBe(1600);
    expect(out[0]?.height).toBe(900);
    expect(adapter.estimateCostUsd(REQ)).toBe(0);
    // byte 數遞增（curator 可區分）
    expect(out[2]!.b64.length).toBeGreaterThan(out[0]!.b64.length);
  });
});

describe('OpenAIImageAdapter', () => {
  it('成功：解析 data[].b64_json → ImageGenResult', async () => {
    const fetchImpl = mockFetch(
      () =>
        new Response(
          JSON.stringify({ data: [{ b64_json: 'QUJD', revised_prompt: 'r' }, { b64_json: 'REVG' }] }),
          { status: 200 },
        ),
    );
    const adapter = new OpenAIImageAdapter({ apiKey: 'k', fetchImpl });
    const out = await adapter.generate(REQ);
    expect(out).toHaveLength(2);
    expect(out[0]?.b64).toBe('QUJD');
    expect(out[0]?.model).toBe('gpt-image-2');
    expect(out[0]?.costUsd).toBeGreaterThan(0);
    expect(out[0]?.revisedPrompt).toBe('r');
  });

  it('非 2xx → ImageGenAPIError 含 status', async () => {
    const fetchImpl = mockFetch(() => new Response('bad', { status: 429 }));
    const adapter = new OpenAIImageAdapter({ apiKey: 'k', fetchImpl });
    await expect(adapter.generate(REQ)).rejects.toMatchObject({ status: 429 });
    await expect(adapter.generate(REQ)).rejects.toBeInstanceOf(ImageGenAPIError);
  });

  it('2xx 但 data 無 b64 → NoImageReturnedError', async () => {
    const fetchImpl = mockFetch(() => new Response(JSON.stringify({ data: [{}] }), { status: 200 }));
    const adapter = new OpenAIImageAdapter({ apiKey: 'k', fetchImpl });
    await expect(adapter.generate(REQ)).rejects.toBeInstanceOf(NoImageReturnedError);
  });

  it('env OPENAI_IMAGE_MODEL 覆寫 model', () => {
    const adapter = new OpenAIImageAdapter({ apiKey: 'k', model: 'gpt-image-9' });
    expect(adapter.model).toBe('gpt-image-9');
  });
});

describe('GeminiImageAdapter', () => {
  it('成功：並發 N 次、各取 inlineData → count 張', async () => {
    const fetchImpl = mockFetch(
      () =>
        new Response(
          JSON.stringify({
            candidates: [
              { content: { parts: [{ text: 'desc' }, { inlineData: { mimeType: 'image/png', data: 'SU1H' } }] } },
            ],
          }),
          { status: 200 },
        ),
    );
    const adapter = new GeminiImageAdapter({ apiKey: 'k', fetchImpl });
    const out = await adapter.generate(REQ);
    expect(out).toHaveLength(3);
    expect(out[0]?.b64).toBe('SU1H');
    expect(out[0]?.model).toBe('gemini-3.1-flash-image-preview');
    // 並發呼叫 3 次
    expect((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(3);
  });

  it('非 2xx → ImageGenAPIError', async () => {
    const fetchImpl = mockFetch(() => new Response('err', { status: 500 }));
    const adapter = new GeminiImageAdapter({ apiKey: 'k', fetchImpl });
    await expect(adapter.generate(REQ)).rejects.toBeInstanceOf(ImageGenAPIError);
  });

  it('candidates 無 inlineData → NoImageReturnedError', async () => {
    const fetchImpl = mockFetch(
      () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'x' }] } }] }), { status: 200 }),
    );
    const adapter = new GeminiImageAdapter({ apiKey: 'k', fetchImpl });
    await expect(adapter.generate(REQ)).rejects.toBeInstanceOf(NoImageReturnedError);
  });
});

describe('createImageGenAdapter', () => {
  it('預設（無 env / 無指定）→ mock', () => {
    const adapter = createImageGenAdapter();
    expect(adapter.provider).toBe('mock');
  });

  it('指定 provider 切換 + 未知 provider throw', () => {
    expect(createImageGenAdapter({ provider: 'openai', apiKey: 'k' }).provider).toBe('openai');
    expect(createImageGenAdapter({ provider: 'gemini', apiKey: 'k' }).provider).toBe('gemini');
    // @ts-expect-error 故意傳未知 provider 測 throw 分支
    expect(() => createImageGenAdapter({ provider: 'midjourney' })).toThrow(/未知/);
  });
});

describe('generateBestImage', () => {
  it('best-of-N：挑最佳 + 預算內累計成本', async () => {
    const adapter = new MockImageGenAdapter();
    const budget = new ImageBudgetTracker({ maxUsd: 1 });
    const { best, candidates, totalCostUsd } = await generateBestImage(adapter, REQ, { budget });
    expect(candidates).toHaveLength(3);
    // mock byte 遞增 → 最後一張最佳
    expect(best.b64).toBe(candidates[2]?.b64);
    expect(totalCostUsd).toBe(0);
  });

  it('呼叫前超預算 → throw、不呼叫 adapter', async () => {
    const adapter = new OpenAIImageAdapter({ apiKey: 'k', fetchImpl: mockFetch(() => new Response('{}')) });
    const budget = new ImageBudgetTracker({ maxUsd: 0.01 });
    await expect(generateBestImage(adapter, REQ, { budget })).rejects.toBeInstanceOf(
      ImageBudgetExceededError,
    );
  });
});
