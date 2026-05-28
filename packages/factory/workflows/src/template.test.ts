import { describe, expect, it } from 'vitest';

import {
  DEFAULT_ALLOWED_VARS,
  extractVariables,
  renderParams,
  renderTemplate,
  validateTemplate,
  validateWorkflowTemplates,
} from './template.js';

describe('renderTemplate', () => {
  const allowedVars = [
    'customer.email',
    'customer.displayName',
    'event.tagId',
    'now',
    'count',
  ];
  const ctx = {
    customer: { email: 'a@b.com', displayName: 'Alice' },
    event: { tagId: 'vip' },
    now: new Date('2026-05-19T12:00:00Z'),
    count: 3,
  };

  it('純文字無 placeholder 原樣回傳', () => {
    expect(renderTemplate('hello world', ctx, { allowedVars })).toBe('hello world');
  });

  it('單一 placeholder 取代', () => {
    expect(renderTemplate('Hi {{customer.displayName}}', ctx, { allowedVars })).toBe('Hi Alice');
  });

  it('多個 placeholder 取代', () => {
    expect(
      renderTemplate('{{customer.displayName}} <{{customer.email}}>', ctx, { allowedVars }),
    ).toBe('Alice <a@b.com>');
  });

  it('容許 placeholder 內空白', () => {
    expect(renderTemplate('{{   customer.email   }}', ctx, { allowedVars })).toBe('a@b.com');
  });

  it('Date 自動 ISO 序列化', () => {
    expect(renderTemplate('at {{now}}', ctx, { allowedVars })).toBe('at 2026-05-19T12:00:00.000Z');
  });

  it('number / boolean 轉字串', () => {
    expect(renderTemplate('count={{count}}', ctx, { allowedVars })).toBe('count=3');
  });

  it('未授權變數 throw', () => {
    expect(() => renderTemplate('{{secret}}', ctx, { allowedVars })).toThrow(/未授權變數/);
  });

  it('找不到值 throw（fail-closed）', () => {
    expect(() =>
      renderTemplate('{{customer.email}}', { customer: {} }, { allowedVars }),
    ).toThrow(/變數無值/);
  });

  it('非法變數路徑 throw', () => {
    expect(() => renderTemplate('{{1+1}}', ctx, { allowedVars: ['1+1'] })).toThrow(
      /非法變數路徑/,
    );
    expect(() => renderTemplate('{{a; rm -rf /}}', ctx, { allowedVars })).toThrow(
      /非法變數路徑/,
    );
  });

  it('prototype pollution path 拒（__proto__）', () => {
    expect(() =>
      renderTemplate('{{__proto__.polluted}}', { __proto__: { polluted: 'x' } }, {
        allowedVars: ['__proto__.polluted'],
      }),
    ).toThrow();
  });

  it('深度超過 5 throw', () => {
    expect(() =>
      renderTemplate('{{a.b.c.d.e.f}}', ctx, { allowedVars: ['a.b.c.d.e.f'] }),
    ).toThrow(/路徑過深/);
  });

  it('template 超過 8KB throw', () => {
    const huge = 'x'.repeat(9000);
    expect(() => renderTemplate(huge, ctx, { allowedVars })).toThrow(/長度上限/);
  });

  it('placeholder 數量超過上限 throw', () => {
    const tmpl = '{{count}}'.repeat(201);
    expect(() => renderTemplate(tmpl, ctx, { allowedVars })).toThrow(/展開次數/);
  });
});

describe('extractVariables', () => {
  it('抽取所有 placeholder', () => {
    expect(extractVariables('Hi {{customer.displayName}}, your tag is {{event.tagId}}'))
      .toEqual(['customer.displayName', 'event.tagId']);
  });

  it('保留重複出現', () => {
    expect(extractVariables('{{a}} {{a}} {{b}}')).toEqual(['a', 'a', 'b']);
  });

  it('無 placeholder 回空陣列', () => {
    expect(extractVariables('plain text')).toEqual([]);
  });
});

describe('validateTemplate', () => {
  const allowedVars = ['customer.email', 'event.tagId'];

  it('合法 template 回空陣列', () => {
    expect(validateTemplate('hi {{customer.email}}', allowedVars)).toEqual([]);
  });

  it('未授權變數列入錯誤', () => {
    const errs = validateTemplate('{{secret}}', allowedVars);
    expect(errs.length).toBeGreaterThan(0);
    expect(errs[0]).toMatch(/未授權變數/);
  });

  it('多筆錯誤一次回', () => {
    const errs = validateTemplate('{{a..b}} {{not_allowed}}', allowedVars);
    expect(errs).toHaveLength(2);
  });
});

describe('renderParams', () => {
  const allowedVars = ['customer.email'];

  it('string 渲染、number / boolean 保留型別', () => {
    const out = renderParams(
      { to: 'Email: {{customer.email}}', retries: 3, enabled: true },
      { customer: { email: 'a@b.com' } },
      { allowedVars },
    );
    expect(out).toEqual({ to: 'Email: a@b.com', retries: 3, enabled: true });
  });

  it('未授權變數整個 throw（不部份渲染）', () => {
    expect(() =>
      renderParams(
        { url: '{{secret}}' },
        { secret: 'x' },
        { allowedVars },
      ),
    ).toThrow(/未授權變數/);
  });
});

describe('validateWorkflowTemplates', () => {
  it('全合法回空陣列（DEFAULT_ALLOWED_VARS）', () => {
    const nodes = [
      {
        id: 'a1',
        data: {
          kind: 'action',
          params: {
            to: '{{customer.email}}',
            subject: 'Hi {{customer.displayName}}',
            retries: 3,
          },
        },
      },
    ];
    expect(validateWorkflowTemplates(nodes)).toEqual([]);
  });

  it('未授權變數帶節點 id 與欄位名回報', () => {
    const nodes = [
      {
        id: 'a1',
        data: {
          kind: 'action',
          params: { url: '{{secret.token}}' },
        },
      },
    ];
    const errs = validateWorkflowTemplates(nodes);
    expect(errs.length).toBeGreaterThan(0);
    expect(errs[0]).toMatch(/節點 a1.*params\.url/);
  });

  it('condition value 內 placeholder 也檢查', () => {
    const nodes = [
      {
        id: 'c1',
        data: { kind: 'condition', value: '{{not_allowed}}' },
      },
    ];
    const errs = validateWorkflowTemplates(nodes);
    expect(errs[0]).toMatch(/節點 c1 的 value/);
  });

  it('傳自訂 allowedVars 覆寫預設', () => {
    const nodes = [
      {
        id: 'a1',
        data: { kind: 'action', params: { x: '{{custom.foo}}' } },
      },
    ];
    expect(validateWorkflowTemplates(nodes, ['custom.foo'])).toEqual([]);
  });

  it('DEFAULT_ALLOWED_VARS 至少含 customer.email + event.type', () => {
    expect(DEFAULT_ALLOWED_VARS).toContain('customer.email');
    expect(DEFAULT_ALLOWED_VARS).toContain('event.type');
  });
});
