import { csvRow } from '../escape.js';

import type { FeedGenerator, FeedItem } from '../types.js';

/**
 * Meta Catalog 欄位定義（依官方規格順序）。
 * 參考：developers.facebook.com/docs/marketing-api/catalog/reference
 */
const META_HEADER = [
  'id',
  'title',
  'description',
  'availability',
  'condition',
  'price',
  'link',
  'image_link',
  'brand',
  'sale_price',
  'gtin',
  'mpn',
  'product_type',
  'google_product_category',
  'item_group_id',
  'color',
  'size',
  'material',
  'gender',
  'age_group',
  'additional_image_link',
];

/**
 * Meta Catalog CSV 產生器（FB / IG 廣告商品目錄）。
 */
export const metaCatalogGenerator: FeedGenerator = {
  format: 'meta-catalog',
  contentType: 'text/csv; charset=utf-8',
  generate(items: FeedItem[]): string {
    const rows: string[] = [META_HEADER.join(',')];
    for (const item of items) {
      rows.push(
        csvRow([
          item.id,
          item.title,
          item.description,
          item.availability,
          item.condition,
          item.price,
          item.link,
          item.imageLink,
          item.brand,
          item.salePrice,
          item.gtin,
          item.mpn,
          item.productType,
          item.googleProductCategory,
          item.itemGroupId,
          item.color,
          item.size,
          item.material,
          item.gender,
          item.ageGroup,
          (item.additionalImageLinks ?? []).join(','),
        ]),
      );
    }
    return rows.join('\n');
  },
};
