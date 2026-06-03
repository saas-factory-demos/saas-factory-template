import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryFaqStore } from './in-memory-store.js';
import { FaqService } from './service.js';

const TENANT = 'tenant-1';

function lexical(text: string): unknown {
  return { root: { children: [{ type: 'paragraph', children: [{ text }] }] } };
}

describe('FaqService', () => {
  let store: InMemoryFaqStore;
  let service: FaqService;

  beforeEach(() => {
    store = new InMemoryFaqStore();
    service = new FaqService(store);
  });

  it('建立分類 + 排序', async () => {
    await service.createCategory({ tenantId: TENANT, name: 'B', slug: 'b', sortOrder: 2 });
    await service.createCategory({ tenantId: TENANT, name: 'A', slug: 'a', sortOrder: 1 });
    const list = await service.listCategories(TENANT);
    expect(list.map((c) => c.slug)).toEqual(['a', 'b']);
  });

  it('建立 FAQ：自動萃取 answerPlain', async () => {
    const item = await service.createItem({
      tenantId: TENANT,
      question: '怎麼結帳？',
      answer: lexical('點購物車然後付款'),
    });
    expect(item.answerPlain).toBe('點購物車然後付款');
    expect(item.published).toBe(true);
    expect(item.clickCount).toBe(0);
  });

  it('搜尋：命中 question 排前面', async () => {
    await service.createItem({
      tenantId: TENANT,
      question: '怎麼退貨？',
      answer: lexical('七天內聯絡客服'),
      sortOrder: 1,
    });
    await service.createItem({
      tenantId: TENANT,
      question: '運費怎麼算？',
      answer: lexical('退貨後重新計算運費'),
      sortOrder: 2,
    });
    const r = await service.search(TENANT, '退貨');
    expect(r).toHaveLength(2);
    expect(r[0]?.question).toBe('怎麼退貨？');
  });

  it('搜尋空字串 → 空陣列', async () => {
    expect(await service.search(TENANT, '   ')).toEqual([]);
  });

  it('未發布的 FAQ 不出現在搜尋與分組', async () => {
    await service.createItem({
      tenantId: TENANT,
      question: '草稿問題',
      answer: lexical('答案'),
      published: false,
    });
    expect(await service.search(TENANT, '問題')).toEqual([]);
    expect(await service.listGrouped(TENANT)).toEqual([]);
  });

  it('點擊統計累加 + topClicked', async () => {
    const a = await service.createItem({
      tenantId: TENANT,
      question: 'A',
      answer: lexical('a'),
    });
    const b = await service.createItem({
      tenantId: TENANT,
      question: 'B',
      answer: lexical('b'),
    });
    await service.incrementClick(a.id);
    await service.incrementClick(a.id);
    await service.incrementClick(b.id);
    const top = await service.topClicked(TENANT, 2);
    expect(top[0]?.id).toBe(a.id);
    expect(top[0]?.clickCount).toBe(2);
  });

  it('listGrouped：分類 + 未分類分組', async () => {
    const cat = await service.createCategory({
      tenantId: TENANT,
      name: '訂單',
      slug: 'orders',
      sortOrder: 1,
    });
    await service.createItem({
      tenantId: TENANT,
      categoryId: cat.id,
      question: 'Q1',
      answer: lexical('a'),
    });
    await service.createItem({
      tenantId: TENANT,
      question: '雜項',
      answer: lexical('b'),
    });
    const groups = await service.listGrouped(TENANT);
    expect(groups).toHaveLength(2);
    expect(groups[0]?.category?.slug).toBe('orders');
    expect(groups[1]?.category).toBeNull();
  });

  it('updateItem 變更 answer → 重新萃取 plain', async () => {
    const it = await service.createItem({
      tenantId: TENANT,
      question: 'Q',
      answer: lexical('舊答案'),
    });
    const updated = await service.updateItem(it.id, { answer: lexical('新答案內容') });
    expect(updated.answerPlain).toBe('新答案內容');
  });
});
