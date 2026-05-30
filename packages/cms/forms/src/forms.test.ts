import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isFieldVisible } from './conditional.js';
import { exportSubmissionsCsv } from './csv.js';
import { InMemoryFormStore } from './in-memory-store.js';
import { FormService } from './service.js';
import { renderTemplate, renderTemplateHtml } from './template.js';
import { validateValues } from './validator.js';

import type { FormDefinition, FormField } from './types.js';

const TENANT = 'tenant-1';

describe('conditional logic', () => {
  it('equals 規則', () => {
    expect(
      isFieldVisible(
        { action: 'show', match: 'all', rules: [{ fieldKey: 'a', operator: 'equals', value: 'x' }] },
        { a: 'x' },
      ),
    ).toBe(true);
    expect(
      isFieldVisible(
        { action: 'show', match: 'all', rules: [{ fieldKey: 'a', operator: 'equals', value: 'x' }] },
        { a: 'y' },
      ),
    ).toBe(false);
  });
  it('any + truthy', () => {
    expect(
      isFieldVisible(
        {
          action: 'show',
          match: 'any',
          rules: [
            { fieldKey: 'a', operator: 'truthy' },
            { fieldKey: 'b', operator: 'truthy' },
          ],
        },
        { a: '', b: 'yes' },
      ),
    ).toBe(true);
  });
  it('hide action 反轉', () => {
    expect(
      isFieldVisible(
        { action: 'hide', match: 'all', rules: [{ fieldKey: 'a', operator: 'equals', value: 'x' }] },
        { a: 'x' },
      ),
    ).toBe(false);
  });
});

describe('validator', () => {
  const fields: FormField[] = [
    { key: 'name', type: 'text', label: '姓名', required: true, minLength: 2 },
    { key: 'email', type: 'email', label: 'Email', required: true },
    { key: 'agree', type: 'consent', label: '同意條款', required: true },
    {
      key: 'note',
      type: 'textarea',
      label: '備註',
      required: true,
      conditional: {
        action: 'show',
        match: 'all',
        rules: [{ fieldKey: 'agree', operator: 'truthy' }],
      },
    },
  ];

  it('必填缺漏', () => {
    const e = validateValues(fields, { agree: true, note: 'x' });
    expect(e.name).toBeDefined();
    expect(e.email).toBeDefined();
  });

  it('email 格式錯', () => {
    const e = validateValues(fields, { name: '小明', email: 'bad', agree: true, note: 'x' });
    expect(e.email).toBeDefined();
  });

  it('consent 沒勾 → 錯', () => {
    const e = validateValues(fields, {
      name: '小明',
      email: 'a@b.com',
      agree: false,
      note: 'x',
    });
    expect(e.agree).toBeDefined();
  });

  it('隱藏欄位的必填不驗證', () => {
    const e = validateValues(fields, {
      name: '小明',
      email: 'a@b.com',
      agree: false,
    });
    expect(e.note).toBeUndefined();
  });
});

describe('renderTemplate', () => {
  it('替換變數', () => {
    expect(renderTemplate('Hi {{name}}', { name: '小明' })).toBe('Hi 小明');
  });
  it('找不到變數 → 空字串', () => {
    expect(renderTemplate('A{{x}}B', {})).toBe('AB');
  });
  it('renderTemplateHtml 對 values 做 HTML escape', () => {
    const out = renderTemplateHtml('<p>{{msg}}</p>', { msg: '<script>alert(1)</script>' });
    expect(out).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
  });
});

describe('csv export', () => {
  it('特殊字元加引號', () => {
    const form: FormDefinition = {
      id: 'f1',
      tenantId: TENANT,
      name: 'F',
      slug: 'f',
      fields: [{ key: 'msg', type: 'textarea', label: '訊息' }],
      actions: [],
      published: true,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    };
    const csv = exportSubmissionsCsv(form, [
      {
        id: 's1',
        tenantId: TENANT,
        formId: 'f1',
        values: { msg: 'hello, "world"' },
        actionResults: [],
        isSpam: false,
        createdAt: new Date('2026-01-02T00:00:00Z'),
      },
    ]);
    expect(csv).toContain('"hello, ""world"""');
  });

  it('防止公式注入：=、+、-、@ 開頭加單引號', () => {
    const form: FormDefinition = {
      id: 'f1',
      tenantId: TENANT,
      name: 'F',
      slug: 'f',
      fields: [{ key: 'a', type: 'text', label: 'A' }],
      actions: [],
      published: true,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    };
    const csv = exportSubmissionsCsv(form, [
      {
        id: 's1',
        tenantId: TENANT,
        formId: 'f1',
        values: { a: '=cmd|\'/c calc\'!A1' },
        actionResults: [],
        isSpam: false,
        createdAt: new Date('2026-01-02T00:00:00Z'),
      },
      {
        id: 's2',
        tenantId: TENANT,
        formId: 'f1',
        values: { a: '+1234' },
        actionResults: [],
        isSpam: false,
        createdAt: new Date('2026-01-02T00:00:00Z'),
      },
    ]);
    expect(csv).toContain(`'=cmd|`); // 注入字串被前置單引號
    expect(csv).toContain(`'+1234`);
  });
});

describe('FormService.submit', () => {
  let store: InMemoryFormStore;
  let service: FormService;
  let emailSender: ReturnType<typeof vi.fn>;
  let webhookSender: ReturnType<typeof vi.fn>;
  let marketingTrigger: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    store = new InMemoryFormStore();
    emailSender = vi.fn(async () => undefined);
    webhookSender = vi.fn(async () => undefined);
    marketingTrigger = vi.fn(async () => undefined);
    service = new FormService(store, {
      emailSender,
      webhookSender,
      marketingTrigger,
      verifyCaptcha: async (t) => t === 'good',
    });
  });

  async function makeForm(extra: Partial<FormDefinition> = {}): Promise<FormDefinition> {
    return service.upsertForm({
      tenantId: TENANT,
      name: '諮詢',
      slug: 'consult',
      fields: [
        { key: 'name', type: 'text', label: '姓名', required: true },
        { key: 'email', type: 'email', label: 'Email', required: true },
      ],
      actions: [
        { type: 'notify-admin', to: ['admin@x.com'], subject: '新提交：{{name}}' },
        { type: 'auto-reply', replyToFieldKey: 'email', subject: '感謝 {{name}}' },
        { type: 'webhook', url: 'https://hook.example.com/x' },
        { type: 'marketing-trigger', eventId: 'lead-captured' },
      ],
      ...extra,
    });
  }

  it('提交 → 4 個動作全部 ok', async () => {
    const f = await makeForm();
    const sub = await service.submit({
      tenantId: TENANT,
      formId: f.id,
      values: { name: '小明', email: 'a@b.com' },
    });
    expect(sub.actionResults).toHaveLength(4);
    expect(sub.actionResults.every((r) => r.ok)).toBe(true);
    expect(emailSender).toHaveBeenCalledTimes(2);
    expect(webhookSender).toHaveBeenCalledTimes(1);
    expect(marketingTrigger).toHaveBeenCalledTimes(1);
  });

  it('驗證失敗 → throw 含 errors', async () => {
    const f = await makeForm();
    await expect(
      service.submit({ tenantId: TENANT, formId: f.id, values: {} }),
    ).rejects.toMatchObject({ message: '表單驗證失敗' });
  });

  it('honeypot 有填 → isSpam，不跑 actions', async () => {
    const f = await makeForm();
    const sub = await service.submit({
      tenantId: TENANT,
      formId: f.id,
      values: { name: '小明', email: 'a@b.com' },
      honeypot: 'bot',
    });
    expect(sub.isSpam).toBe(true);
    expect(sub.actionResults).toHaveLength(0);
    expect(emailSender).not.toHaveBeenCalled();
  });

  it('captcha 啟用 + token 錯 → throw', async () => {
    const f = await makeForm({ captchaEnabled: true });
    await expect(
      service.submit({
        tenantId: TENANT,
        formId: f.id,
        values: { name: '小明', email: 'a@b.com' },
        captchaToken: 'bad',
      }),
    ).rejects.toThrow(/captcha/);
  });

  it('未上架 → throw', async () => {
    const f = await makeForm({ published: false });
    await expect(
      service.submit({
        tenantId: TENANT,
        formId: f.id,
        values: { name: '小明', email: 'a@b.com' },
      }),
    ).rejects.toThrow(/未上架/);
  });

  it('action 失敗只記錄、不影響其他動作', async () => {
    const failingService = new FormService(store, {
      emailSender: vi.fn(async () => {
        throw new Error('SMTP 掛了');
      }),
      webhookSender,
      marketingTrigger,
    });
    const f = await failingService.upsertForm({
      tenantId: TENANT,
      name: 'X',
      slug: 'x',
      fields: [{ key: 'email', type: 'email', label: 'E', required: true }],
      actions: [
        { type: 'notify-admin', to: ['admin@x.com'] },
        { type: 'webhook', url: 'https://hook.example.com/x' },
      ],
    });
    const sub = await failingService.submit({
      tenantId: TENANT,
      formId: f.id,
      values: { email: 'a@b.com' },
    });
    expect(sub.actionResults[0]?.ok).toBe(false);
    expect(sub.actionResults[0]?.error).toContain('SMTP');
    expect(sub.actionResults[1]?.ok).toBe(true);
  });

  it('exportCsv：跳過 spam 列', async () => {
    const f = await makeForm();
    await service.submit({
      tenantId: TENANT,
      formId: f.id,
      values: { name: '正常', email: 'a@b.com' },
    });
    await service.submit({
      tenantId: TENANT,
      formId: f.id,
      values: { name: 'bot', email: 'b@b.com' },
      honeypot: 'bot',
    });
    const csv = await service.exportCsv(TENANT, f.id);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2); // header + 1 row
    expect(csv).toContain('正常');
    expect(csv).not.toContain('bot');
  });
});
