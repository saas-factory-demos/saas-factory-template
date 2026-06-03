import { describe, expect, it } from 'vitest';

import { BUILT_IN_TEMPLATES, SimpleTemplateRenderer } from './index.js';

describe('SimpleTemplateRenderer', () => {
  it('render 把 {{key}} 替換成 data 對應值', async () => {
    const renderer = new SimpleTemplateRenderer();
    renderer.registerTemplate('welcome', 'Hi {{name}}, welcome!');
    const html = await renderer.render('welcome', { name: 'Ephraim' });
    expect(html).toBe('Hi Ephraim, welcome!');
  });

  it('未註冊 template 會 reject', async () => {
    const renderer = new SimpleTemplateRenderer();
    await expect(
      renderer.render('welcome', {}),
    ).rejects.toThrow('template not found: welcome');
  });

  it('未定義變數渲染為空字串', async () => {
    const renderer = new SimpleTemplateRenderer();
    renderer.registerTemplate('welcome', 'Hi {{name}}!');
    const html = await renderer.render('welcome', {});
    expect(html).toBe('Hi !');
  });
});

describe('BUILT_IN_TEMPLATES', () => {
  it('包含 goal 01 §2 列出的 16 個模板', () => {
    expect(BUILT_IN_TEMPLATES.length).toBe(16);
  });

  it('每個模板都有 id/label/category', () => {
    for (const t of BUILT_IN_TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.label).toBeTruthy();
      expect(t.category).toBeTruthy();
    }
  });
});
