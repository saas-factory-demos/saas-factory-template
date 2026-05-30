import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import { zodBlockToPayloadFields, zodTypeToPayloadField } from '../index.js';

describe('zodBlockToPayloadFields', () => {
  it('ZodString → text', () => {
    const schema = z.object({ title: z.string() });
    const fields = zodBlockToPayloadFields(schema);
    expect(fields).toHaveLength(1);
    expect(fields[0]).toMatchObject({ name: 'title', type: 'text', required: true });
  });

  it('ZodString max>200 → textarea', () => {
    const schema = z.object({ body: z.string().max(500) });
    const fields = zodBlockToPayloadFields(schema);
    expect(fields[0]).toMatchObject({ name: 'body', type: 'textarea' });
  });

  it('ZodNumber → number', () => {
    const schema = z.object({ count: z.number() });
    expect(zodBlockToPayloadFields(schema)[0]).toMatchObject({ type: 'number' });
  });

  it('ZodBoolean → checkbox', () => {
    const schema = z.object({ enabled: z.boolean() });
    expect(zodBlockToPayloadFields(schema)[0]).toMatchObject({ type: 'checkbox' });
  });

  it('ZodEnum → select with options', () => {
    const schema = z.object({ variant: z.enum(['a', 'b', 'c']) });
    const f = zodBlockToPayloadFields(schema)[0];
    expect(f).toMatchObject({
      type: 'select',
      options: [
        { label: 'a', value: 'a' },
        { label: 'b', value: 'b' },
        { label: 'c', value: 'c' },
      ],
    });
  });

  it('ZodOptional → required=false', () => {
    const schema = z.object({ tag: z.string().optional() });
    expect(zodBlockToPayloadFields(schema)[0]).toMatchObject({
      type: 'text',
      required: false,
    });
  });

  it('ZodDefault → defaultValue + required=false', () => {
    const schema = z.object({ level: z.number().default(5) });
    expect(zodBlockToPayloadFields(schema)[0]).toMatchObject({
      type: 'number',
      defaultValue: 5,
      required: false,
    });
  });

  it('ZodNullable → required=false', () => {
    const schema = z.object({ x: z.string().nullable() });
    expect(zodBlockToPayloadFields(schema)[0]).toMatchObject({ required: false });
  });

  it('ZodArray of primitive → array with value field', () => {
    const schema = z.object({ tags: z.array(z.string()) });
    const f = zodBlockToPayloadFields(schema)[0];
    expect(f).toMatchObject({
      type: 'array',
      fields: [{ name: 'value', type: 'text' }],
    });
  });

  it('ZodArray of object → array with shape fields', () => {
    const schema = z.object({
      items: z.array(z.object({ label: z.string(), order: z.number() })),
    });
    const f = zodBlockToPayloadFields(schema)[0];
    expect(f).toMatchObject({
      type: 'array',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'order', type: 'number' },
      ],
    });
  });

  it('ZodObject → group', () => {
    const schema = z.object({
      seo: z.object({ title: z.string(), keywords: z.string().optional() }),
    });
    const f = zodBlockToPayloadFields(schema)[0];
    expect(f).toMatchObject({
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'keywords', type: 'text', required: false },
      ],
    });
  });

  it('optional group（.optional()）→ 子欄位 cascade 為非必填', () => {
    // 回歸測試：Payload group 一定有值（省略時 {}），若子欄位 required，
    // 使用者省略整個 optional group 時會誤報 invalid（content-section 無 CTA 案例）。
    // 修正後 optional group 的 required 子欄位應 cascade 成 required:false。
    const schema = z.object({
      cta: z
        .object({
          label: z.string().min(1),
          href: z.string().min(1),
          variant: z.string().optional(),
        })
        .optional(),
    });
    const f = zodBlockToPayloadFields(schema)[0];
    expect(f).toMatchObject({
      name: 'cta',
      type: 'group',
      required: false,
      fields: [
        { name: 'label', type: 'text', required: false },
        { name: 'href', type: 'text', required: false },
        { name: 'variant', type: 'text', required: false },
      ],
    });
  });

  it('required group → 子欄位維持原 required（不 cascade）', () => {
    // 對照：非 optional group，子欄位 required 應保留
    const schema = z.object({
      meta: z.object({ title: z.string().min(1), note: z.string().optional() }),
    });
    const f = zodBlockToPayloadFields(schema)[0];
    expect(f).toMatchObject({
      name: 'meta',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'note', type: 'text', required: false },
      ],
    });
  });

  it('imageAssetSchema shape → upload relationTo media', () => {
    const imageAsset = z.object({
      src: z.string(),
      alt: z.string().default(''),
      width: z.number().optional(),
      height: z.number().optional(),
    });
    const schema = z.object({ image: imageAsset });
    const f = zodBlockToPayloadFields(schema)[0];
    expect(f).toMatchObject({ type: 'upload', relationTo: 'media' });
  });

  it('ZodLiteral string → text readOnly with defaultValue', () => {
    const schema = z.object({ kind: z.literal('hero') });
    const f = zodBlockToPayloadFields(schema)[0];
    expect(f).toMatchObject({
      type: 'text',
      defaultValue: 'hero',
      admin: { readOnly: true },
    });
  });

  it('ZodUnion of literals → select', () => {
    const schema = z.object({
      level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    });
    const f = zodBlockToPayloadFields(schema)[0];
    expect(f).toMatchObject({
      type: 'select',
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
      ],
    });
  });

  it('ZodEffects (refine) → unwraps to inner', () => {
    const schema = z.object({
      slug: z.string().refine((s) => s.length > 0, 'required'),
    });
    expect(zodBlockToPayloadFields(schema)[0]).toMatchObject({ type: 'text' });
  });

  it('describe("hint:richtext") → richText override', () => {
    const schema = z.object({ body: z.string().describe('hint:richtext') });
    expect(zodBlockToPayloadFields(schema)[0]).toMatchObject({ type: 'richText' });
  });

  it('describe("hint:image") → upload override', () => {
    const schema = z.object({ thumb: z.string().describe('hint:image') });
    expect(zodBlockToPayloadFields(schema)[0]).toMatchObject({
      type: 'upload',
      relationTo: 'media',
    });
  });

  it('describe("hint:color") → text + admin description', () => {
    const schema = z.object({ bg: z.string().describe('hint:color') });
    const f = zodBlockToPayloadFields(schema)[0];
    expect(f).toMatchObject({ type: 'text' });
    expect((f as { admin?: { description?: string } }).admin?.description).toContain('色碼');
  });

  it('ZodDate → date', () => {
    const schema = z.object({ when: z.date() });
    expect(zodBlockToPayloadFields(schema)[0]).toMatchObject({ type: 'date' });
  });

  it('ZodRecord → array of key/value', () => {
    const schema = z.object({ meta: z.record(z.string()) });
    const f = zodBlockToPayloadFields(schema)[0];
    expect(f).toMatchObject({
      type: 'array',
      fields: [
        { name: 'key', type: 'text' },
        { name: 'value', type: 'text' },
      ],
    });
  });

  it('non-object root → throws', () => {
    expect(() => zodBlockToPayloadFields(z.string())).toThrow(/只接受 ZodObject/);
  });

  it('nested optional+default+effects 組合', () => {
    const schema = z.object({
      meta: z
        .object({ tag: z.string().optional() })
        .default({ tag: undefined })
        .refine(() => true),
    });
    const f = zodBlockToPayloadFields(schema)[0]!;
    expect(f.type).toBe('group');
  });
});

describe('zodTypeToPayloadField', () => {
  it('exported for arbitrary field generation', () => {
    const f = zodTypeToPayloadField(z.string(), { name: 'x' });
    expect(f).toMatchObject({ name: 'x', type: 'text' });
  });
});
