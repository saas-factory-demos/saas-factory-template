import { exportSubmissionsCsv } from './csv.js';
import { renderTemplate, renderTemplateHtml, renderValuesHtml } from './template.js';
import { validateValues } from './validator.js';

import type {
  FormAction,
  FormActionType,
  FormDefinition,
  FormField,
  FormServiceOptions,
  FormStore,
  FormSubmission,
  SubmitFormInput,
} from './types.js';

/**
 * 表單服務（拖拉欄位 + 條件邏輯 + 反垃圾 + 多動作 + CSV 匯出）。
 */
export class FormService {
  private readonly store: FormStore;
  private readonly opts: FormServiceOptions;

  constructor(store: FormStore, options: FormServiceOptions = {}) {
    this.store = store;
    this.opts = options;
  }

  private genId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /** 建立 / 更新表單。 */
  async upsertForm(input: {
    id?: string;
    tenantId: string;
    name: string;
    slug: string;
    description?: string;
    fields: FormField[];
    actions?: FormAction[];
    captchaEnabled?: boolean;
    successMessage?: string;
    published?: boolean;
  }): Promise<FormDefinition> {
    const now = new Date();
    const existing = input.id ? await this.store.findFormById(input.id) : undefined;
    const form: FormDefinition = {
      id: existing?.id ?? this.genId('form'),
      tenantId: input.tenantId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      fields: input.fields,
      actions: input.actions ?? [],
      captchaEnabled: input.captchaEnabled ?? false,
      successMessage: input.successMessage,
      published: input.published ?? true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    return this.store.upsertForm(form);
  }

  async findFormBySlug(tenantId: string, slug: string): Promise<FormDefinition | undefined> {
    return this.store.findFormBySlug(tenantId, slug);
  }

  async listForms(tenantId: string): Promise<FormDefinition[]> {
    return this.store.listForms(tenantId);
  }

  /**
   * 提交表單：honeypot → captcha → validate → 建立 submission → 執行 actions。
   * 驗證失敗會 throw 含 errors 的 Error。
   */
  async submit(input: SubmitFormInput): Promise<FormSubmission> {
    const form = await this.store.findFormById(input.formId);
    if (!form) throw new Error(`Form 不存在：${input.formId}`);
    if (!form.published) throw new Error('表單未上架');

    const spamReasons: string[] = [];
    if (input.honeypot && input.honeypot.trim().length > 0) {
      spamReasons.push('honeypot');
    }

    if (form.captchaEnabled && this.opts.verifyCaptcha) {
      if (!input.captchaToken) throw new Error('缺少 captcha token');
      const ok = await this.opts.verifyCaptcha(input.captchaToken);
      if (!ok) throw new Error('captcha 驗證失敗');
    }

    const errors = validateValues(form.fields, input.values);
    if (Object.keys(errors).length > 0) {
      const err = new Error('表單驗證失敗');
      (err as Error & { errors?: Record<string, string> }).errors = errors;
      throw err;
    }

    const isSpam = spamReasons.length > 0;
    const submission: FormSubmission = {
      id: this.genId('sub'),
      tenantId: input.tenantId,
      formId: form.id,
      values: input.values,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      actionResults: [],
      isSpam,
      spamReasons: isSpam ? spamReasons : undefined,
      createdAt: new Date(),
    };

    if (!isSpam) {
      for (const action of form.actions) {
        const result = await this.runAction(action, form, submission);
        submission.actionResults.push(result);
      }
    }

    return this.store.createSubmission(submission);
  }

  private async runAction(
    action: FormAction,
    form: FormDefinition,
    sub: FormSubmission,
  ): Promise<{ type: FormActionType; ok: boolean; error?: string }> {
    try {
      switch (action.type) {
        case 'notify-admin':
          await this.actNotifyAdmin(action, form, sub);
          break;
        case 'auto-reply':
          await this.actAutoReply(action, form, sub);
          break;
        case 'webhook':
          await this.actWebhook(action, form, sub);
          break;
        case 'marketing-trigger':
          await this.actMarketingTrigger(action, sub);
          break;
      }
      return { type: action.type, ok: true };
    } catch (e) {
      return {
        type: action.type,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  private async actNotifyAdmin(
    action: FormAction,
    form: FormDefinition,
    sub: FormSubmission,
  ): Promise<void> {
    if (!this.opts.emailSender) throw new Error('emailSender 未設定');
    if (!action.to || action.to.length === 0) throw new Error('notify-admin 缺 to');
    // subject 走純文字 render；body 走 HTML escape render，避免使用者輸入注入 script。
    const subject = renderTemplate(action.subject ?? `[${form.name}] 新表單提交`, sub.values);
    const intro = action.body ? `${renderTemplateHtml(action.body, sub.values)}\n\n` : '';
    const html = `${intro}${renderValuesHtml(sub.values)}`;
    await this.opts.emailSender({ to: action.to, subject, html });
  }

  private async actAutoReply(
    action: FormAction,
    form: FormDefinition,
    sub: FormSubmission,
  ): Promise<void> {
    if (!this.opts.emailSender) throw new Error('emailSender 未設定');
    const key = action.replyToFieldKey ?? 'email';
    const to = sub.values[key];
    if (typeof to !== 'string' || !to) throw new Error(`auto-reply 找不到收件 email（欄位：${key}）`);
    const subject = renderTemplate(action.subject ?? `感謝您填寫 ${form.name}`, sub.values);
    const html = renderTemplateHtml(
      action.body ?? '<p>我們已收到您的表單，會盡快與您聯繫。</p>',
      sub.values,
    );
    await this.opts.emailSender({ to: [to], subject, html });
  }

  private async actWebhook(
    action: FormAction,
    form: FormDefinition,
    sub: FormSubmission,
  ): Promise<void> {
    if (!this.opts.webhookSender) throw new Error('webhookSender 未設定');
    if (!action.url) throw new Error('webhook 缺 url');
    await this.opts.webhookSender({
      url: action.url,
      method: action.method ?? 'POST',
      headers: action.headers ?? { 'content-type': 'application/json' },
      body: { formId: form.id, formSlug: form.slug, submissionId: sub.id, values: sub.values },
    });
  }

  private async actMarketingTrigger(action: FormAction, sub: FormSubmission): Promise<void> {
    if (!this.opts.marketingTrigger) throw new Error('marketingTrigger 未設定');
    if (!action.eventId) throw new Error('marketing-trigger 缺 eventId');
    await this.opts.marketingTrigger({
      tenantId: sub.tenantId,
      eventId: action.eventId,
      payload: sub.values,
    });
  }

  /** 列出提交記錄。 */
  async listSubmissions(tenantId: string, formId?: string): Promise<FormSubmission[]> {
    return this.store.listSubmissions(tenantId, formId);
  }

  /** 匯出 CSV。 */
  async exportCsv(tenantId: string, formId: string): Promise<string> {
    const form = await this.store.findFormById(formId);
    if (!form) throw new Error(`Form 不存在：${formId}`);
    const subs = await this.store.listSubmissions(tenantId, formId);
    return exportSubmissionsCsv(form, subs.filter((s) => !s.isSpam));
  }
}
