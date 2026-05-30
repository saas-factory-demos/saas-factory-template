import { z } from 'zod';

import { motionConfigSchema } from '../_shared/schema-helpers.js';

export const NEWSLETTER_VARIANTS = [
  'inline-bar',
  'centered-card',
  'split-with-image',
  'minimal-input',
  'incentive-callout',
  'overlay-banner',
] as const;

export type NewsletterVariant = (typeof NEWSLETTER_VARIANTS)[number];

export const newsletterSchema = z.object({
  variant: z.enum(NEWSLETTER_VARIANTS).default('centered-card'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(160),
  subheadline: z.string().max(280).optional(),
  emailPlaceholder: z.string().default('輸入 Email'),
  submitLabel: z.string().default('訂閱'),
  /** 訂閱獎勵說明，例如「立即獲得 10% 折扣碼」。 */
  incentive: z.string().max(200).optional(),
  privacyNote: z.string().max(200).default('我們不會與第三方分享你的 Email。'),
  motion: motionConfigSchema,
});

export type NewsletterProps = z.infer<typeof newsletterSchema>;

export const newsletterDefaults: NewsletterProps = {
  variant: 'centered-card',
  eyebrow: undefined,
  headline: '訂閱電子報',
  subheadline: '每月一封，分享產業洞察與產品更新。',
  emailPlaceholder: '輸入 Email',
  submitLabel: '訂閱',
  incentive: undefined,
  privacyNote: '我們不會與第三方分享你的 Email。',
  motion: { variant: 'fadeIn', delay: 0 },
};
