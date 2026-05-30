import type { ImageSlotKind } from './types.js';
import type { BlockInstance, FrontendBlockKey, PageComposition } from '@saas-factory/factory-types';


/**
 * 偵測「圖片資產」shape —— 與 apps/template payload-seed 的 isImageAssetShape 規則一致：
 * 必含 src + alt；其餘 key 只允許 width / height。
 */
function isImageAssetShape(obj: Record<string, unknown>): boolean {
  const keys = Object.keys(obj);
  if (!keys.includes('src') || !keys.includes('alt')) return false;
  const allowed = new Set(['src', 'alt', 'width', 'height']);
  return keys.every((k) => allowed.has(k));
}

/**
 * 依 block type + 欄位 key 推斷 slot 類型，決定長寬比 / prompt 取景。
 *
 * 規則（由具體到一般）：
 * - hero 系列 → hero-background
 * - 含 icon 字樣的欄位 / features 系列 → feature-icon
 * - gallery 系列 → gallery
 * - 人物系列（profile / team / portrait / avatar 欄位）→ portrait
 * - 其餘 → generic
 */
function inferSlotKind(blockType: FrontendBlockKey, fieldKey: string): ImageSlotKind {
  const type = blockType.toLowerCase();
  const key = fieldKey.toLowerCase();
  if (type.startsWith('hero') || key.includes('background') || key.includes('hero')) {
    return 'hero-background';
  }
  if (key.includes('icon') || type.startsWith('features')) {
    return 'feature-icon';
  }
  if (type.startsWith('gallery')) {
    return 'gallery';
  }
  if (
    type.startsWith('profile') ||
    type.startsWith('team') ||
    key.includes('avatar') ||
    key.includes('portrait') ||
    key.includes('photo')
  ) {
    return 'portrait';
  }
  return 'generic';
}

/** 在頁面 / block 中定位到的單一 image slot。 */
export interface ImageSlot {
  /** 所屬頁面 key。 */
  pageKey: string;
  /** 所屬 block id。 */
  blockId: string;
  /** block 類型。 */
  blockType: FrontendBlockKey;
  /** config 內到該 image asset 的路徑（key / array index 混合）。 */
  path: Array<string | number>;
  /** 推斷的 slot 類型。 */
  slotKind: ImageSlotKind;
  /** 該 asset 的 alt 文字（當生圖主題提示）。 */
  subject?: string;
}

/**
 * 遞迴掃描單一 block.config，收集所有 image-asset slot。
 *
 * @param value 當前節點
 * @param path 從 config 根到當前節點的路徑
 * @param topKey 最近一個物件 key（用於 slotKind 推斷）
 */
function walkConfig(
  block: BlockInstance,
  pageKey: string,
  value: unknown,
  path: Array<string | number>,
  topKey: string,
  out: ImageSlot[],
): void {
  if (value === null || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      walkConfig(block, pageKey, item, [...path, index], topKey, out);
    });
    return;
  }

  const obj = value as Record<string, unknown>;
  if (isImageAssetShape(obj)) {
    const alt = typeof obj.alt === 'string' ? obj.alt : undefined;
    out.push({
      pageKey,
      blockId: block.id,
      blockType: block.type,
      path,
      slotKind: inferSlotKind(block.type, topKey),
      subject: alt,
    });
    return;
  }

  for (const [k, v] of Object.entries(obj)) {
    walkConfig(block, pageKey, v, [...path, k], k, out);
  }
}

/**
 * 掃描整組頁面，收集所有可填圖的 image slot。
 *
 * generator `generate-images` step 用此盤點要生幾張圖、各自的 slot 類型與主題。
 *
 * @param pages wizard.frontend.pages
 * @returns 所有 image slot（含頁面 / block / 路徑 / 類型 / 主題）
 */
export function collectImageSlots(pages: readonly PageComposition[]): ImageSlot[] {
  const out: ImageSlot[] = [];
  for (const page of pages) {
    for (const block of page.blocks) {
      if (block.visible === false) continue;
      for (const [k, v] of Object.entries(block.config)) {
        walkConfig(block, page.pageKey, v, [k], k, out);
      }
    }
  }
  return out;
}
