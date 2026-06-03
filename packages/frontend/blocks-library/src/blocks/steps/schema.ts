import { z } from 'zod';

import {
  imageAssetSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

export const STEPS_VARIANTS = [
  'horizontal-line',
  'vertical-stack',
  'numbered-cards',
  'icon-grid',
  'connected-arrow',
  'split-image-side',
] as const;

export type StepsVariant = (typeof STEPS_VARIANTS)[number];

const stepItemSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(400).optional(),
  icon: z.string().optional(),
  image: imageAssetSchema.optional(),
});

export const stepsSchema = z.object({
  variant: z.enum(STEPS_VARIANTS).default('horizontal-line'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().max(160).optional(),
  subheadline: z.string().max(280).optional(),
  items: z.array(stepItemSchema).min(2).max(8),
  motion: motionConfigSchema,
});

export type StepsItem = z.infer<typeof stepItemSchema>;
export type StepsProps = z.infer<typeof stepsSchema>;

export const stepsDefaults: StepsProps = {
  variant: 'horizontal-line',
  eyebrow: '流程',
  headline: '三步驟完成',
  items: [
    { title: '註冊帳號', description: '輸入 Email 即可開始。', icon: 'user' },
    { title: '匯入資料', description: '支援 CSV 與 API 自動同步。', icon: 'upload' },
    { title: '開始分析', description: '即時看見洞察報表。', icon: 'chart' },
  ],
  motion: { variant: 'slideRight', delay: 0 },
};
