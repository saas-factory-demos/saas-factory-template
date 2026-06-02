/**
 * 優惠券模組對外 API。
 */

export * from './types.js';
export { generateCode, generateBulkCodes } from './code-generator.js';
export { CouponService, couponToRule } from './service.js';
export { InMemoryCouponStore } from './in-memory-store.js';
export { CouponsCollection, CouponCodesCollection } from './collections.js';
