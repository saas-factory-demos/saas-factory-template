import { z } from 'zod';

import { motionConfigSchema } from '../_shared/schema-helpers.js';

export const STATS_VARIANTS = [
  'horizontal-3',
  'horizontal-4',
  'grid-2x2',
  'with-headline-left',
  'card-callouts',
  'big-numbers',
] as const;

export type StatsVariant = (typeof STATS_VARIANTS)[number];

const statItemSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1).max(80),
  description: z.string().max(120).optional(),
});

export const statsSchema = z.object({
  variant: z.enum(STATS_VARIANTS).default('horizontal-3'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().max(160).optional(),
  subheadline: z.string().max(280).optional(),
  items: z.array(statItemSchema).min(2).max(8),
  motion: motionConfigSchema,
});

export type StatsItem = z.infer<typeof statItemSchema>;
export type StatsProps = z.infer<typeof statsSchema>;

export const statsDefaults: StatsProps = {
  variant: 'horizontal-3',
  eyebrow: undefined,
  headline: '數字會說話',
  subheadline: undefined,
  items: [
    { value: '10K+', label: '活躍使用者', description: '每月持續增加' },
    { value: '99.9%', label: '服務可用率', description: 'SLA 保障' },
    { value: '5★', label: '滿意度評分', description: '基於 1200 則評價' },
  ],
  motion: { variant: 'slideUp', delay: 0 },
};
