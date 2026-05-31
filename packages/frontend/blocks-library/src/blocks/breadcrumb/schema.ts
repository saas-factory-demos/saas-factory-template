import { z } from 'zod';

import {
  linkItemSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

export const BREADCRUMB_VARIANTS = [
  'simple-chevron',
  'simple-slash',
  'pill-style',
  'underline-style',
  'with-page-title',
  'compact-mobile',
] as const;

export type BreadcrumbVariant = (typeof BREADCRUMB_VARIANTS)[number];

export const breadcrumbSchema = z.object({
  variant: z.enum(BREADCRUMB_VARIANTS).default('simple-chevron'),
  items: z.array(linkItemSchema).min(1).max(8),
  currentTitle: z.string().optional(),
  motion: motionConfigSchema,
});

export type BreadcrumbProps = z.infer<typeof breadcrumbSchema>;

export const breadcrumbDefaults: BreadcrumbProps = {
  variant: 'simple-chevron',
  items: [
    { label: '首頁', href: '/', external: false },
    { label: '部落格', href: '/blog', external: false },
    { label: '本文', href: '#', external: false },
  ],
  currentTitle: undefined,
  motion: { variant: 'fadeIn', delay: 0 },
};
