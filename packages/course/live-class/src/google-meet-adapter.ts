import type {
  CreateMeetingInput,
  CreateMeetingResult,
  LiveClassProvider,
  LiveRecording,
  LiveProviderType,
} from './types.js';

/** Google Calendar / Meet HTTP 客戶端介面。 */
export interface GoogleMeetHttpClient {
  request<T = unknown>(input: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    path: string;
    body?: unknown;
  }): Promise<T>;
}

export interface GoogleMeetAdapterOptions {
  http: GoogleMeetHttpClient;
  /** 預設掛在哪個 Calendar（一般是主持人的主行事曆 = 'primary'）。 */
  calendarId?: string;
}

/**
 * Google Meet adapter。
 *
 * 透過 Google Calendar Events API 建立帶 conferenceData 的活動以產生 Meet 連結。
 * 錄影屬於 Google Workspace 企業版功能且需另外取得 Drive 權限，本 adapter 預設不抓錄影。
 */
export class GoogleMeetAdapter implements LiveClassProvider {
  readonly providerType: LiveProviderType = 'google-meet';
  constructor(private readonly opts: GoogleMeetAdapterOptions) {}

  async createMeeting(input: CreateMeetingInput): Promise<CreateMeetingResult> {
    const calendarId = this.opts.calendarId ?? 'primary';
    const startISO = input.scheduledAt.toISOString();
    const endISO = new Date(
      input.scheduledAt.getTime() + input.durationMinutes * 60_000,
    ).toISOString();
    const res = await this.opts.http.request<{
      id: string;
      hangoutLink?: string;
      conferenceData?: { entryPoints?: Array<{ uri?: string }> };
    }>({
      method: 'POST',
      path: `/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
      body: {
        summary: input.title,
        start: { dateTime: startISO },
        end: { dateTime: endISO },
        conferenceData: {
          createRequest: {
            requestId: `live-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });
    const joinUrl =
      res.hangoutLink ?? res.conferenceData?.entryPoints?.[0]?.uri ?? '';
    if (!joinUrl) throw new Error('Google Meet 建立後未取得 join URL');
    return { externalId: res.id, joinUrl };
  }

  async endMeeting(externalId: string): Promise<void> {
    // Google Meet 沒有「結束」API；直接從 Calendar 刪除事件代表「取消這場」。
    const calendarId = this.opts.calendarId ?? 'primary';
    await this.opts.http.request({
      method: 'DELETE',
      path: `/calendars/${encodeURIComponent(calendarId)}/events/${externalId}`,
    });
  }

  async fetchRecordings(_externalId: string): Promise<LiveRecording[]> {
    // 預設不抓 Google Drive 錄影；需自行整合 Drive API 後外部回填。
    return [];
  }
}
