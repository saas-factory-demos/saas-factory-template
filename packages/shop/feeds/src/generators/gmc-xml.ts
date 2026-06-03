import { escapeXml } from '../escape.js';

import type { FeedGenerator, FeedItem, FeedMetadata } from '../types.js';

/**
 * 產生單一 item 的 XML 片段。
 */
function renderItem(item: FeedItem): string {
  const lines: string[] = ['    <item>'];
  const push = (tag: string, value?: string): void => {
    if (value === undefined || value === '') return;
    lines.push(`      <${tag}>${escapeXml(value)}</${tag}>`);
  };
  push('g:id', item.id);
  push('g:title', item.title);
  push('g:description', item.description);
  push('g:link', item.link);
  push('g:image_link', item.imageLink);
  for (const extra of item.additionalImageLinks ?? []) {
    push('g:additional_image_link', extra);
  }
  push('g:availability', item.availability);
  push('g:price', item.price);
  push('g:sale_price', item.salePrice);
  push('g:brand', item.brand);
  push('g:gtin', item.gtin);
  push('g:mpn', item.mpn);
  push('g:condition', item.condition);
  push('g:product_type', item.productType);
  push('g:google_product_category', item.googleProductCategory);
  push('g:gender', item.gender);
  push('g:age_group', item.ageGroup);
  push('g:color', item.color);
  push('g:size', item.size);
  push('g:material', item.material);
  push('g:item_group_id', item.itemGroupId);
  lines.push('    </item>');
  return lines.join('\n');
}

/**
 * Google Merchant Center XML 產生器（RSS 2.0 + g: 命名空間）。
 */
export const gmcXmlGenerator: FeedGenerator = {
  format: 'gmc-xml',
  contentType: 'application/xml; charset=utf-8',
  generate(items: FeedItem[], metadata: FeedMetadata): string {
    const head = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
      '  <channel>',
      `    <title>${escapeXml(metadata.title)}</title>`,
      `    <link>${escapeXml(metadata.link)}</link>`,
      `    <description>${escapeXml(metadata.description)}</description>`,
    ];
    const body = items.map(renderItem);
    const tail = ['  </channel>', '</rss>'];
    return [...head, ...body, ...tail].join('\n');
  },
};
