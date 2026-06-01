import { describe, expect, it } from 'vitest';

import { renderPromptTemplate } from '../render.js';

describe('renderPromptTemplate', () => {
  it('替換單一變數', () => {
    expect(renderPromptTemplate('Hi {{name}}', { name: 'Alex' })).toBe('Hi Alex');
  });

  it('替換多個變數', () => {
    const out = renderPromptTemplate('{{a}} 和 {{b}} 是 {{c}}', {
      a: '我',
      b: '你',
      c: '朋友',
    });
    expect(out).toBe('我 和 你 是 朋友');
  });

  it('允許變數名稱前後空白', () => {
    expect(renderPromptTemplate('Hi {{ name }}', { name: 'Alex' })).toBe('Hi Alex');
  });

  it('未提供的變數保留原始佔位符（不 throw）', () => {
    expect(renderPromptTemplate('Hi {{name}} {{title}}', { name: 'Alex' })).toBe('Hi Alex {{title}}');
  });

  it('沒有佔位符時原文回傳', () => {
    expect(renderPromptTemplate('no placeholder here', {})).toBe('no placeholder here');
  });
});
