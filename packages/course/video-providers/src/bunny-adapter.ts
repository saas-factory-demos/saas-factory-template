import { bunnySignToken } from './signed-url.js';

import type {
  VideoAnalytics,
  VideoChapter,
  VideoMetadata,
  VideoPlaybackInput,
  VideoPlaybackResult,
  VideoProvider,
  VideoSubtitle,
  VideoUploadInput,
  VideoUploadResult,
} from './types.js';

/** Bunny Stream HTTP 客戶端介面（注入式以便測試）。 */
export interface BunnyHttpClient {
  request<T = unknown>(input: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    body?: unknown;
  }): Promise<T>;
}

export interface BunnyAdapterOptions {
  /** Bunny Stream Library ID。 */
  libraryId: string;
  /** Bunny CDN hostname（例：vz-xxxx.b-cdn.net）。 */
  cdnHostname: string;
  /** Token Security Key（防盜鏈簽名用）。 */
  securityKey: string;
  /** HTTP 客戶端。 */
  http: BunnyHttpClient;
}

/** Bunny.net Stream 影片 provider 實作。 */
export class BunnyVideoAdapter implements VideoProvider {
  readonly name = 'bunny' as const;
  private readonly opts: BunnyAdapterOptions;

  constructor(options: BunnyAdapterOptions) {
    this.opts = options;
  }

  async upload(input: VideoUploadInput): Promise<VideoUploadResult> {
    const created = await this.opts.http.request<{ guid: string }>({
      method: 'POST',
      path: `/library/${this.opts.libraryId}/videos`,
      body: { title: input.title },
    });
    if (input.source.kind === 'url') {
      await this.opts.http.request({
        method: 'POST',
        path: `/library/${this.opts.libraryId}/videos/${created.guid}/fetch`,
        body: { url: input.source.url },
      });
    }
    return { videoId: created.guid, status: 'processing' };
  }

  async getMetadata(videoId: string): Promise<VideoMetadata> {
    const data = await this.opts.http.request<{
      guid: string;
      title: string;
      status: number;
      length: number;
      thumbnailFileName?: string;
      availableResolutions: string;
      dateUploaded: string;
    }>({
      method: 'GET',
      path: `/library/${this.opts.libraryId}/videos/${videoId}`,
    });
    return {
      videoId: data.guid,
      title: data.title,
      status: bunnyStatusToStatus(data.status),
      durationSeconds: data.length,
      availableQualities: parseBunnyResolutions(data.availableResolutions),
      thumbnailUrl: data.thumbnailFileName
        ? `https://${this.opts.cdnHostname}/${data.guid}/${data.thumbnailFileName}`
        : undefined,
      createdAt: new Date(data.dateUploaded),
    };
  }

  async delete(videoId: string): Promise<void> {
    await this.opts.http.request({
      method: 'DELETE',
      path: `/library/${this.opts.libraryId}/videos/${videoId}`,
    });
  }

  async getPlaybackUrl(input: VideoPlaybackInput): Promise<VideoPlaybackResult> {
    const ttl = input.ttlSeconds ?? 3600;
    const expiresAt = new Date(Date.now() + ttl * 1000);
    const token = bunnySignToken({
      securityKey: this.opts.securityKey,
      videoId: input.videoId,
      expiresAt,
      viewerIp: input.viewerIp,
    });
    const expiresUnix = Math.floor(expiresAt.getTime() / 1000);
    return {
      hlsUrl: `https://${this.opts.cdnHostname}/${input.videoId}/playlist.m3u8?token=${token}&expires=${expiresUnix}`,
      thumbnailUrl: `https://${this.opts.cdnHostname}/${input.videoId}/thumbnail.jpg`,
      expiresAt,
    };
  }

  async uploadSubtitle(videoId: string, subtitle: VideoSubtitle): Promise<void> {
    await this.opts.http.request({
      method: 'POST',
      path: `/library/${this.opts.libraryId}/videos/${videoId}/captions/${subtitle.language}`,
      body: { srclang: subtitle.language, label: subtitle.language, captionsFile: subtitle.content },
    });
  }

  async setChapters(videoId: string, chapters: VideoChapter[]): Promise<void> {
    await this.opts.http.request({
      method: 'POST',
      path: `/library/${this.opts.libraryId}/videos/${videoId}/chapters`,
      body: {
        chapters: chapters.map((c) => ({ title: c.title, start: c.startSeconds })),
      },
    });
  }

  async getAnalytics(videoId: string): Promise<VideoAnalytics> {
    const data = await this.opts.http.request<{
      viewCount: number;
      totalWatchTime: number;
      averageWatchTime: number;
      length: number;
    }>({
      method: 'GET',
      path: `/library/${this.opts.libraryId}/videos/${videoId}/statistics`,
    });
    return {
      videoId,
      totalViews: data.viewCount,
      totalWatchTime: data.totalWatchTime,
      averageCompletionRate:
        data.length > 0 ? Math.min(100, (data.averageWatchTime / data.length) * 100) : 0,
    };
  }
}

function bunnyStatusToStatus(status: number): VideoMetadata['status'] {
  // Bunny status：0=Created, 1=Uploaded, 2=Processing, 3=Transcoding, 4=Finished, 5=Error
  if (status === 4) return 'ready';
  if (status === 5) return 'failed';
  if (status === 0 || status === 1) return 'uploading';
  return 'processing';
}

function parseBunnyResolutions(s: string): VideoMetadata['availableQualities'] {
  if (!s) return [];
  return s
    .split(',')
    .map((x) => x.trim())
    .filter((x): x is VideoMetadata['availableQualities'][number] =>
      ['240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'].includes(x),
    );
}
