import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, applyLocaleToSystemPrompt } from '../locale.js';

const SAMPLE_PROMPT = '你是專精台灣保健食品市場的資深文案，文案語氣需溫暖、科學、可信。';

describe('applyLocaleToSystemPrompt', () => {
  it('zh-TW（預設）→ 不動原 prompt', () => {
    const out = applyLocaleToSystemPrompt(SAMPLE_PROMPT, 'zh-TW');
    expect(out).toBe(SAMPLE_PROMPT);
  });

  it('DEFAULT_LOCALE 是 zh-TW（向後相容）', () => {
    expect(DEFAULT_LOCALE).toBe('zh-TW');
  });

  it('zh-CN → 前綴注入簡中指令，原 prompt 保留', () => {
    const out = applyLocaleToSystemPrompt(SAMPLE_PROMPT, 'zh-CN');
    expect(out).toContain('簡體中文');
    expect(out).toContain('半形');
    expect(out).toContain('軟體→软件');
    expect(out).toContain(SAMPLE_PROMPT);
    expect(out.startsWith('【語系指令')).toBe(true);
  });

  it('en → 前綴注入英文指令，原 prompt 保留', () => {
    const out = applyLocaleToSystemPrompt(SAMPLE_PROMPT, 'en');
    expect(out).toContain('American English');
    expect(out).toContain('ASCII punctuation');
    expect(out).toContain(SAMPLE_PROMPT);
    expect(out.startsWith('[Locale Directive')).toBe(true);
  });

  it('en / zh-CN 指令必須明確要求保留原 prompt 結構', () => {
    const en = applyLocaleToSystemPrompt(SAMPLE_PROMPT, 'en');
    const zhCN = applyLocaleToSystemPrompt(SAMPLE_PROMPT, 'zh-CN');
    // 防止 LLM 切換語系時把 prompt 約束（字數、CTA、合規）一併丟掉
    expect(en).toMatch(/structure constraints|character\/word counts/i);
    expect(zhCN).toMatch(/文案結構|字數限制/);
  });
});
