import { z } from 'zod';

import {
  imageAssetSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

export const TESTIMONIALS_VARIANTS = [
  'grid-3',
  'masonry',
  'single-large',
  'carousel-row',
  'avatar-quote',
  'video-quote',
] as const;

export type TestimonialsVariant = (typeof TESTIMONIALS_VARIANTS)[number];

const testimonialItemSchema = z.object({
  quote: z.string().min(1).max(600),
  authorName: z.string().min(1),
  authorTitle: z.string().max(120).optional(),
  avatar: imageAssetSchema.optional(),
  rating: z.number().int().min(1).max(5).optional(),
  videoUrl: z.string().optional(),
});

export const testimonialsSchema = z.object({
  variant: z.enum(TESTIMONIALS_VARIANTS).default('grid-3'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().max(160).optional(),
  items: z.array(testimonialItemSchema).min(1).max(12),
  motion: motionConfigSchema,
});

export type TestimonialsItem = z.infer<typeof testimonialItemSchema>;
export type TestimonialsProps = z.infer<typeof testimonialsSchema>;

export const testimonialsDefaults: TestimonialsProps = {
  variant: 'grid-3',
  eyebrow: '客戶回饋',
  headline: '他們怎麼說',
  items: [
    {
      quote: '使用後生產力提升 3 倍，再也不想回到舊系統。',
      authorName: '王小明',
      authorTitle: '產品經理',
      rating: 5,
    },
    {
      quote: '介面直覺，團隊上手只花了一個下午。',
      authorName: '李小華',
      authorTitle: '設計師',
      rating: 5,
    },
    {
      quote: '客服回應快，遇到問題很快就被解決。',
      authorName: '陳大文',
      authorTitle: '技術長',
      rating: 4,
    },
  ],
  motion: { variant: 'slideUp', delay: 0 },
};
