import { z } from 'zod';

/** 圖片資產的共用 schema（URL + 替代文字 + 可選尺寸）。 */
export const imageAssetSchema = z.object({
  src: z.string().min(1, 'image src required'),
  alt: z.string().default(''),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

/** CTA 按鈕的共用 schema。 */
export const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  variant: z
    .enum(['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'])
    .default('default'),
  /** 是否為主要 CTA（一個 block 內只該有 1 個）。 */
  primary: z.boolean().default(false),
});

/** 連結項目（footer / nav / breadcrumb 共用）。 */
export const linkItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  /** 是否為外部連結。 */
  external: z.boolean().default(false),
});

/** 動畫設定（每個 block 可帶獨立 motion variant / delay）。 */
export const motionConfigSchema = z
  .object({
    variant: z
      .enum(['fadeIn', 'slideUp', 'slideRight', 'scale'])
      .default('slideUp'),
    delay: z.number().min(0).max(2).default(0),
    /** 若指定 level 會覆蓋 Context；不填則跟隨 useMotionLevel。 */
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  })
  .default({ variant: 'slideUp', delay: 0 });

export type ImageAsset = z.infer<typeof imageAssetSchema>;
export type CtaConfig = z.infer<typeof ctaSchema>;
export type LinkItem = z.infer<typeof linkItemSchema>;
export type MotionConfig = z.infer<typeof motionConfigSchema>;
