import type { FrontendTier1BlockKey } from '@saas-factory/factory-types';
import type { ComponentType } from 'react';
import type { z } from 'zod';

/**
 * 本套件覆蓋的 Tier 1 block key。20 個一比一對應 factory-types 的同名 enum。
 */
export type BlockKey = FrontendTier1BlockKey;

/**
 * 單一 Block 的 Zod schema 與其推導出的 TS type 對應表。
 * 透過 `BlockSchemaMap[K]` 取得指定 block 的 Zod schema。
 *
 * 真正的 map 在 `./registry.ts` 內具體化（避免循環 import）。
 */
export type BlockSchemaMap = Record<BlockKey, z.ZodTypeAny>;

/** 推導指定 block 的 props 形狀（透過其 Zod schema）。 */
export type BlockProps<K extends BlockKey> = z.infer<BlockSchemaForKey<K>>;

/** 為單一 block 取出 schema 型別（具體 schema 在 registry 注入）。 */
export type BlockSchemaForKey<K extends BlockKey> = BlockSchemaMap[K];

/**
 * Registry 內每個 block 的 metadata 結構。
 *
 * - `schema`：Zod schema，給 Wizard / template-writer 驗證 config 使用
 * - `component`：React component，內部依 variant 切換子版型
 * - `displayName`：繁中顯示名稱，給 Wizard / Storybook UI 用
 * - `variants`：該 block 支援的 variant slug 列表（5-8 個 / 個）
 * - `defaultConfig`：產生新 block instance 時的預設 props（給 Wizard 預填用）
 */
export interface BlockRegistryEntry<K extends BlockKey = BlockKey> {
  schema: BlockSchemaMap[K];
  // 使用 ComponentType<unknown> 避開不同 block schema 的協變問題（registry 內部已型別安全）。
  component: ComponentType<BlockProps<K>>;
  displayName: string;
  variants: readonly string[];
  defaultConfig: BlockProps<K>;
}

/** 整個 BLOCK_REGISTRY 的型別簽名。 */
export type BlockRegistry = {
  [K in BlockKey]: BlockRegistryEntry<K>;
};
