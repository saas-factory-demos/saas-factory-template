import { csvRow } from '../escape.js';

import type { FeedGenerator, FeedItem } from '../types.js';

/**
 * LINE LAP（LINE Ads Platform）動態商品廣告 feed 欄位。
 */
const LAP_HEADER = [
  'product_id',
  'name',
  'description',
  'price',
  'sale_price',
  'currency',
  'product_url',
  'image_url',
  'availability',
  'brand',
  'category',
  'item_group_id',
];

/**
 * 從含幣別字串拆出金額與幣別，例如「890 TWD」→「890 / TWD」。
 */
function splitPrice(raw: string | undefined): { amount: string; currency: string } {
  if (!raw) return { amount: '', currency: '' };
  const [amount, currency] = raw.split(' ');
  return { amount: amount ?? '', currency: currency ?? '' };
}

/**
 * LINE LAP feed CSV 產生器。
 */
export const lineLapGenerator: FeedGenerator = {
  format: 'line-lap',
  contentType: 'text/csv; charset=utf-8',
  generate(items: FeedItem[]): string {
    const rows: string[] = [LAP_HEADER.join(',')];
    for (const item of items) {
      const price = splitPrice(item.price);
      const sale = splitPrice(item.salePrice);
      rows.push(
        csvRow([
          item.id,
          item.title,
          item.description,
          price.amount,
          sale.amount || undefined,
          price.currency,
          item.link,
          item.imageLink,
          item.availability,
          item.brand,
          item.productType,
          item.itemGroupId,
        ]),
      );
    }
    return rows.join('\n');
  },
};
