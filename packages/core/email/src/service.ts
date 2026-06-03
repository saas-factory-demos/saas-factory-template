import { Resend } from 'resend';

import type {
  BatchEmailParams,
  BatchResult,
  EmailResult,
  EmailTemplateId,
  SendEmailParams,
  TemplateData,
  TemplateRenderer,
} from './types.js';

/**
 * 對外 EmailService 介面（goal 01 §2）。
 */
export interface EmailService {
  send(params: SendEmailParams): Promise<EmailResult>;
  sendBatch(params: BatchEmailParams): Promise<BatchResult>;
  renderTemplate(templateId: EmailTemplateId, data: TemplateData): Promise<string>;
}

export interface ResendEmailServiceConfig {
  apiKey: string;
  /** 預設寄件人；個別 send 可覆寫 */
  defaultFrom: string;
  renderer: TemplateRenderer;
}

/**
 * Resend adapter。
 *
 * 失敗回 `status: 'failed'` + `error`，不 throw。批次寄送獨立計算成功/失敗數。
 */
export class ResendEmailService implements EmailService {
  private readonly client: Resend;

  constructor(private readonly config: ResendEmailServiceConfig) {
    this.client = new Resend(config.apiKey);
  }

  async send(params: SendEmailParams): Promise<EmailResult> {
    const to = Array.isArray(params.to) ? params.to : [params.to];
    try {
      const res = await this.client.emails.send({
        from: params.from ?? this.config.defaultFrom,
        to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        headers: params.headers,
        tags: params.tags,
      });
      if (res.error) {
        return { id: '', to, status: 'failed', error: res.error.message };
      }
      return { id: res.data?.id ?? '', to, status: 'queued' };
    } catch (err) {
      return {
        id: '',
        to,
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async sendBatch(params: BatchEmailParams): Promise<BatchResult> {
    const results = await Promise.all(params.emails.map((e) => this.send(e)));
    const successCount = results.filter((r) => r.status !== 'failed').length;
    return {
      results,
      successCount,
      failureCount: results.length - successCount,
    };
  }

  renderTemplate(templateId: EmailTemplateId, data: TemplateData): Promise<string> {
    return this.config.renderer.render(templateId, data);
  }
}

/**
 * 依環境變數建立 service：`RESEND_API_KEY` + `EMAIL_FROM`。
 */
export function createEmailServiceFromEnv(
  env: NodeJS.ProcessEnv,
  renderer: TemplateRenderer,
): EmailService {
  return new ResendEmailService({
    apiKey: env.RESEND_API_KEY ?? '',
    defaultFrom: env.EMAIL_FROM ?? 'no-reply@example.com',
    renderer,
  });
}
