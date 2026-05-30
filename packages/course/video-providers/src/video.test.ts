import { generateKeyPairSync, createVerify } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import { BunnyVideoAdapter, type BunnyHttpClient } from './bunny-adapter.js';
import { MuxVideoAdapter, type MuxHttpClient } from './mux-adapter.js';
import { bunnySignToken, muxSignToken } from './signed-url.js';

/** 測試用：產生一組 RSA key pair（2048-bit 太慢，用 1024-bit 純測試）。 */
function genRsaKeys(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

/** Base64URL → Buffer。 */
function fromBase64Url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

describe('signed-url', () => {
  it('bunnySignToken 同輸入 → 同輸出', () => {
    const exp = new Date('2026-05-15T10:00:00Z');
    const a = bunnySignToken({ securityKey: 'k', videoId: 'v', expiresAt: exp });
    const b = bunnySignToken({ securityKey: 'k', videoId: 'v', expiresAt: exp });
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });
  it('bunnySignToken viewerIp 不同 → 不同 token', () => {
    const exp = new Date();
    const a = bunnySignToken({ securityKey: 'k', videoId: 'v', expiresAt: exp, viewerIp: '1.1.1.1' });
    const b = bunnySignToken({ securityKey: 'k', videoId: 'v', expiresAt: exp, viewerIp: '2.2.2.2' });
    expect(a).not.toBe(b);
  });
  it('muxSignToken 簽出可被公鑰驗證的 RS256 JWT', () => {
    const { publicKey, privateKey } = genRsaKeys();
    const expiresAt = new Date('2026-12-31T00:00:00Z');
    const token = muxSignToken({
      keyId: 'kid-1',
      privateKeyPem: privateKey,
      playbackId: 'pb-1',
      expiresAt,
      viewerId: 'u1',
    });
    const [h, p, s] = token.split('.');
    expect(h && p && s).toBeTruthy();
    const header = JSON.parse(fromBase64Url(h!).toString('utf8')) as {
      alg: string; kid: string; typ: string;
    };
    expect(header.alg).toBe('RS256');
    expect(header.kid).toBe('kid-1');
    const payload = JSON.parse(fromBase64Url(p!).toString('utf8')) as {
      sub: string; aud: string; exp: number; customer_id?: string;
    };
    expect(payload.sub).toBe('pb-1');
    expect(payload.aud).toBe('v');
    expect(payload.exp).toBe(Math.floor(expiresAt.getTime() / 1000));
    expect(payload.customer_id).toBe('u1');
    const verifier = createVerify('RSA-SHA256');
    verifier.update(`${h}.${p}`);
    expect(verifier.verify(publicKey, fromBase64Url(s!))).toBe(true);
  });

  it('muxSignToken 不同 viewerId → 不同簽章', () => {
    const { privateKey } = genRsaKeys();
    const t1 = muxSignToken({
      keyId: 'k', privateKeyPem: privateKey, playbackId: 'p',
      expiresAt: new Date('2026-12-31T00:00:00Z'), viewerId: 'u1',
    });
    const t2 = muxSignToken({
      keyId: 'k', privateKeyPem: privateKey, playbackId: 'p',
      expiresAt: new Date('2026-12-31T00:00:00Z'), viewerId: 'u2',
    });
    expect(t1).not.toBe(t2);
  });
});

describe('BunnyVideoAdapter', () => {
  function makeAdapter() {
    const calls: Array<{ method: string; path: string; body?: unknown }> = [];
    const request = vi.fn(
      async <T = unknown>(input: { method: string; path: string; body?: unknown }): Promise<T> => {
        calls.push(input);
        if (input.path.endsWith('/videos') && input.method === 'POST') {
          return { guid: 'vid-1' } as T;
        }
        if (input.path.endsWith('/statistics')) {
          return { viewCount: 100, totalWatchTime: 30000, averageWatchTime: 500, length: 600 } as T;
        }
        if (input.method === 'GET' && input.path.includes('/videos/')) {
          return {
            guid: 'vid-1',
            title: 'T',
            status: 4,
            length: 600,
            thumbnailFileName: 'thumb.jpg',
            availableResolutions: '720p,1080p',
            dateUploaded: '2026-05-15T10:00:00Z',
          } as T;
        }
        return {} as T;
      },
    );
    const http: BunnyHttpClient = { request: request as unknown as BunnyHttpClient['request'] };
    const adapter = new BunnyVideoAdapter({
      libraryId: 'lib1',
      cdnHostname: 'vz-x.b-cdn.net',
      securityKey: 'sec',
      http,
    });
    return { adapter, http, calls };
  }

  it('upload from URL → 兩次呼叫（create + fetch）', async () => {
    const { adapter, calls } = makeAdapter();
    const r = await adapter.upload({
      source: { kind: 'url', url: 'https://x/v.mp4' },
      title: 'T',
    });
    expect(r.videoId).toBe('vid-1');
    expect(r.status).toBe('processing');
    expect(calls).toHaveLength(2);
    expect(calls[0]?.path).toContain('/videos');
    expect(calls[1]?.path).toContain('/fetch');
  });

  it('getMetadata 解析 status / 解析度', async () => {
    const { adapter } = makeAdapter();
    const m = await adapter.getMetadata('vid-1');
    expect(m.status).toBe('ready');
    expect(m.availableQualities).toEqual(['720p', '1080p']);
    expect(m.durationSeconds).toBe(600);
    expect(m.thumbnailUrl).toContain('vz-x.b-cdn.net');
  });

  it('getPlaybackUrl 含簽名 + expires', async () => {
    const { adapter } = makeAdapter();
    const r = await adapter.getPlaybackUrl({ videoId: 'vid-1', ttlSeconds: 60 });
    expect(r.hlsUrl).toContain('playlist.m3u8');
    expect(r.hlsUrl).toMatch(/token=[0-9a-f]{64}/);
    expect(r.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('getAnalytics 計算完成率', async () => {
    const { adapter } = makeAdapter();
    const a = await adapter.getAnalytics('vid-1');
    expect(a.totalViews).toBe(100);
    expect(a.averageCompletionRate).toBeCloseTo((500 / 600) * 100, 1);
  });

  it('uploadSubtitle + setChapters 呼叫 API', async () => {
    const { adapter, calls } = makeAdapter();
    await adapter.uploadSubtitle('vid-1', { language: 'zh', content: 'srt' });
    await adapter.setChapters('vid-1', [{ startSeconds: 60, title: 'intro' }]);
    expect(calls.some((c) => c.path.endsWith('/captions/zh'))).toBe(true);
    expect(calls.some((c) => c.path.endsWith('/chapters'))).toBe(true);
  });
});

describe('MuxVideoAdapter', () => {
  function makeAdapter() {
    const request = vi.fn(
      async <T = unknown>(input: { method: string; path: string; body?: unknown }): Promise<T> => {
        if (input.path === '/video/v1/assets' && input.method === 'POST') {
          return {
            data: { id: 'asset-1', playback_ids: [{ id: 'pb-1', policy: 'signed' }] },
          } as T;
        }
        if (input.path === '/video/v1/assets/asset-1') {
          return {
            data: {
              id: 'asset-1',
              passthrough: 'T',
              status: 'ready',
              duration: 700,
              max_stored_resolution: '1080p',
              created_at: '1747300800',
              playback_ids: [{ id: 'pb-1' }],
            },
          } as T;
        }
        if (input.path === '/data/v1/video-views/asset-1') {
          return { data: { views: 50, playing_time: 12000, total_views_seconds: 1500 } } as T;
        }
        return {} as T;
      },
    );
    const http: MuxHttpClient = { request: request as unknown as MuxHttpClient['request'] };
    const { privateKey } = genRsaKeys();
    const adapter = new MuxVideoAdapter({
      http,
      signingKeyId: 'kid-1',
      signingPrivateKeyPem: privateKey,
      defaultPolicy: 'signed',
    });
    return { adapter, http };
  }

  it('upload + getMetadata + getPlaybackUrl 串接', async () => {
    const { adapter } = makeAdapter();
    const up = await adapter.upload({
      source: { kind: 'url', url: 'https://x/v.mp4' },
      title: 'T',
    });
    expect(up.videoId).toBe('asset-1');
    const meta = await adapter.getMetadata('asset-1');
    expect(meta.status).toBe('ready');
    expect(meta.availableQualities).toEqual(['240p', '360p', '480p', '720p', '1080p']);
    const r = await adapter.getPlaybackUrl({ videoId: 'asset-1', ttlSeconds: 100, viewerId: 'u1' });
    expect(r.hlsUrl).toContain('stream.mux.com/pb-1');
    expect(r.hlsUrl).toContain('token=');
  });

  it('upload local 不支援 → throw', async () => {
    const { adapter } = makeAdapter();
    await expect(
      adapter.upload({ source: { kind: 'local', path: '/tmp/v' }, title: 'T' }),
    ).rejects.toThrow(/url source/);
  });

  it('getAnalytics 計算', async () => {
    const { adapter } = makeAdapter();
    const a = await adapter.getAnalytics('asset-1');
    expect(a.totalViews).toBe(50);
    expect(a.averageCompletionRate).toBeGreaterThan(0);
  });
});
