import type {
  CreateMeetingInput,
  CreateMeetingResult,
  LiveClassProvider,
  LiveRecording,
  LiveProviderType,
} from './types.js';

/** Zoom HTTP 客戶端（注入式，便於測試 + 切換 OAuth/JWT 模式）。 */
export interface ZoomHttpClient {
  request<T = unknown>(input: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    path: string;
    body?: unknown;
  }): Promise<T>;
}

export interface ZoomAdapterOptions {
  http: ZoomHttpClient;
  /** 主持人 user id（Zoom 帳號 email 或 userId）。 */
  defaultHost?: string;
}

/** Zoom Video Meetings adapter。 */
export class ZoomAdapter implements LiveClassProvider {
  readonly providerType: LiveProviderType = 'zoom';
  constructor(private readonly opts: ZoomAdapterOptions) {}

  async createMeeting(input: CreateMeetingInput): Promise<CreateMeetingResult> {
    const userId = this.opts.defaultHost ?? input.hostUserId;
    const res = await this.opts.http.request<{
      id: number;
      join_url: string;
      start_url: string;
    }>({
      method: 'POST',
      path: `/users/${encodeURIComponent(userId)}/meetings`,
      body: {
        topic: input.title,
        type: 2,
        start_time: input.scheduledAt.toISOString(),
        duration: input.durationMinutes,
        settings: {
          auto_recording: input.enableRecording ? 'cloud' : 'none',
          waiting_room: true,
          join_before_host: false,
        },
      },
    });
    return {
      externalId: String(res.id),
      joinUrl: res.join_url,
      startUrl: res.start_url,
    };
  }

  async endMeeting(externalId: string): Promise<void> {
    await this.opts.http.request({
      method: 'PUT',
      path: `/meetings/${externalId}/status`,
      body: { action: 'end' },
    });
  }

  async fetchRecordings(externalId: string): Promise<LiveRecording[]> {
    const res = await this.opts.http.request<{
      recording_files?: Array<{
        play_url?: string;
        download_url?: string;
        recording_start: string;
        recording_end: string;
        file_type?: string;
      }>;
    }>({ method: 'GET', path: `/meetings/${externalId}/recordings` });
    const files = res.recording_files ?? [];
    return files
      .filter((f) => f.file_type === 'MP4' || !f.file_type)
      .map((f) => {
        const start = new Date(f.recording_start);
        const end = new Date(f.recording_end);
        return {
          url: f.download_url ?? f.play_url ?? '',
          durationSeconds: Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000)),
          recordedAt: start,
        };
      })
      .filter((r) => r.url);
  }
}
