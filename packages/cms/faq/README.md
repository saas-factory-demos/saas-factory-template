# @saas-factory/cms-faq

FAQ 系統（分類 + 排序 + 搜尋 + 折疊式分組 + 點擊統計）。

## 功能

- FaqCategory + FaqItem 兩個 collection
- 自動萃取 `answerPlain`（給搜尋用）
- 搜尋：question 命中優先，answerPlain 命中次之
- `listGrouped()`：分類 + 該分類底下 FAQ，給前台折疊式呈現
- 點擊統計：`incrementClick()` + `topClicked()`

## 使用

```ts
import { FaqService, InMemoryFaqStore } from '@saas-factory/cms-faq';

const service = new FaqService(new InMemoryFaqStore());

const cat = await service.createCategory({
  tenantId: 't1',
  name: '訂單',
  slug: 'orders',
});

await service.createItem({
  tenantId: 't1',
  categoryId: cat.id,
  question: '怎麼退貨？',
  answer: lexicalJson,
});

const grouped = await service.listGrouped('t1');
const hits = await service.search('t1', '退貨');
await service.incrementClick(faqId);
```

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
