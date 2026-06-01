import { z } from 'zod';

import {
  ctaSchema,
  imageAssetSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

export const CONTENT_SECTION_VARIANTS = [
  'two-column-text',
  'image-left-text-right',
  'image-right-text-left',
  'centered-prose',
  'media-stack',
  'quote-callout',
] as const;

export type ContentSectionVariant = (typeof CONTENT_SECTION_VARIANTS)[number];

export const contentSectionSchema = z.object({
  variant: z.enum(CONTENT_SECTION_VARIANTS).default('centered-prose'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(160),
  body: z.string().min(1).max(2000),
  /** 引言 / 重點摘要（quote-callout / centered-prose 適用）。 */
  highlightedQuote: z.string().max(400).optional(),
  image: imageAssetSchema.optional(),
  cta: ctaSchema.optional(),
  motion: motionConfigSchema,
});

export type ContentSectionProps = z.infer<typeof contentSectionSchema>;

export const contentSectionDefaults: ContentSectionProps = {
  variant: 'centered-prose',
  eyebrow: undefined,
  headline: '關於我們',
  body: '我們相信，好的工具應該讓人專注於創造，而不是被介面困住。這就是為什麼我們花了三年時間，打造這套系統。',
  highlightedQuote: '讓設計師像設計師，讓工程師像工程師。',
  image: undefined,
  cta: { label: '了解更多', href: '#about', variant: 'outline', primary: false },
  motion: { variant: 'slideUp', delay: 0 },
};
