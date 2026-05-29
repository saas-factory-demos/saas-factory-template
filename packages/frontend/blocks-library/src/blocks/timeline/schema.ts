import { z } from 'zod';

import { motionConfigSchema } from '../_shared/schema-helpers.js';

export const TIMELINE_VARIANTS = [
  'vertical-line',
  'horizontal-steps',
  'alternating-side',
  'milestone-cards',
  'minimal-list',
  'numbered-stack',
] as const;

export type TimelineVariant = (typeof TIMELINE_VARIANTS)[number];

const timelineItemSchema = z.object({
  date: z.string().min(1),
  title: z.string().min(1).max(120),
  description: z.string().max(400).optional(),
  icon: z.string().optional(),
});

export const timelineSchema = z.object({
  variant: z.enum(TIMELINE_VARIANTS).default('vertical-line'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().max(160).optional(),
  items: z.array(timelineItemSchema).min(2).max(20),
  motion: motionConfigSchema,
});

export type TimelineItem = z.infer<typeof timelineItemSchema>;
export type TimelineProps = z.infer<typeof timelineSchema>;

export const timelineDefaults: TimelineProps = {
  variant: 'vertical-line',
  eyebrow: '里程碑',
  headline: '我們的歷程',
  items: [
    { date: '2020', title: '公司成立', description: '從車庫起家，三人團隊。' },
    { date: '2022', title: 'Pre-A 輪募資', description: '完成首輪 NT$3,000 萬募資。' },
    { date: '2024', title: '用戶破萬', description: '產品邁入規模化階段。' },
  ],
  motion: { variant: 'slideUp', delay: 0 },
};
