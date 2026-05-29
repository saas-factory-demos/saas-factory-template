import { muxSignToken } from './signed-url.js';

import type {
  VideoAnalytics,
  VideoChapter,
  VideoMetadata,
  VideoPlaybackInput,
  VideoPlaybackResult,
  VideoProvider,
  VideoQuality,
  VideoSubtitle,
  VideoUploadInput,
  VideoUploadResult,
} from './types.js';

export interface MuxHttpClient {
  request<T = unknown>(input: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    body?: unknown;
  }): Promise<T>;
}

export interface MuxAdapterOptions {
  /** Mux Token ID + Secret 由 http client 注入處理。 */
  http: MuxHttpClient;
  /** 簽 URL 用的 signing key id（Mux dashboard 產生的 kid）。 */
  signingKeyId: string;
  /** RSA 私鑰（PEM）。Mux 官方僅支援 RS256，必填。 */
  signingPrivateKeyPem: string;
  /** 預設 playback policy。 */
  defaultPolicy?: 'public' | 'signed';
}

/** Mux Video provider 實作。 */
export class MuxVideoAdapter implements VideoProvider {
  readonly name = 'mux' as const;
  private readonly opts: MuxAdapterOptions;
  /** 內部記錄 assetId → playbackId（避免每次 getPlaybackUrl 都打 API）。 */
  private readonly playbackIdCache = new Map<string, string>();

  constructor(options: MuxAdapterOptions) {
    this.opts = options;
  }

  async upload(input: VideoUploadInput): Promise<VideoUploadResult> {
    if (input.source.kind !== 'url') {
      throw new Error('Mux 目前只支援 url source（透過 direct upload 走另一個 API）');
    }
    const created = await this.opts.http.request<{
      data: {
        id: string;
        playback_ids: Array<{ id: string; policy: 'public' | 'signed' }>;
      };
    }>({
      method: 'POST',
      path: '/video/v1/assets',
      body: {
        input: [{ url: input.source.url }],
        playback_policy: [this.opts.defaultPolicy ?? 'signed'],
        passthrough: input.title,
      },
    });
    const pb = created.data.playback_ids[0];
    if (pb) this.playbackIdCache.set(created.data.id, pb.id);
    return { videoId: created.data.id, status: 'processing' };
  }

  async getMetadata(videoId: string): Promise<VideoMetadata> {
    const data = await this.opts.http.request<{
      data: {
        id: string;
        passthrough?: string;
        status: 'preparing' | 'ready' | 'errored';
        duration?: number;
        max_stored_resolution?: string;
        created_at: string;
        playback_ids: Array<{ id: string }>;
      };
    }>({ method: 'GET', path: `/video/v1/assets/${videoId}` });
    const pb = data.data.playback_ids[0];
    if (pb) this.playbackIdCache.set(videoId, pb.id);
    return {
      videoId: data.data.id,
      title: data.data.passthrough ?? videoId,
      status: muxStatusToStatus(data.data.status),
      durationSeconds: data.data.duration ?? 0,
      availableQualities: maxResolutionToList(data.data.max_stored_resolution),
      thumbnailUrl: pb ? `https://image.mux.com/${pb.id}/thumbnail.jpg` : undefined,
      createdAt: new Date(Number(data.data.created_at) * 1000),
    };
  }

  async delete(videoId: string): Promise<void> {
    await this.opts.http.request({ method: 'DELETE', path: `/video/v1/assets/${videoId}` });
    this.playbackIdCache.delete(videoId);
  }

  async getPlaybackUrl(input: VideoPlaybackInput): Promise<VideoPlaybackResult> {
    const playbackId = this.playbackIdCache.get(input.videoId) ?? (await this.resolvePlaybackId(input.videoId));
    const ttl = input.ttlSeconds ?? 3600;
    const expiresAt = new Date(Date.now() + ttl * 1000);
    const token = muxSignToken({
      keyId: this.opts.signingKeyId,
      privateKeyPem: this.opts.signingPrivateKeyPem,
      playbackId,
      expiresAt,
      viewerId: input.viewerId,
    });
    return {
      hlsUrl: `https://stream.mux.com/${playbackId}.m3u8?token=${token}`,
      thumbnailUrl: `https://image.mux.com/${playbackId}/thumbnail.jpg?token=${token}`,
      expiresAt,
    };
  }

  async uploadSubtitle(videoId: string, subtitle: VideoSubtitle): Promise<void> {
    await this.opts.http.request({
      method: 'POST',
      path: `/video/v1/assets/${videoId}/tracks`,
      body: {
        type: 'text',
        text_type: 'subtitles',
        language_code: subtitle.language,
        closed_captions: false,
        passthrough: subtitle.content,
      },
    });
  }

  async setChapters(videoId: string, chapters: VideoChapter[]): Promise<void> {
    // Mux 沒原生章節，使用 passthrough metadata 紀錄（或客戶端 chapters track）
    await this.opts.http.request({
      method: 'PATCH' as 'PUT',
      path: `/video/v1/assets/${videoId}`,
      body: {
        passthrough: JSON.stringify({ chapters }),
      },
    });
  }

  async getAnalytics(videoId: string): Promise<VideoAnalytics> {
    const data = await this.opts.http.request<{
      data: { views: number; playing_time: number; total_views_seconds: number };
    }>({ method: 'GET', path: `/data/v1/video-views/${videoId}` });
    return {
      videoId,
      totalViews: data.data.views,
      totalWatchTime: data.data.playing_time,
      averageCompletionRate:
        data.data.views > 0
          ? Math.min(100, (data.data.total_views_seconds / (data.data.views * 60)) * 100)
          : 0,
    };
  }

  private async resolvePlaybackId(videoId: string): Promise<string> {
    const meta = await this.opts.http.request<{
      data: { playback_ids: Array<{ id: string }> };
    }>({ method: 'GET', path: `/video/v1/assets/${videoId}` });
    const pb = meta.data.playback_ids[0];
    if (!pb) throw new Error(`Mux asset 無 playback id：${videoId}`);
    this.playbackIdCache.set(videoId, pb.id);
    return pb.id;
  }
}

function muxStatusToStatus(s: 'preparing' | 'ready' | 'errored'): VideoMetadata['status'] {
  if (s === 'ready') return 'ready';
  if (s === 'errored') return 'failed';
  return 'processing';
}

function maxResolutionToList(s: string | undefined): VideoQuality[] {
  if (!s) return [];
  const order: VideoQuality[] = ['240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'];
  const idx = order.findIndex((q) => q === s);
  if (idx < 0) return [];
  return order.slice(0, idx + 1);
}
