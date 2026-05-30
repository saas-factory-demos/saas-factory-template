import { z } from 'zod';

import {
  ctaSchema,
  imageAssetSchema,
  linkItemSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

export const HEADER_VARIANTS = [
  'simple-center',
  'logo-left-links-right',
  'split-logo-center',
  'transparent-overlay',
  'sticky-blur',
  'mega-menu',
] as const;

export type HeaderVariant = (typeof HEADER_VARIANTS)[number];

export const headerSchema = z.object({
  variant: z.enum(HEADER_VARIANTS).default('logo-left-links-right'),
  brandName: z.string().min(1),
  logo: imageAssetSchema.optional(),
  links: z.array(linkItemSchema).max(8).default([]),
  cta: ctaSchema.optional(),
  motion: motionConfigSchema,
});

export type HeaderProps = z.infer<typeof headerSchema>;

export const headerDefaults: HeaderProps = {
  variant: 'logo-left-links-right',
  brandName: 'Brand',
  logo: undefined,
  links: [
    { label: '首頁', href: '/', external: false },
    { label: '產品', href: '/products', external: false },
    { label: '關於', href: '/about', external: false },
    { label: '聯絡', href: '/contact', external: false },
  ],
  cta: { label: '開始使用', href: '#start', variant: 'default', primary: true },
  motion: { variant: 'fadeIn', delay: 0 },
};
