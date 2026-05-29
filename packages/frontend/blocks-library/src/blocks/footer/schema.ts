import { z } from 'zod';

import {
  imageAssetSchema,
  linkItemSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

export const FOOTER_VARIANTS = [
  'minimal-centered',
  'multi-column',
  'newsletter-cta',
  'social-icons',
  'dark-corporate',
  'compact-bar',
] as const;

export type FooterVariant = (typeof FOOTER_VARIANTS)[number];

const footerColumnSchema = z.object({
  title: z.string().min(1),
  links: z.array(linkItemSchema).max(8).default([]),
});

export const footerSchema = z.object({
  variant: z.enum(FOOTER_VARIANTS).default('multi-column'),
  brandName: z.string().min(1),
  logo: imageAssetSchema.optional(),
  tagline: z.string().max(200).optional(),
  columns: z.array(footerColumnSchema).max(5).default([]),
  socialLinks: z.array(linkItemSchema).max(8).default([]),
  copyright: z.string().default(''),
  motion: motionConfigSchema,
});

export type FooterColumn = z.infer<typeof footerColumnSchema>;
export type FooterProps = z.infer<typeof footerSchema>;

export const footerDefaults: FooterProps = {
  variant: 'multi-column',
  brandName: 'Brand',
  logo: undefined,
  tagline: '為品牌打造更好的數位體驗',
  columns: [
    {
      title: '產品',
      links: [
        { label: '功能', href: '/features', external: false },
        { label: '價格', href: '/pricing', external: false },
      ],
    },
    {
      title: '公司',
      links: [
        { label: '關於', href: '/about', external: false },
        { label: '聯絡', href: '/contact', external: false },
      ],
    },
  ],
  socialLinks: [],
  copyright: '© 2025 Brand. All rights reserved.',
  motion: { variant: 'fadeIn', delay: 0 },
};
