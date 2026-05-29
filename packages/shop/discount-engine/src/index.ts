/**
 * 折扣引擎對外 API。
 */

export * from './types.js';
export { evaluateCondition, evaluateConditions } from './conditions.js';
export { applyRule } from './rules.js';
export { DiscountEngine } from './engine.js';
