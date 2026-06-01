import { z } from 'zod';

import { motionConfigSchema } from '../_shared/schema-helpers.js';

export const FAQ_VARIANTS = [
  'accordion-single',
  'accordion-two-column',
  'cards-grid',
  'inline-list',
  'with-cta-aside',
  'stacked-callouts',
] as const;

export type FaqVariant = (typeof FAQ_VARIANTS)[number];

const faqItemSchema = z.object({
  question: z.string().min(1).max(160),
  answer: z.string().min(1).max(600),
});

export const faqSchema = z.object({
  variant: z.enum(FAQ_VARIANTS).default('accordion-single'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().max(160).optional(),
  subheadline: z.string().max(280).optional(),
  items: z.array(faqItemSchema).min(2).max(20),
  contactHint: z.string().max(200).optional(),
  motion: motionConfigSchema,
});

export type FaqItem = z.infer<typeof faqItemSchema>;
export type FaqProps = z.infer<typeof faqSchema>;

export const faqDefaults: FaqProps = {
  variant: 'accordion-single',
  eyebrow: 'FAQ',
  headline: '常見問題',
  subheadline: '找不到答案？歡迎來信。',
  items: [
    { question: '可以試用多久？', answer: '免費試用 14 天，期間可隨時取消，無需信用卡。' },
    { question: '如何升級方案？', answer: '進入帳戶設定 → 訂閱方案，點選想要的方案後系統會自動計算費用差額。' },
    { question: '支援哪些金流？', answer: '支援藍新、綠界、LINE Pay、街口、Stripe 等主流金流。' },
  ],
  contactHint: '還有其他問題？聯絡我們',
  motion: { variant: 'slideUp', delay: 0 },
};
