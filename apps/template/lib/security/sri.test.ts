import { describe, expect, it } from 'vitest';

import { computeSriHash, fetchAndHashSri } from './sri.js';

describe('computeSriHash', () => {
  it('產出 sha384- 前綴的 base64 字串', () => {
    const hash = computeSriHash('hello world');
    expect(hash.startsWith('sha384-')).toBe(true);
    expect(hash.length).toBeGreaterThan('sha384-'.length);
  });

  it('相同內容產出相同 hash（決定性）', () => {
    expect(computeSriHash('foo')).toBe(computeSriHash('foo'));
  });

  it('不同內容產出不同 hash', () => {
    expect(computeSriHash('foo')).not.toBe(computeSriHash('bar'));
  });

  it('支援 Buffer 輸入', () => {
    const a = computeSriHash('hello');
    const b = computeSriHash(Buffer.from('hello', 'utf8'));
    expect(a).toBe(b);
  });

  it('sha384 base64 為 64 字元（不含 prefix）', () => {
    const hash = computeSriHash('any content');
    const base64 = hash.replace('sha384-', '');
    expect(base64).toHaveLength(64);
  });
});

describe('fetchAndHashSri', () => {
  const originalFetch = globalThis.fetch;

  it('成功抓檔後計算 hash', async () => {
    globalThis.fetch = (async () =>
      new Response('console.log("test")', { status: 200 })) as typeof fetch;
    const hash = await fetchAndHashSri('https://example.com/lib.js');
    expect(hash).toBe(computeSriHash('console.log("test")'));
    globalThis.fetch = originalFetch;
  });

  it('非 2xx → throw', async () => {
    globalThis.fetch = (async () => new Response('', { status: 404 })) as typeof fetch;
    await expect(fetchAndHashSri('https://example.com/missing.js')).rejects.toThrow(/404/);
    globalThis.fetch = originalFetch;
  });
});
