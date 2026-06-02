import { IMAGE_SIZES } from './types.js';

import type { ImageSizeName, StorageAdapter, UploadResult } from './index.js';

/**
 * 圖片處理 pipeline 介面（goal 01 §3）。
 *
 * 實際縮圖 / 格式轉換 / EXIF 清除用 `sharp`，這裡只描述輸入輸出契約。
 * 整合到 Next.js Image 元件時透過 `getSignedReadUrl` 取得 signed URL。
 */
export interface ProcessedImage {
  original: UploadResult;
  variants: Partial<Record<ImageSizeName, UploadResult>>;
}

export interface ImageProcessorOptions {
  /** 要產生的尺寸；預設全部 + WebP */
  sizes?: ReadonlyArray<ImageSizeName>;
  /** 是否清除 EXIF（預設 true） */
  stripExif?: boolean;
  /** 是否額外輸出 WebP 版本（預設 true） */
  generateWebp?: boolean;
}

/**
 * 依 source key 推導 variant key。
 *
 * `tenants/T-1/products/abc.jpg` + medium → `tenants/T-1/products/abc.medium.jpg`
 */
export function deriveVariantKey(
  sourceKey: string,
  variant: ImageSizeName,
  ext?: string,
): string {
  const lastDot = sourceKey.lastIndexOf('.');
  const base = lastDot === -1 ? sourceKey : sourceKey.slice(0, lastDot);
  const sourceExt =
    lastDot === -1 ? '' : sourceKey.slice(lastDot + 1).toLowerCase();
  const finalExt = ext ?? sourceExt;
  return `${base}.${variant}${finalExt ? `.${finalExt}` : ''}`;
}

/**
 * 預期的 variant 列表。
 *
 * 實際生成圖片的 sharp 整合放在 apps 端（避免 sharp 在 monorepo 中被多重編譯）。
 */
export function listVariants(
  options: ImageProcessorOptions = {},
): ImageSizeName[] {
  const sizes = options.sizes ?? [
    'thumbnail',
    'small',
    'medium',
    'large',
    'original',
  ];
  return [...sizes];
}

/**
 * 取得指定 variant 對應的目標寬度。
 *
 * `original` 不縮、回 0。
 */
export function getVariantWidth(variant: ImageSizeName): number {
  if (variant === 'original') {
    return 0;
  }
  return IMAGE_SIZES[variant];
}

/**
 * placeholder：未來實作完整 image processing 時的入口。
 *
 * 目前 stub：呼叫 adapter.upload 把 source buffer 上 original key 後直接回。
 * 縮圖 / WebP / EXIF 清除待 apps 端 sharp 整合。
 */
export async function processImage(
  adapter: StorageAdapter,
  sourceKey: string,
  body: Uint8Array,
  contentType: string,
): Promise<ProcessedImage> {
  const original = await adapter.upload({
    key: sourceKey,
    body,
    contentType,
    acl: 'public-read',
  });
  return { original, variants: {} };
}
