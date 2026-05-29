import { tmpdir } from 'node:os';
import path from 'node:path';

import type { CollectionConfig } from 'payload';

/**
 * Media collection（stub）。
 *
 * 提供 upload 能力給 PR-D 的 4 個主 collections（pages / shop-pages / course-pages / blog-posts）
 * 的 SEO og image、blocks 內的 image asset 引用。
 *
 * goal-03 / goal-04 後續會擴充：
 * - 多尺寸 image sizes（thumbnail / card / hero）
 * - R2 storage adapter（正式持久化；見下方 staticDir 註解）
 * - 影片 metadata（給 Bunny.net）
 *
 * 不可改的契約：slug = 'media'、id 為主鍵。
 *
 * **staticDir serverless 修正**：Vercel serverless 檔案系統唯讀，只有 `/tmp` 可寫；
 * 相對路徑 `'media'` 會在 build / runtime `mkdir` 失敗（ENOENT）。
 * 因此 Vercel 環境下改指向 `os.tmpdir()/saas-factory-media`（可寫）。
 *
 * 注意：`/tmp` 是 per-invocation 暫存，上傳檔案不跨 cold start 持久化。
 * 正式持久化需接 R2 storage adapter（`@payloadcms/storage-s3`，gated on R2_* env）—
 * 待 R2 credentials 備齊後實作（同時支援 goal-12 生圖儲存）。本機 dev 仍用相對 `'media'`。
 */
const MEDIA_STATIC_DIR = process.env.VERCEL
  ? path.join(tmpdir(), 'saas-factory-media')
  : 'media';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    description: 'Media（圖片 / 影片 / 檔案）。goal-03 / goal-04 會擴充多尺寸與 R2。',
  },
  upload: {
    staticDir: MEDIA_STATIC_DIR,
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
      admin: { description: '替代文字（無障礙 + SEO）' },
    },
  ],
};
