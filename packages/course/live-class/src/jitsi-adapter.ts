import { createHmac, randomBytes } from 'node:crypto';

import type {
  CreateMeetingInput,
  CreateMeetingResult,
  LiveClassProvider,
  LiveRecording,
  LiveProviderType,
} from './types.js';

export interface JitsiAdapterOptions {
  /** Jitsi 服務 base URL（自架 / 8x8.vc / meet.jit.si）。 */
  baseUrl: string;
  /** Jitsi App ID（簽 JWT 用）。 */
  appId?: string;
  /** 8x8 / JaaS：API key 對應的 secret。 */
  appSecret?: string;
}

/**
 * Jitsi adapter（房間制 / 無真正會議實體）。
 *
 * 沒有 Server-side API，只負責產生 room URL + 可選的 JWT。錄影需要外掛（Jibri）並由外部回填。
 */
export class JitsiAdapter implements LiveClassProvider {
  readonly providerType: LiveProviderType = 'jitsi';
  constructor(private readonly opts: JitsiAdapterOptions) {}

  async createMeeting(input: CreateMeetingInput): Promise<CreateMeetingResult> {
    const room = `course-${randomBytes(8).toString('hex')}`;
    const base = this.opts.baseUrl.replace(/\/$/, '');
    const url = new URL(`${base}/${encodeURIComponent(room)}`);
    if (this.opts.appId && this.opts.appSecret) {
      const token = this.signJwt(room, input.hostUserId, input.scheduledAt, input.durationMinutes);
      url.searchParams.set('jwt', token);
    }
    return { externalId: room, joinUrl: url.toString() };
  }

  async endMeeting(_externalId: string): Promise<void> {
    // 房間制：沒有「結束」概念；後端只要不再發新 JWT 即可。
  }

  async fetchRecordings(_externalId: string): Promise<LiveRecording[]> {
    return [];
  }

  /** 給 Jitsi JaaS 用的最小可行 JWT（HS256）。 */
  private signJwt(
    room: string,
    userId: string,
    scheduledAt: Date,
    durationMinutes: number,
  ): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const exp = Math.floor((scheduledAt.getTime() + durationMinutes * 60_000) / 1000);
    const payload = {
      aud: 'jitsi',
      iss: this.opts.appId,
      sub: 'meet.jitsi',
      room,
      exp,
      context: { user: { id: userId } },
    };
    const enc = (obj: unknown) => base64UrlEncode(JSON.stringify(obj));
    const head = enc(header);
    const body = enc(payload);
    const sig = createHmac('sha256', this.opts.appSecret ?? '')
      .update(`${head}.${body}`)
      .digest();
    return `${head}.${body}.${base64UrlEncode(sig)}`;
  }
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
