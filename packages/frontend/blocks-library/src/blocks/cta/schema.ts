import { z } from 'zod';

import {
  ctaSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

export const CTA_VARIANTS = [
  'centered',
  'split-with-image',
  'gradient-banner',
  'inline-form',
  'dark-banner',
  'newsletter-stack',
] as const;

export type CtaVariant = (typeof CTA_VARIANTS)[number];

export const ctaBlockSchema = z.object({
  variant: z.enum(CTA_VARIANTS).default('centered'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(160),
  subheadline: z.string().max(320).optional(),
  ctas: z.array(ctaSchema).min(1).max(3),
  /** inline-form / newsletter-stack 才會顯示 form。 */
  formPlaceholder: z.string().default('輸入 Email'),
  formSubmitLabel: z.string().default('訂閱'),
  motion: motionConfigSchema,
});

export type CtaProps = z.infer<typeof ctaBlockSchema>;

export const ctaDefaults: CtaProps = {
  variant: 'centered',
  eyebrow: undefined,
  headline: '準備好開始了嗎？',
  subheadline: '不需信用卡，免費試用 14 天。',
  ctas: [
    { label: '立即試用', href: '#signup', variant: 'default', primary: true },
    { label: '聯絡銷售', href: '#contact', variant: 'outline', primary: false },
  ],
  formPlaceholder: '輸入 Email',
  formSubmitLabel: '訂閱',
  motion: { variant: 'slideUp', delay: 0 },
};
