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
  /**
   * 公開讀取（read: 任何人）。
   *
   * 為何：Media 存的是公開行銷網站圖（hero / gallery / 商品 / 部落格 / 頁面區塊圖），
   * 由瀏覽器以 `<img src="/api/media/file/...">` 直接抓取——此路徑會走 REST API
   * 並套用 collection 的 read access。預設 read 需登入 → 匿名訪客拿到 403，
   * 整站公開頁的圖全部破圖。付費 / gated 下載不走 Media（lead magnet 用獨立 fileUrl 欄位），
   * 故 Media 全公開讀取是安全且符合行銷網站慣例的作法。
   *
   * create / update / delete 不覆寫 → 維持預設需登入，僅後台管理者能上傳 / 改 / 刪。
   */
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'filename',
    description: 'Media（圖片 / 影片 / 檔案）。goal-03 / goal-04 會擴充多尺寸與 R2。',
  },
  upload: {
    staticDir: MEDIA_STATIC_DIR,
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
    /* 自動 WebP 轉檔（Payload 內建 sharp pipeline）：
     * 原 gpt-image-2 / 客戶手上傳的 PNG / JPG 普遍 1.5-3 MB，行動裝置開頁要 30-60 秒
     * 才能載完 5 張。WebP @82 預估壓到 ~200-400 KB（80-90% 縮減），首載剩 ~5s。
     * format 'webp' 也可改 'avif' 再省 25%（但相容性略差）；82 是 web 上常用畫質拐點。 */
    formatOptions: {
      format: 'webp',
      options: { quality: 82 },
    },
    /* 上限尺寸：1600px 寬足夠 hero / gallery 的 retina 顯示；超過原樣資源浪費。
     * `fit: 'inside'` + `withoutEnlargement: true` 確保比例不變、不放大小圖。
     * gpt-image-2 預設 1536×1024，已在範圍內，這條主要擋客戶手上傳的超大圖。 */
    resizeOptions: {
      width: 1600,
      height: undefined,
      fit: 'inside',
      withoutEnlargement: true,
    },
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
