# @saas-factory/cms-zod-payload

把 Zod schema 自動轉成 Payload Field[]。

## 為何

`packages/frontend/blocks-library` 的每個 block 用 Zod schema 描述 config 形狀，跑 wizard / template / storybook 共用同一份。Payload collection 的 `blocks` field 需要 Payload Field[]。兩處重複維護 schema 太脆，這層 adapter 一鍵自動同步。

對齊「自製、堆 SaaS Factory 護城河」原則：不靠第三方 zod-to-payload 套件（社群沒有夠成熟的）。

## 用法

```ts
import { zodBlockToPayloadFields } from '@saas-factory/cms-zod-payload';
import { heroSchema, BLOCK_REGISTRY } from '@saas-factory/frontend-blocks';
import type { Block } from 'payload';

// 單一 block schema → Payload Field[]
const heroFields = zodBlockToPayloadFields(heroSchema);

// 整個 registry → Payload Block[]（給 Pages.layout blocks field 用）
const payloadBlocks: Block[] = Object.entries(BLOCK_REGISTRY).map(([slug, entry]) => ({
  slug,
  labels: { singular: entry.displayName, plural: entry.displayName },
  fields: zodBlockToPayloadFields(entry.schema),
}));
```

## 支援的 Zod 型別

| Zod                  | Payload                       |
|----------------------|-------------------------------|
| `z.string()`         | `text`                        |
| `z.string().max(>200)` | `textarea`                  |
| `z.number()`         | `number`                      |
| `z.boolean()`        | `checkbox`                    |
| `z.date()`           | `date`                        |
| `z.enum([...])`      | `select` with options         |
| `z.nativeEnum(...)`  | `select` with options         |
| `z.literal(v)`       | `text/number/checkbox` readOnly + defaultValue |
| `z.array(T)`         | `array`（T 為 object 則用 shape；primitive 則用 `value` field） |
| `z.object({...})`    | `group`（imageAssetSchema 形狀 → `upload relationTo='media'`） |
| `z.optional()`       | unwrap + `required: false`    |
| `z.nullable()`       | unwrap + `required: false`    |
| `z.default(v)`       | unwrap + `defaultValue: v`    |
| `z.readonly()`       | unwrap                        |
| `z.effects(refine/transform)` | unwrap                |
| `z.union([literals])` | `select`                     |
| `z.union([mixed])`   | `json` fallback               |
| `z.record(T)`        | `array` of `{key, value}`     |

## Hint 覆寫

Zod schema 上加 `.describe('hint:xxx')` 強制覆寫對應的 Payload type：

| Hint              | Payload type            |
|-------------------|-------------------------|
| `hint:richtext`   | `richText`              |
| `hint:image`      | `upload relationTo='media'` |
| `hint:textarea`   | `textarea`              |
| `hint:color`      | `text` + admin description |

## 範例：偵測圖片資產 shape

```ts
const imageAssetSchema = z.object({
  src: z.string(),
  alt: z.string().default(''),
  width: z.number().optional(),
  height: z.number().optional(),
});
// 自動轉成 upload relationTo='media'，不需 hint
```

## 限制

- ZodDiscriminatedUnion 全 literal 時轉 select；混合型別退化為 `json` fallback
- ZodIntersection / ZodTuple / ZodMap 未支援（blocks-library 未用）
- 不處理 ZodPromise、ZodFunction
- ZodLazy 不支援（會 hit 10 層 unwrap 上限後 fallback）

需求擴充時加 case 即可。
