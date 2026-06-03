import { csvRow } from '../escape.js';

import type { FeedGenerator, FeedItem } from '../types.js';

/**
 * TikTok 商品目錄（Catalog）欄位。
 * 參考：ads.tiktok.com/marketing_api/docs Catalog Product Feed。
 */
const TIKTOK_HEADER = [
  'sku_id',
  'title',
  'description',
  'availability',
  'condition',
  'price',
  'sale_price',
  'link',
  'image_link',
  'brand',
  'product_category',
  'google_product_category',
  'item_group_id',
  'gender',
  'age_group',
  'color',
  'size',
  'material',
  'additional_image_link',
];

/**
 * TikTok 商品 feed CSV 產生器。
 */
export const tiktokGenerator: FeedGenerator = {
  format: 'tiktok',
  contentType: 'text/csv; charset=utf-8',
  generate(items: FeedItem[]): string {
    const rows: string[] = [TIKTOK_HEADER.join(',')];
    for (const item of items) {
      rows.push(
        csvRow([
          item.id,
          item.title,
          item.description,
          item.availability,
          item.condition,
          item.price,
          item.salePrice,
          item.link,
          item.imageLink,
          item.brand,
          item.productType,
          item.googleProductCategory,
          item.itemGroupId,
          item.gender,
          item.ageGroup,
          item.color,
          item.size,
          item.material,
          (item.additionalImageLinks ?? []).join(','),
        ]),
      );
    }
    return rows.join('\n');
  },
};
