/**
 * Payload v3 collection 定義（商品模組所有權，goal 03 §1）。
 *
 * 三個 collection：
 * - `products`：商品主表
 * - `product-variants`：多規格 SKU
 * - `categories`：分類樹（self-reference）
 */

import type { CollectionConfig } from 'payload';

/**
 * `products` collection。
 */
export const ProductsCollection: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'basePrice', 'updatedAt'],
    group: '商品',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'title', type: 'text', required: true, maxLength: 70 },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'descriptionHtml', type: 'richText' },
    { name: 'shortDescription', type: 'textarea' },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'simple',
      options: [
        { label: '單一商品', value: 'simple' },
        { label: '多規格', value: 'variant' },
        { label: '數位商品', value: 'digital' },
        { label: '組合商品', value: 'bundle' },
        { label: '訂閱商品', value: 'subscription' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '上架', value: 'active' },
        { label: '預購', value: 'pre-order' },
        { label: '封存', value: 'archived' },
      ],
    },
    {
      name: 'visibility',
      type: 'select',
      defaultValue: 'public',
      options: [
        { label: '公開', value: 'public' },
        { label: '會員專屬', value: 'members-only' },
        { label: '隱藏', value: 'hidden' },
      ],
    },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
    { name: 'tags', type: 'text', hasMany: true },
    { name: 'primaryImage', type: 'upload', relationTo: 'media' },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'videos', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'basePrice', type: 'number', required: true, min: 0 },
    { name: 'compareAtPrice', type: 'number', min: 0 },
    { name: 'costPrice', type: 'number', min: 0 },
    { name: 'taxable', type: 'checkbox', defaultValue: true },
    { name: 'taxClass', type: 'text' },
    { name: 'vendor', type: 'text' },
    { name: 'brand', type: 'text' },
    { name: 'weight', type: 'number', min: 0, admin: { description: '單位：公克' } },
    {
      name: 'dimensions',
      type: 'group',
      fields: [
        { name: 'l', type: 'number', min: 0 },
        { name: 'w', type: 'number', min: 0 },
        { name: 'h', type: 'number', min: 0 },
      ],
    },
    { name: 'shippingClass', type: 'text' },
    { name: 'attributes', type: 'json' },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', maxLength: 70 },
        { name: 'description', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
    { name: 'publishedAt', type: 'date' },
    { name: 'scheduledAt', type: 'date', admin: { description: '排程上架時間' } },
    { name: 'externalId', type: 'text', admin: { description: 'ERP 整合預留' } },
  ],
};

/**
 * `product-variants` collection。
 */
export const ProductVariantsCollection: CollectionConfig = {
  slug: 'product-variants',
  admin: {
    useAsTitle: 'sku',
    defaultColumns: ['sku', 'price', 'inventory'],
    group: '商品',
  },
  fields: [
    { name: 'productId', type: 'relationship', relationTo: 'products', required: true, index: true },
    { name: 'sku', type: 'text', required: true, unique: true, index: true },
    { name: 'barcode', type: 'text', index: true },
    {
      name: 'optionValues',
      type: 'json',
      admin: { description: '規格組合，例如 { color: "紅", size: "L" }' },
    },
    { name: 'price', type: 'number', required: true, min: 0 },
    { name: 'compareAtPrice', type: 'number', min: 0 },
    { name: 'costPrice', type: 'number', min: 0 },
    { name: 'weight', type: 'number', min: 0 },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'inventory', type: 'number', required: true, defaultValue: 0, min: 0 },
  ],
};

/**
 * `categories` collection（self-reference 樹狀結構）。
 */
export const CategoriesCollection: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'parent', 'displayOrder'],
    group: '商品',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'parent', type: 'relationship', relationTo: 'categories' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'textarea' },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', maxLength: 70 },
        { name: 'description', type: 'textarea' },
      ],
    },
    { name: 'displayOrder', type: 'number', defaultValue: 0 },
  ],
};
