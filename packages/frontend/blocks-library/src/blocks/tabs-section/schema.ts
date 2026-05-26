import { z } from 'zod';

import {
  imageAssetSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

export const TABS_SECTION_VARIANTS = [
  'horizontal-pills',
  'horizontal-underline',
  'vertical-side',
  'card-stack',
  'feature-screenshot',
  'compact-bar',
] as const;

export type TabsSectionVariant = (typeof TABS_SECTION_VARIANTS)[number];

const tabPanelSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  title: z.string().max(160).optional(),
  body: z.string().max(800).optional(),
  image: imageAssetSchema.optional(),
});

export const tabsSectionSchema = z.object({
  variant: z.enum(TABS_SECTION_VARIANTS).default('horizontal-underline'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().max(160).optional(),
  panels: z.array(tabPanelSchema).min(2).max(8),
  motion: motionConfigSchema,
});

export type TabsSectionPanel = z.infer<typeof tabPanelSchema>;
export type TabsSectionProps = z.infer<typeof tabsSectionSchema>;

export const tabsSectionDefaults: TabsSectionProps = {
  variant: 'horizontal-underline',
  eyebrow: undefined,
  headline: '功能總覽',
  panels: [
    { key: 'design', label: '設計', title: '視覺一致', body: '從色彩到排版，全部對齊 design tokens。' },
    { key: 'engineering', label: '工程', title: '型別安全', body: 'TypeScript strict，從 schema 到 UI 一條龍。' },
    { key: 'motion', label: '動畫', title: 'Level 1-5', body: '動畫強度可調，自動降級 reduce-motion。' },
  ],
  motion: { variant: 'fadeIn', delay: 0 },
};
