/**
 * @saas-factory/frontend-blocks 進入點。
 *
 * 對外導出：
 * - 20 個 Tier 1 block component
 * - 各 block 的 Zod schema、defaults、variants 與 props 型別
 * - `BLOCK_REGISTRY`：給 Wizard / template-writer / Storybook 統一查找
 * - 共用 schema helper（CTA / image / motion 等）與 SectionContainer
 */

export * from './blocks/banner/index.js';
export * from './blocks/breadcrumb/index.js';
export * from './blocks/contact/index.js';
export * from './blocks/content-section/index.js';
export * from './blocks/cta/index.js';
export * from './blocks/faq/index.js';
export * from './blocks/features-grid/index.js';
export * from './blocks/footer/index.js';
export * from './blocks/gallery/index.js';
export * from './blocks/header/index.js';
export * from './blocks/hero/index.js';
export * from './blocks/logo-cloud/index.js';
export * from './blocks/newsletter/index.js';
export * from './blocks/pricing-table/index.js';
export * from './blocks/stats/index.js';
export * from './blocks/steps/index.js';
export * from './blocks/tabs-section/index.js';
export * from './blocks/team/index.js';
export * from './blocks/testimonials/index.js';
export * from './blocks/timeline/index.js';

export {
  imageAssetSchema,
  ctaSchema,
  linkItemSchema,
  motionConfigSchema,
  type ImageAsset,
  type CtaConfig,
  type LinkItem,
  type MotionConfig,
} from './blocks/_shared/schema-helpers.js';
export { SectionContainer, type SectionContainerProps } from './blocks/_shared/section.js';

export { BLOCK_REGISTRY, BLOCK_KEYS } from './registry.js';
export type {
  BlockKey,
  BlockProps,
  BlockRegistry,
  BlockRegistryEntry,
  BlockSchemaForKey,
  BlockSchemaMap,
} from './types.js';
