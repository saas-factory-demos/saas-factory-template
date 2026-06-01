/**
 * @saas-factory/shop-products
 *
 * 商品模組（goal 03 §1）：types + validators + Payload collections。
 *
 * Lock：ADR-0011 §03-01 v1。
 */

export type {
  Category,
  Product,
  ProductDimensions,
  ProductMedia,
  ProductSeo,
  ProductStatus,
  ProductType,
  ProductVariant,
  ProductVisibility,
} from './types.js';
export { PRODUCT_TITLE_MAX_LENGTH } from './types.js';
export {
  expandVariantMatrix,
  isScheduledForPublish,
  totalInventory,
  validateProductTitle,
  validateSlug,
  variantMatrixSize,
} from './validators.js';
export {
  CategoriesCollection,
  ProductsCollection,
  ProductVariantsCollection,
} from './collections.js';
