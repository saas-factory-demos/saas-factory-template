import type { CollectionConfig } from 'payload';

/**
 * Media collection（stub）。
 *
 * 提供 upload 能力給 PR-D 的 4 個主 collections（pages / shop-pages / course-pages / blog-posts）
 * 的 SEO og image、blocks 內的 image asset 引用。
 *
 * goal-03 / goal-04 後續會擴充：
 * - 多尺寸 image sizes（thumbnail / card / hero）
 * - R2 storage adapter
 * - 影片 metadata（給 Bunny.net）
 *
 * 不可改的契約：slug = 'media'、staticDir 結構、id 為主鍵。
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    description: 'Media（圖片 / 影片 / 檔案）。goal-03 / goal-04 會擴充多尺寸與 R2。',
  },
  upload: {
    staticDir: 'media',
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
