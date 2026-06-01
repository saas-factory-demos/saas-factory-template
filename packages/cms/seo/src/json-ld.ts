/**
 * JSON-LD 結構化資料產生器。
 *
 * 回傳純物件，前端用 `<script type="application/ld+json">{JSON.stringify(...)}</script>` 嵌入。
 */

export interface JsonLdObject {
  '@context': 'https://schema.org';
  '@type': string;
  [k: string]: unknown;
}

/** Organization。 */
export function organizationJsonLd(input: {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  contactEmail?: string;
}): JsonLdObject {
  const out: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name,
    url: input.url,
  };
  if (input.logo) out.logo = input.logo;
  if (input.sameAs && input.sameAs.length > 0) out.sameAs = input.sameAs;
  if (input.contactEmail) {
    out.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: input.contactEmail,
    };
  }
  return out;
}

/** Article（部落格文章）。 */
export function articleJsonLd(input: {
  headline: string;
  description?: string;
  image?: string;
  authorName: string;
  publisherName: string;
  publisherLogo?: string;
  datePublished: Date;
  dateModified?: Date;
  url: string;
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    image: input.image,
    author: { '@type': 'Person', name: input.authorName },
    publisher: {
      '@type': 'Organization',
      name: input.publisherName,
      ...(input.publisherLogo
        ? { logo: { '@type': 'ImageObject', url: input.publisherLogo } }
        : {}),
    },
    datePublished: input.datePublished.toISOString(),
    dateModified: (input.dateModified ?? input.datePublished).toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
  };
}

/** Product（含 Offer + 可選 AggregateRating）。 */
export function productJsonLd(input: {
  name: string;
  description?: string;
  image?: string[];
  sku?: string;
  brand?: string;
  price: number;
  priceCurrency: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  url: string;
  rating?: { value: number; reviewCount: number };
}): JsonLdObject {
  const out: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    image: input.image,
    sku: input.sku,
    brand: input.brand ? { '@type': 'Brand', name: input.brand } : undefined,
    offers: {
      '@type': 'Offer',
      url: input.url,
      price: input.price,
      priceCurrency: input.priceCurrency,
      availability: `https://schema.org/${input.availability ?? 'InStock'}`,
    },
  };
  if (input.rating) {
    out.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.rating.value,
      reviewCount: input.rating.reviewCount,
    };
  }
  return out;
}

/** Course（線上課程）。 */
export function courseJsonLd(input: {
  name: string;
  description: string;
  provider: { name: string; url: string };
  instructorName?: string;
  url: string;
  image?: string;
}): JsonLdObject {
  const out: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: input.name,
    description: input.description,
    provider: {
      '@type': 'Organization',
      name: input.provider.name,
      sameAs: input.provider.url,
    },
    url: input.url,
    image: input.image,
  };
  if (input.instructorName) {
    out.instructor = { '@type': 'Person', name: input.instructorName };
  }
  return out;
}

/** BreadcrumbList。 */
export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** FAQPage。 */
export function faqJsonLd(items: Array<{ question: string; answer: string }>): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  };
}

/** WebSite（含搜尋框）。 */
export function websiteJsonLd(input: {
  name: string;
  url: string;
  searchUrlTemplate?: string;
}): JsonLdObject {
  const out: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: input.name,
    url: input.url,
  };
  if (input.searchUrlTemplate) {
    out.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: input.searchUrlTemplate,
      },
      'query-input': 'required name=search_term_string',
    };
  }
  return out;
}
