import { z } from 'zod';

import type { Field } from 'payload';

/**
 * Zod → Payload Field adapter。
 *
 * 設計目的：blocks-library 的每個 block 用 Zod schema 描述 config。
 * Payload collection 的 blocks field 需要 Payload Field[] 形式。
 * 此 adapter 把 Zod schema 自動轉成 Payload Field[]，
 * 避免兩處重複維護 schema。
 *
 * 支援的 Zod 型別（覆蓋 blocks-library 用到的全部）：
 *   - ZodString / ZodNumber / ZodBoolean
 *   - ZodEnum / ZodNativeEnum
 *   - ZodLiteral（單值，多為 discriminator）
 *   - ZodArray
 *   - ZodObject（→ Payload `group` 或 `upload` 視 shape）
 *   - ZodOptional / ZodNullable / ZodDefault / ZodReadonly（unwrap inner）
 *   - ZodEffects（refine/transform，unwrap inner schema）
 *   - ZodUnion（若所有 option 為 ZodLiteral → select；否則 fallback json）
 *   - ZodDate
 *   - ZodRecord（→ Payload `array` of key/value）
 *
 * Hint 機制：透過 `.describe('hint:xxx')` 覆寫預設轉換：
 *   - `hint:richtext` → richText
 *   - `hint:image` → upload relationTo='media'
 *   - `hint:color` → text + admin description
 *   - `hint:textarea` → textarea
 */

interface ToPayloadOptions {
  /** 欄位名稱（給 group/array 內部欄位用）。 */
  name: string;
  /** 是否為 required（外層 unwrap 後決定）。 */
  required?: boolean;
  /** 預設值（從 ZodDefault 取得後傳進來）。 */
  defaultValue?: unknown;
  /** Field label（給後台顯示）。 */
  label?: string;
}

/**
 * 主入口：把一個 block 的 ZodObject schema 轉成 Payload Field[]。
 * 用於 Payload `blocks` field 的單一 Block.fields。
 */
export function zodBlockToPayloadFields(schema: z.ZodTypeAny): Field[] {
  const unwrapped = unwrapZod(schema);
  if (!(unwrapped.schema instanceof z.ZodObject)) {
    throw new Error('zodBlockToPayloadFields 只接受 ZodObject schema');
  }
  const shape = unwrapped.schema.shape as Record<string, z.ZodTypeAny>;
  const fields: Field[] = [];
  for (const [name, prop] of Object.entries(shape)) {
    fields.push(zodTypeToPayloadField(prop, { name }));
  }
  return fields;
}

/**
 * 單一 Zod type → 單一 Payload Field。遞迴處理 group / array。
 */
export function zodTypeToPayloadField(
  schema: z.ZodTypeAny,
  opts: ToPayloadOptions,
): Field {
  const { schema: inner, required, defaultValue, hint } = unwrapZod(schema);
  const finalRequired = opts.required ?? required;
  const finalDefault = opts.defaultValue ?? defaultValue;

  const common = {
    name: opts.name,
    label: opts.label,
    required: finalRequired,
    defaultValue: finalDefault as never,
  };

  // hint 強制覆寫優先
  if (hint === 'richtext') return { ...common, type: 'richText' };
  if (hint === 'image') {
    return { ...common, type: 'upload', relationTo: 'media' };
  }
  if (hint === 'textarea') return { ...common, type: 'textarea' };
  if (hint === 'color') {
    return { ...common, type: 'text', admin: { description: '色碼 hex（含 #）' } };
  }

  // 依 typeName 分支
  if (inner instanceof z.ZodString) {
    // 偵測 max > 200 → textarea
    const maxCheck = inner._def.checks?.find(
      (c): c is { kind: 'max'; value: number } => c.kind === 'max',
    );
    if (maxCheck && maxCheck.value > 200) {
      return { ...common, type: 'textarea' };
    }
    return { ...common, type: 'text' };
  }

  if (inner instanceof z.ZodNumber) {
    return { ...common, type: 'number' };
  }

  if (inner instanceof z.ZodBoolean) {
    return { ...common, type: 'checkbox' };
  }

  if (inner instanceof z.ZodDate) {
    return { ...common, type: 'date' };
  }

  if (inner instanceof z.ZodEnum) {
    const values = inner._def.values as readonly string[];
    return {
      ...common,
      type: 'select',
      options: values.map((v) => ({ label: v, value: v })),
    };
  }

  if (inner instanceof z.ZodNativeEnum) {
    const values = Object.values(inner._def.values as Record<string, string | number>)
      .filter((v): v is string => typeof v === 'string');
    return {
      ...common,
      type: 'select',
      options: values.map((v) => ({ label: v, value: v })),
    };
  }

  if (inner instanceof z.ZodLiteral) {
    const value = inner._def.value;
    if (typeof value === 'string') {
      return {
        ...common,
        type: 'text',
        defaultValue: value,
        admin: { readOnly: true },
      };
    }
    if (typeof value === 'number') {
      return { ...common, type: 'number', defaultValue: value };
    }
    if (typeof value === 'boolean') {
      return { ...common, type: 'checkbox', defaultValue: value };
    }
    return { ...common, type: 'text' };
  }

  if (inner instanceof z.ZodArray) {
    const elementType = inner._def.type as z.ZodTypeAny;
    const { schema: elementInner } = unwrapZod(elementType);
    // 元素是 ZodObject → array of group fields
    if (elementInner instanceof z.ZodObject) {
      const shape = elementInner.shape as Record<string, z.ZodTypeAny>;
      const subFields: Field[] = Object.entries(shape).map(([n, p]) =>
        zodTypeToPayloadField(p, { name: n }),
      );
      return { ...common, type: 'array', fields: subFields };
    }
    // 元素為 primitive → array with 單一 `value` field
    return {
      ...common,
      type: 'array',
      fields: [zodTypeToPayloadField(elementType, { name: 'value' })],
    };
  }

  if (inner instanceof z.ZodObject) {
    // 偵測 imageAssetSchema 形狀（{src, alt, width?, height?}）→ upload
    if (isImageAssetShape(inner)) {
      return { ...common, type: 'upload', relationTo: 'media' };
    }
    const shape = inner.shape as Record<string, z.ZodTypeAny>;
    // optional group（finalRequired === false）→ cascade 讓子欄位也非必填。
    // 為何：Payload `group` 一定有值（省略時預設 {}），若子欄位 required，
    // 即使整個 group 在 Zod 是 .optional()，Payload 仍會驗證內層 required 欄位 →
    // 使用者省略整個 group 時誤報 invalid（例：content-section 無 CTA 卻被要求 cta.label）。
    const subFields: Field[] = Object.entries(shape).map(([n, p]) =>
      zodTypeToPayloadField(p, {
        name: n,
        ...(finalRequired === false ? { required: false } : {}),
      }),
    );
    return { ...common, type: 'group', fields: subFields };
  }

  if (inner instanceof z.ZodUnion || inner instanceof z.ZodDiscriminatedUnion) {
    const options = (inner._def.options ?? []) as z.ZodTypeAny[];
    // 全為 literal → select
    const allLiteral = options.every((o) => unwrapZod(o).schema instanceof z.ZodLiteral);
    if (allLiteral) {
      const values = options.map((o) => {
        const v = (unwrapZod(o).schema as z.ZodLiteral<unknown>)._def.value;
        return String(v);
      });
      return {
        ...common,
        type: 'select',
        options: values.map((v) => ({ label: v, value: v })),
      };
    }
    // fallback：當 JSON 字串存（避免 build 炸）
    return {
      ...common,
      type: 'json',
      admin: { description: 'Union schema fallback：請寫合法 JSON' },
    };
  }

  if (inner instanceof z.ZodRecord) {
    return {
      ...common,
      type: 'array',
      fields: [
        { name: 'key', type: 'text', required: true },
        zodTypeToPayloadField(inner._def.valueType as z.ZodTypeAny, { name: 'value' }),
      ],
    };
  }

  // 最後 fallback：JSON 欄位
  return {
    ...common,
    type: 'json',
    admin: { description: `unsupported zod type fallback` },
  };
}

/**
 * 偵測 ZodObject 是否為「圖片資產」shape（{src, alt, width?, height?}）。
 * blocks-library 的 imageAssetSchema 為此 shape。
 */
function isImageAssetShape(obj: z.ZodObject<z.ZodRawShape>): boolean {
  const shape = obj.shape as Record<string, z.ZodTypeAny>;
  const keys = Object.keys(shape).sort();
  // 必含 src + alt；可選 width / height
  if (!keys.includes('src') || !keys.includes('alt')) return false;
  const allowed = new Set(['src', 'alt', 'width', 'height']);
  return keys.every((k) => allowed.has(k));
}

interface UnwrapResult {
  schema: z.ZodTypeAny;
  required: boolean;
  defaultValue: unknown;
  hint?: string;
}

/**
 * 把 ZodOptional / ZodNullable / ZodDefault / ZodReadonly / ZodEffects 剝開，
 * 取出最內層 schema 與相關 metadata（required / defaultValue / hint）。
 */
function unwrapZod(schema: z.ZodTypeAny): UnwrapResult {
  let current: z.ZodTypeAny = schema;
  let required = true;
  let defaultValue: unknown = undefined;
  let hint: string | undefined;

  // describe() 在最外層讀
  if (current._def.description) {
    const desc = String(current._def.description);
    const match = desc.match(/^hint:(\w+)$/);
    if (match) hint = match[1];
  }

  // 迭代剝殼，最多 10 層防無窮迴圈
  for (let i = 0; i < 10; i += 1) {
    const typeName = current._def.typeName as string | undefined;
    if (typeName === 'ZodOptional') {
      required = false;
      current = current._def.innerType as z.ZodTypeAny;
      continue;
    }
    if (typeName === 'ZodNullable') {
      required = false;
      current = current._def.innerType as z.ZodTypeAny;
      continue;
    }
    if (typeName === 'ZodDefault') {
      const fn = current._def.defaultValue as () => unknown;
      defaultValue = fn();
      required = false;
      current = current._def.innerType as z.ZodTypeAny;
      continue;
    }
    if (typeName === 'ZodReadonly') {
      current = current._def.innerType as z.ZodTypeAny;
      continue;
    }
    if (typeName === 'ZodEffects') {
      current = current._def.schema as z.ZodTypeAny;
      continue;
    }
    break;
  }

  // 內層再讀一次 describe（外層沒設時）
  if (!hint && current._def.description) {
    const desc = String(current._def.description);
    const match = desc.match(/^hint:(\w+)$/);
    if (match) hint = match[1];
  }

  return { schema: current, required, defaultValue, hint };
}
