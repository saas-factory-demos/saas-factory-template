import { describe, expect, it } from 'vitest';

import { listBlockTypes, validateBlock, validateBlocks } from './validator.js';

describe('listBlockTypes', () => {
  it('回傳全部 18 種 block', () => {
    const types = listBlockTypes();
    expect(types).toHaveLength(18);
    expect(types).toContain('hero');
    expect(types).toContain('checkout-form');
    expect(types).toContain('custom-html');
  });
});

describe('validateBlock - hero', () => {
  it('最小 props 通過', () => {
    const r = validateBlock('hero', { title: '夏季特賣' });
    expect(r.valid).toBe(true);
    expect(r.data?.title).toBe('夏季特賣');
  });

  it('缺 title → fail', () => {
    const r = validateBlock('hero', {});
    expect(r.valid).toBe(false);
    expect(r.errors?.[0]?.path).toBe('title');
  });

  it('image media 自動帶 radius default = lg', () => {
    const r = validateBlock('hero', {
      title: 'X',
      media: { kind: 'image', image: { src: '/a.png' } },
    });
    expect(r.valid).toBe(true);
    const media = r.data?.media as { image: { radius: string; alt: string } };
    expect(media.image.radius).toBe('lg');
    expect(media.image.alt).toBe('');
  });

  it('video media autoplay/muted/loop 預設 true', () => {
    const r = validateBlock('hero', {
      title: 'X',
      media: { kind: 'video', src: '/v.mp4' },
    });
    expect(r.valid).toBe(true);
    const media = r.data?.media as { autoplay: boolean; muted: boolean; loop: boolean };
    expect(media.autoplay).toBe(true);
    expect(media.muted).toBe(true);
    expect(media.loop).toBe(true);
  });
});

describe('validateBlock - checkout-form', () => {
  it('1 個 plan 通過', () => {
    const r = validateBlock('checkout-form', {
      plans: [{ id: 'a', title: '基礎', priceMinor: 100 }],
    });
    expect(r.valid).toBe(true);
    const data = r.data as { paymentMethods: string[]; collapsibleInvoice: boolean };
    expect(data.paymentMethods).toEqual(['credit-card']);
    expect(data.collapsibleInvoice).toBe(true);
  });

  it('plans 空陣列 → fail', () => {
    const r = validateBlock('checkout-form', { plans: [] });
    expect(r.valid).toBe(false);
  });

  it('plans 超過 5 → fail', () => {
    const plans = Array.from({ length: 6 }, (_, i) => ({
      id: `p${i}`,
      title: `方案 ${i}`,
      priceMinor: 100,
    }));
    const r = validateBlock('checkout-form', { plans });
    expect(r.valid).toBe(false);
  });

  it('未知 payment method → fail', () => {
    const r = validateBlock('checkout-form', {
      plans: [{ id: 'a', title: 'A', priceMinor: 100 }],
      paymentMethods: ['bitcoin'],
    });
    expect(r.valid).toBe(false);
  });
});

describe('validateBlock - countdown', () => {
  it('預設 mode = real, onEnd = show-message', () => {
    const r = validateBlock('countdown', {});
    expect(r.valid).toBe(true);
    const data = r.data as { mode: string; onEnd: string; endMessage: string };
    expect(data.mode).toBe('real');
    expect(data.onEnd).toBe('show-message');
    expect(data.endMessage).toBe('活動已結束');
  });

  it('endsAt 不是 ISO datetime → fail', () => {
    const r = validateBlock('countdown', { endsAt: '2026-05-15' });
    expect(r.valid).toBe(false);
  });
});

describe('validateBlock - custom-html', () => {
  it('allowScripts 預設 false', () => {
    const r = validateBlock('custom-html', { html: '<p>hi</p>' });
    expect(r.valid).toBe(true);
    expect((r.data as { allowScripts: boolean }).allowScripts).toBe(false);
  });

  it('空 html → fail', () => {
    const r = validateBlock('custom-html', { html: '' });
    expect(r.valid).toBe(false);
  });
});

describe('validateBlock - custom-html XSS sanitize', () => {
  it('剝除 <script>', () => {
    const r = validateBlock('custom-html', {
      html: '<p>hi</p><script>alert(1)</script>',
    });
    expect(r.valid).toBe(true);
    const html = (r.data as { html: string }).html;
    expect(html).not.toMatch(/<script/i);
    expect(html).toContain('<p>hi</p>');
  });

  it('剝除 onclick 事件屬性', () => {
    const r = validateBlock('custom-html', {
      html: '<a href="/x" onclick="alert(1)">go</a>',
    });
    const html = (r.data as { html: string }).html;
    expect(html).not.toMatch(/onclick/i);
    expect(html).toContain('href="/x"');
  });

  it('中和 javascript: href', () => {
    const r = validateBlock('custom-html', {
      html: '<a href="javascript:alert(1)">x</a>',
    });
    const html = (r.data as { html: string }).html;
    expect(html).not.toMatch(/javascript:/i);
    expect(html).toContain('href="#"');
  });

  it('allowScripts=true 不 sanitize（後台明示開白名單）', () => {
    const r = validateBlock('custom-html', {
      html: '<script>safe()</script>',
      allowScripts: true,
    });
    expect((r.data as { html: string }).html).toContain('<script>');
  });
});

describe('validateBlock - rich-text XSS sanitize', () => {
  it('format=html 會剝除 <iframe>', () => {
    const r = validateBlock('rich-text', {
      content: '<p>safe</p><iframe src="x"></iframe>',
      format: 'html',
    });
    const content = (r.data as { content: string }).content;
    expect(content).not.toMatch(/<iframe/i);
  });

  it('format=markdown 不動 content（由 markdown renderer 自己處理）', () => {
    const original = '# Title\n<script>x</script>';
    const r = validateBlock('rich-text', { content: original, format: 'markdown' });
    expect((r.data as { content: string }).content).toBe(original);
  });
});

describe('validateBlock - 未知類型', () => {
  it('未註冊 type → fail', () => {
    const r = validateBlock('nope', {});
    expect(r.valid).toBe(false);
    expect(r.errors?.[0]?.path).toBe('type');
  });
});

describe('validateBlocks 批次', () => {
  it('混合驗證每筆獨立回傳', () => {
    const results = validateBlocks([
      { id: 'b1', type: 'hero', props: { title: 'X' } },
      { id: 'b2', type: 'hero', props: {} },
      { id: 'b3', type: 'faq', props: { items: [{ question: 'Q', answer: 'A' }] } },
    ]);
    expect(results[0]?.valid).toBe(true);
    expect(results[1]?.valid).toBe(false);
    expect(results[2]?.valid).toBe(true);
    expect(results[2]?.id).toBe('b3');
  });
});
