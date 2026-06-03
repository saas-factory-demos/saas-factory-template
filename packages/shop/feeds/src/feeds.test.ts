import { describe, expect, it } from 'vitest';

import { FeedService } from './service.js';

import type { FeedItem, FeedMetadata } from './types.js';

const metadata: FeedMetadata = {
  title: '測試商店',
  description: '優質商品 & 服務',
  link: 'https://shop.example.com',
};

const sampleItems: FeedItem[] = [
  {
    id: 'SKU-001',
    title: '帆布托特包',
    description: '輕巧耐用，含「外口袋」設計',
    link: 'https://shop.example.com/p/sku-001',
    imageLink: 'https://shop.example.com/img/sku-001.jpg',
    additionalImageLinks: ['https://shop.example.com/img/sku-001-b.jpg'],
    price: '890 TWD',
    salePrice: '690 TWD',
    availability: 'in_stock',
    brand: 'SaaS Factory',
    condition: 'new',
    productType: '配件 > 包款',
    color: '米白',
    size: 'M',
    itemGroupId: 'GROUP-001',
  },
  {
    id: 'SKU-002, special',
    title: '純棉 T 恤',
    description: '柔軟透氣\n四季皆宜',
    link: 'https://shop.example.com/p/sku-002',
    imageLink: 'https://shop.example.com/img/sku-002.jpg',
    price: '590 TWD',
    availability: 'out_of_stock',
    brand: 'SaaS Factory',
    condition: 'new',
  },
];

describe('FeedService', () => {
  const service = new FeedService();

  it('GMC XML：含 RSS header、g: 命名空間與所有商品', () => {
    const out = service.generate('gmc-xml', sampleItems, metadata);
    expect(out.contentType).toContain('application/xml');
    expect(out.body).toContain('<?xml version="1.0"');
    expect(out.body).toContain('xmlns:g="http://base.google.com/ns/1.0"');
    expect(out.body).toContain('<g:id>SKU-001</g:id>');
    expect(out.body).toContain('<g:sale_price>690 TWD</g:sale_price>');
    expect(out.body).toContain('<g:additional_image_link>');
    // 描述含 & 與「」必須轉義
    expect(out.body).toContain('優質商品 &amp; 服務');
    expect(out.body).toContain('含「外口袋」設計');
    // 出貨狀態
    expect(out.body).toContain('<g:availability>in_stock</g:availability>');
    expect(out.body).toContain('<g:availability>out_of_stock</g:availability>');
  });

  it('Meta Catalog CSV：含 header + 兩筆資料 + 特殊字元轉義', () => {
    const out = service.generate('meta-catalog', sampleItems, metadata);
    expect(out.contentType).toContain('text/csv');
    expect(out.body.startsWith('id,title,description')).toBe(true);
    // 含逗號的 id 必須加引號
    expect(out.body).toContain('"SKU-002, special"');
    // 含換行的 description 必須加引號（換行保留在 quoted field 內）
    expect(out.body).toContain('"柔軟透氣\n四季皆宜"');
    // 兩筆商品均出現
    expect(out.body).toContain('SKU-001');
    expect(out.body).toContain('SKU-002');
  });

  it('LINE LAP CSV：拆出金額與幣別', () => {
    const out = service.generate('line-lap', sampleItems, metadata);
    expect(out.body.startsWith('product_id,name,description,price,sale_price,currency')).toBe(
      true,
    );
    // 第一筆有特價：price=890, sale_price=690, currency=TWD
    expect(out.body).toMatch(/890,690,TWD/);
    // 第二筆無特價：sale_price 為空
    expect(out.body).toMatch(/590,,TWD/);
  });

  it('TikTok CSV：含 sku_id header 與商品分類', () => {
    const out = service.generate('tiktok', sampleItems, metadata);
    const lines = out.body.split('\n');
    expect(lines[0]).toContain('sku_id,title,description');
    expect(out.body).toContain('SKU-001');
    expect(out.body).toContain('配件 > 包款');
  });

  it('generateAll：一次產出 4 種格式', () => {
    const all = service.generateAll(sampleItems, metadata);
    expect(Object.keys(all).sort()).toEqual(
      ['gmc-xml', 'line-lap', 'meta-catalog', 'tiktok'].sort(),
    );
    expect(all['gmc-xml'].body).toContain('<rss');
    expect(all['meta-catalog'].body).toContain('SKU-001');
    expect(all['meta-catalog'].body).toContain('SKU-002');
  });

  it('空商品清單：仍產出有效 header / RSS 骨架', () => {
    const xml = service.generate('gmc-xml', [], metadata);
    expect(xml.body).toContain('<channel>');
    expect(xml.body).toContain('</channel>');
    expect(xml.body).not.toContain('<item>');

    const csv = service.generate('meta-catalog', [], metadata);
    expect(csv.body.split('\n')).toHaveLength(1);
  });
});
