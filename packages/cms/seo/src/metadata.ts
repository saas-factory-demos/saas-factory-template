import type { SeoMetadata } from './types.js';

/**
 * 把 SeoMetadata 合併進 Next.js 15 metadata 物件結構。
 *
 * 不直接 import next 型別（避免 peer dep），由 consumer 自己接型別。
 */
export function toNextMetadata(seo: SeoMetadata, fallback: {
  title: string;
  description?: string;
  defaultOgImage?: string;
}): {
  title: string;
  description: string | undefined;
  alternates: { canonical?: string };
  robots: { index: boolean; follow: boolean };
  openGraph: {
    title: string;
    description: string | undefined;
    images: string[];
    type: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string | undefined;
    images: string[];
  };
} {
  const title = seo.metaTitle ?? fallback.title;
  const description = seo.metaDescription ?? fallback.description;
  const ogImg = seo.ogImage ?? fallback.defaultOgImage;
  return {
    title,
    description,
    alternates: { canonical: seo.canonical },
    robots: { index: !seo.noindex, follow: !seo.nofollow },
    openGraph: {
      title: seo.ogTitle ?? title,
      description: seo.ogDescription ?? description,
      images: ogImg ? [ogImg] : [],
      type: seo.ogType ?? 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle ?? title,
      description: seo.ogDescription ?? description,
      images: ogImg ? [ogImg] : [],
    },
  };
}
