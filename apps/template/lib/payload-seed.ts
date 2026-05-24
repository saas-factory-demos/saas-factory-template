import type { BlockInstance, PageComposition } from '@saas-factory/factory-types';

/**
 * Payload `blocks` field 寫入 doc shape。
 *
 * 與讀取面 `PayloadBlockDoc`（lib/payload-pages.ts）互為鏡像：
 * - 我們序列化：type → blockType，config 攤平到頂層，加 variant / visible
 * - 讀取時：blockType → type，config 收回非 intrinsic key
 */
export interface PayloadBlockInput {
  id?: string;
  blockType: string;
  variant?: string;
  visible?: boolean;
  [key: string]: unknown;
}

/**
 * Payload pages.create 用的最小 payload shape。
 *
 * Payload localized 欄位（title / layout）寫入時若只給單值，
 * 預設寫到目前 locale；要多語請呼叫端拆兩次 create / update。
 */
export interface PayloadPageInput {
  tenantId: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  isHomepage?: boolean;
  sortOrder?: number;
  layout: PayloadBlockInput[];
}

/**
 * 把 BlockInstance（factory-types canonical shape）轉成 Payload blocks doc。
 *
 * 規則（與 mapPayloadLayoutToBlocks 鏡像）：
 * - blockType ← type
 * - variant / visible 直接保留
 * - config 物件「攤平」到頂層（Payload blocks field 沒有 nested config 概念）
 * - order 不寫入：Payload 用陣列 index 維持順序
 */
export function blockInstanceToPayloadBlock(block: BlockInstance): PayloadBlockInput {
  return {
    id: block.id,
    blockType: block.type,
    variant: block.variant,
    visible: block.visible,
    ...block.config,
  };
}

/**
 * 把 PageComposition[]（industry-templates 出）轉成 Payload pages.create 輸入陣列。
 *
 * 行為：
 * - pageKey 'homepage' → slug='home', isHomepage=true, sortOrder=0
 * - 其餘 pageKey → slug=pageKey, isHomepage=false, sortOrder=index
 * - title 用 pageKey humanize（kebab → Title Case）。實務上呼叫端應該覆寫多語版本
 * - status 全部 'published'（種子預設可見；測試環境想要 draft 自行覆寫）
 *
 * @param tenantId 多租戶 id（必填）
 * @param compositions 來自 IndustryTemplate.pages[siteType]
 */
export function pageCompositionsToPayloadPages(
  tenantId: string,
  compositions: readonly PageComposition[],
): PayloadPageInput[] {
  return compositions.map((comp, index) => {
    const isHome = comp.pageKey === 'homepage';
    return {
      tenantId,
      title: humanizePageKey(comp.pageKey),
      slug: isHome ? 'home' : comp.pageKey,
      status: 'published',
      isHomepage: isHome,
      sortOrder: isHome ? 0 : index,
      layout: comp.blocks
        .slice()
        .sort((a, b) => a.order - b.order)
        .map(blockInstanceToPayloadBlock),
    };
  });
}

/**
 * 'product-list' → 'Product List'。
 */
function humanizePageKey(key: string): string {
  return key
    .split('-')
    .map((part) => (part.length === 0 ? part : part[0]!.toUpperCase() + part.slice(1)))
    .join(' ');
}
