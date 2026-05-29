import { z } from 'zod';

import {
  ctaSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

export const PRICING_TABLE_VARIANTS = [
  'three-tier-cards',
  'two-tier-toggle',
  'comparison-matrix',
  'single-highlight',
  'four-tier-compact',
  'feature-list-stack',
] as const;

export type PricingTableVariant = (typeof PRICING_TABLE_VARIANTS)[number];

const pricingTierSchema = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  priceSuffix: z.string().default('/月'),
  description: z.string().max(200).optional(),
  features: z.array(z.string()).min(1).max(20),
  highlighted: z.boolean().default(false),
  cta: ctaSchema,
});

export const pricingTableSchema = z.object({
  variant: z.enum(PRICING_TABLE_VARIANTS).default('three-tier-cards'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().max(160).optional(),
  subheadline: z.string().max(280).optional(),
  tiers: z.array(pricingTierSchema).min(1).max(4),
  motion: motionConfigSchema,
});

export type PricingTier = z.infer<typeof pricingTierSchema>;
export type PricingTableProps = z.infer<typeof pricingTableSchema>;

export const pricingTableDefaults: PricingTableProps = {
  variant: 'three-tier-cards',
  eyebrow: 'Pricing',
  headline: '簡單透明的方案',
  subheadline: '依需求挑選方案，隨時可升級。',
  tiers: [
    {
      name: 'Starter',
      price: 'NT$0',
      priceSuffix: '/月',
      description: '個人或試用者',
      features: ['10 個專案', '社群支援', '基本分析'],
      highlighted: false,
      cta: { label: '免費開始', href: '#starter', variant: 'outline', primary: false },
    },
    {
      name: 'Pro',
      price: 'NT$890',
      priceSuffix: '/月',
      description: '專業團隊使用',
      features: ['無限專案', 'Email 客服', '進階分析', '自訂網域'],
      highlighted: true,
      cta: { label: '升級 Pro', href: '#pro', variant: 'default', primary: true },
    },
    {
      name: 'Business',
      price: 'NT$2,990',
      priceSuffix: '/月',
      description: '企業最佳選擇',
      features: ['全部 Pro 功能', '專屬客戶經理', 'SLA 保證', '客製化整合'],
      highlighted: false,
      cta: { label: '聯絡銷售', href: '#business', variant: 'outline', primary: false },
    },
  ],
  motion: { variant: 'slideUp', delay: 0 },
};
