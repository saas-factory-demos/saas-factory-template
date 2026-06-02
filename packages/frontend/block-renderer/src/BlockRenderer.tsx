'use client';

import { BLOCK_REGISTRY, type BlockKey } from '@saas-factory/frontend-blocks';
import { MotionLevelProvider } from '@saas-factory/frontend-motion';
import { Fragment, Suspense, type ComponentType, type ReactElement } from 'react';

import { BlockErrorBoundary } from './ErrorBoundary.js';

import type { BlockInstance, FrontendTier1BlockKey, MotionLevel } from '@saas-factory/factory-types';

/**
 * BlockRenderer props。
 *
 * - `blocks`：來自 Wizard / Payload Pages collection 的 block 實例陣列。
 *   會依 `order` 升冪排序後渲染，`visible === false` 的 block 自動跳過。
 * - `motionLevel`：可選，透過 `MotionLevelProvider` 注入；不指定時不包 Provider，
 *   讓上層 layout 提供（避免重複注入造成 context 覆蓋）。
 * - `loadingFallback`：給 `<Suspense>` 用的 fallback；未指定走預設占位。
 */
export interface BlockRendererProps {
  blocks: readonly BlockInstance[];
  motionLevel?: MotionLevel;
  loadingFallback?: ReactElement;
}

/** 預設 Suspense fallback，用淡化占位避免閃爍。 */
function DefaultLoadingFallback(): ReactElement {
  return (
    <div
      aria-hidden="true"
      className="my-4 h-32 animate-pulse rounded-xl bg-black/5"
    />
  );
}

/**
 * 把 BlockInstance[] 渲染為 React tree。
 *
 * 行為：
 * 1. 依 `order` 升冪排序（穩定排序，平手時保留原順序）。
 * 2. 過濾 `visible === false`。
 * 3. 對齊 `BLOCK_REGISTRY[type].component`；未知 type 跳過並 `console.warn`。
 * 4. 每個 block 包 `<Suspense>` + `<BlockErrorBoundary>`，單 block 壞掉不影響整頁。
 * 5. 若指定 `motionLevel`，用 `<MotionLevelProvider>` 包整棵 tree。
 *
 * @example
 * <BlockRenderer blocks={page.blocks} motionLevel={3} />
 */
export function BlockRenderer(props: BlockRendererProps): ReactElement {
  const { blocks, motionLevel, loadingFallback } = props;
  const sorted = [...blocks]
    .filter((b) => b.visible !== false)
    .sort((a, b) => a.order - b.order);

  const tree = (
    <Fragment>
      {sorted.map((block) => renderBlock(block, loadingFallback))}
    </Fragment>
  );

  if (motionLevel === undefined) {
    return tree;
  }
  return <MotionLevelProvider level={motionLevel}>{tree}</MotionLevelProvider>;
}

/** 把單一 BlockInstance 解析為對應 component；未知 type 回傳 null。 */
function renderBlock(
  block: BlockInstance,
  loadingFallback: ReactElement | undefined,
): ReactElement | null {
  if (!isTier1BlockKey(block.type)) {
    // industry-templates dotted slug 暫不在 BLOCK_REGISTRY 內，跳過並提示。
    console.warn(
      `[BlockRenderer] 未註冊的 block type：${block.type}（id=${block.id}）。已跳過。`,
    );
    return null;
  }
  const entry = BLOCK_REGISTRY[block.type];
  // 透過 unknown 中介擺脫各 block schema 互相不相容的協變問題；
  // entry.component 在 registry 內已用 schema 約束過 props 形狀，這裡只負責透傳。
  const Component = entry.component as unknown as ComponentType<Record<string, unknown>>;
  // BlockInstance.variant 由各 block schema 自驗，這裡只負責塞進 props。
  const props: Record<string, unknown> = { ...block.config, variant: block.variant };
  return (
    <BlockErrorBoundary key={block.id} blockId={block.id} blockType={block.type}>
      <Suspense fallback={loadingFallback ?? <DefaultLoadingFallback />}>
        <Component {...props} />
      </Suspense>
    </BlockErrorBoundary>
  );
}

/** Tier 1 key set，runtime guard 用。 */
const TIER1_KEYS: ReadonlySet<string> = new Set<BlockKey>(
  Object.keys(BLOCK_REGISTRY) as BlockKey[],
);

/** 檢查 block.type 是否為 BLOCK_REGISTRY 內的 Tier 1 key。 */
function isTier1BlockKey(value: string): value is FrontendTier1BlockKey {
  return TIER1_KEYS.has(value);
}
