/**
 * OTP 簡訊 provider 抽象（ADR-0010 §2）。
 *
 * - `+886` 號碼走三竹（成本低）
 * - 其他國家走 Twilio
 * - 三竹掛掉時自動 fallback Twilio（並寫 SmsIncidents）
 */

export interface OtpSendParams {
  phone: string;
  code: string;
  /** 簡訊文案模板 id，例：`otp.login` */
  templateId: string;
}

export interface OtpSendResult {
  ok: boolean;
  provider: 'mitake' | 'twilio';
  messageId?: string;
  error?: string;
}

export interface OtpProvider {
  send(params: OtpSendParams): Promise<OtpSendResult>;
}

/**
 * 三竹簡訊 provider 骨架。
 *
 * @remarks
 * 實際 HTTP 串接待 credentials 補齊（pending：見 docs/decisions/_pending-questions.md）。
 */
export class MitakeProvider implements OtpProvider {
  constructor(
    private readonly config: { user: string; password: string },
  ) {}

  async send(_params: OtpSendParams): Promise<OtpSendResult> {
    if (!this.config.user || !this.config.password) {
      return {
        ok: false,
        provider: 'mitake',
        error: 'MITAKE credentials 未設定',
      };
    }
    // TODO: 接三竹 HTTP API（待 credentials）
    return Promise.resolve({
      ok: true,
      provider: 'mitake' as const,
      messageId: `mitake-stub-${Date.now()}`,
    });
  }
}

/**
 * Twilio provider 骨架。
 */
export class TwilioProvider implements OtpProvider {
  constructor(
    private readonly config: {
      accountSid: string;
      authToken: string;
      fromNumber: string;
    },
  ) {}

  async send(_params: OtpSendParams): Promise<OtpSendResult> {
    if (!this.config.accountSid || !this.config.authToken) {
      return {
        ok: false,
        provider: 'twilio',
        error: 'Twilio credentials 未設定',
      };
    }
    // TODO: 接 Twilio SDK（待 credentials）
    return Promise.resolve({
      ok: true,
      provider: 'twilio' as const,
      messageId: `twilio-stub-${Date.now()}`,
    });
  }
}

/**
 * Router：依手機號碼前綴決定 provider。
 *
 * - `+886` → Mitake；失敗 fallback Twilio
 * - 其他 → Twilio
 */
export class OtpRouter implements OtpProvider {
  constructor(
    private readonly mitake: OtpProvider,
    private readonly twilio: OtpProvider,
  ) {}

  async send(params: OtpSendParams): Promise<OtpSendResult> {
    const isTaiwan = params.phone.startsWith('+886');
    if (isTaiwan) {
      const primary = await this.mitake.send(params);
      if (primary.ok) {
        return primary;
      }
      return this.twilio.send(params);
    }
    return this.twilio.send(params);
  }
}

/**
 * 產 6 位數 OTP 驗證碼。
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
