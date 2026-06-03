/**
 * 商品模組型別（goal 03 §1）。
 *
 * Lock：ADR-0011 §03-01 v1。
 */

/**
 * 商品類型。
 */
export type ProductType = 'simple' | 'variant' | 'digital' | 'bundle' | 'subscription';

/**
 * 商品狀態。
 */
export type ProductStatus = 'draft' | 'active' | 'pre-order' | 'archived';

/**
 * 商品可見性。
 */
export type ProductVisibility = 'public' | 'members-only' | 'hidden';

/**
 * 媒體資源（圖片／影片）。
 */
export interface ProductMedia {
  /** R2 / CDN URL。 */
  url: string;
  /** alt 文字（SEO + 無障礙）。 */
  alt?: string;
  /** 媒體類型。 */
  type: 'image' | 'video' | '3d' | 'ar';
}

/**
 * 商品尺寸（公分）。
 */
export interface ProductDimensions {
  l: number;
  w: number;
  h: number;
}

/**
 * 商品 SEO 欄位。
 */
export interface ProductSeo {
  /** SEO title，70 字內。 */
  title?: string;
  description?: string;
  ogImage?: string;
}

/**
 * 商品 collection 對應的 record。
 */
export interface Product {
  id: string;
  tenantId: string;
  /** 標題，70 字內（Google Shopping 規範）。 */
  title: string;
  slug: string;
  descriptionHtml?: string;
  shortDescription?: string;
  type: ProductType;
  status: ProductStatus;
  visibility: ProductVisibility;
  categories: string[];
  tags: string[];
  primaryImage?: ProductMedia;
  gallery?: ProductMedia[];
  videos?: ProductMedia[];
  threeDModel?: ProductMedia;
  arModel?: ProductMedia;
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  taxable: boolean;
  taxClass?: string;
  vendor?: string;
  brand?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  shippingClass?: string;
  attributes?: Record<string, unknown>;
  seo?: ProductSeo;
  publishedAt?: string;
  scheduledAt?: string;
  externalId?: string;
}

/**
 * 商品規格 variant。
 */
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  barcode?: string;
  /** 規格組合，例如 { color: '紅', size: 'L' }。 */
  optionValues: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  weight?: number;
  image?: ProductMedia;
  inventory: number;
}

/**
 * 商品分類。
 */
export interface Category {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  parent?: string;
  image?: ProductMedia;
  description?: string;
  seo?: ProductSeo;
  displayOrder: number;
}

/**
 * 商品標題長度上限（Google Shopping 規範）。
 */
export const PRODUCT_TITLE_MAX_LENGTH = 70;
