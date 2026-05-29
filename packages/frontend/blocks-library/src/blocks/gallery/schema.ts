import { z } from 'zod';

import {
  imageAssetSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

export const GALLERY_VARIANTS = [
  'grid-3',
  'grid-4',
  'masonry',
  'carousel-strip',
  'lightbox-grid',
  'split-feature',
] as const;

export type GalleryVariant = (typeof GALLERY_VARIANTS)[number];

const galleryItemSchema = z.object({
  image: imageAssetSchema,
  caption: z.string().max(200).optional(),
  category: z.string().optional(),
});

export const gallerySchema = z.object({
  variant: z.enum(GALLERY_VARIANTS).default('grid-3'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().max(160).optional(),
  items: z.array(galleryItemSchema).min(1).max(48),
  motion: motionConfigSchema,
});

export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type GalleryProps = z.infer<typeof gallerySchema>;

export const galleryDefaults: GalleryProps = {
  variant: 'grid-3',
  eyebrow: '作品',
  headline: '精選案例',
  items: [
    { image: { src: '/placeholder/1.jpg', alt: '案例一' }, caption: '案例一' },
    { image: { src: '/placeholder/2.jpg', alt: '案例二' }, caption: '案例二' },
    { image: { src: '/placeholder/3.jpg', alt: '案例三' }, caption: '案例三' },
  ],
  motion: { variant: 'fadeIn', delay: 0 },
};
