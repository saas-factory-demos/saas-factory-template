import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import { AuditLogsCollection } from '@saas-factory/audit-log';
import { UserCredentialsCollection } from '@saas-factory/auth';
import {
  AuthorsCollection,
  CategoriesCollection,
  PostsCollection,
  PostSeriesCollection,
  TagsCollection,
} from '@saas-factory/cms-blog';
import {
  ClickEventsCollection,
  CtaBlocksCollection,
  LeadCapturesCollection,
  LeadMagnetsCollection,
  NewsletterSubscribersCollection,
} from '@saas-factory/cms-blog-marketing';
import { CommentsCollection } from '@saas-factory/cms-comments';
/* @factory:prune-if-disabled cms.faq */
import { FaqCategoriesCollection, FaqItemsCollection } from '@saas-factory/cms-faq';
import { FormsCollection, FormSubmissionsCollection } from '@saas-factory/cms-forms';
import { buildPagesCollection } from '@saas-factory/cms-pages';
import { BrokenLinksCollection } from '@saas-factory/cms-seo';
import {
  InvoiceAllowancesCollection,
  InvoiceLogsCollection,
  InvoicesCollection,
} from '@saas-factory/invoice-core';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Carts } from './collections/carts.js';
import { CourseChapters } from './collections/course-chapters.js';
import { CoursePages } from './collections/course-pages.js';
import { Courses } from './collections/courses.js';
import { DiscountRules } from './collections/discount-rules.js';
import { FactorySupportLogs } from './collections/factory-support-logs.js';
import { Media } from './collections/media.js';
import { Orders } from './collections/orders.js';
import { Payments } from './collections/payments.js';
import { ProductCategories } from './collections/product-categories.js';
import { ProductTags } from './collections/product-tags.js';
import { Products } from './collections/products.js';
import { ShopPages } from './collections/shop-pages.js';
import { Subscriptions } from './collections/subscriptions.js';
import { WorkflowExecutions } from './collections/workflow-executions.js';
import { WorkflowRegistry } from './collections/workflow-registry.js';
import { withHomepageUniqueValidator } from './lib/payload-homepage-validate.js';
import { withRevalidateHooks } from './lib/payload-revalidate.js';
import {
  BLOG_PREFIX,
  COURSE_PREFIX,
  SHOP_PREFIX,
  cmsPagePaths,
  localizedPaths,
} from './lib/route-paths.js';
import { evaluateLoginPolicy, evaluateRoleChangePolicy } from './lib/users-login-policy.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * R2（Cloudflare，S3 相容）storage plugin — 對 media collection 上傳 / 提供走 R2。
 *
 * gated on R2 env 全齊：未設時回空陣列 → Media 退回本地 staticDir（dev 用 'media'、
 * Vercel 用 /tmp，見 collections/media.ts）。
 *
 * 為何要 R2：Vercel serverless 檔案系統唯讀 + 暫存，本地 staticDir 不持久；
 * R2 是 CLAUDE.md 既定的檔案儲存。對應 99.1.3 報告「Media 持久化需 R2」+ goal-12 生圖儲存。
 */
const r2StoragePlugins =
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.R2_BUCKET_NAME,
          config: {
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            region: 'auto',
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID,
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
          },
        }),
      ]
    : [];

/**
 * Payload 主設定。
 * 各模組的 collection 將於後續 goal（01 core / 02 payment / 03 shop ...）逐步加入。
 * 目前僅含最小可運行設定：Users collection + Postgres adapter。
 */
export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [
    {
      slug: 'users',
      auth: {
        // 防爆破：5 次失敗鎖 10 分鐘（對應 OWASP A07）
        maxLoginAttempts: 5,
        lockTime: 600_000,
        // cookie 預設 Strict（避免 CSRF）
        cookies: { sameSite: 'Strict' },
        // session 有效期 7 天，refresh 在 1 天內到期自動續
        tokenExpiration: 7 * 24 * 60 * 60,
      },
      access: {
        // factory-support 帳號禁止被「客戶側 owner / admin」於後台 UI 刪除
        // （避免誤刪維修通道；工廠端透過 HMAC 端點的 overrideAccess 仍可清理）。
        // 詳見 ADR-0100。
        delete: ({ req, id }) => {
          // 無 id（批次刪除）→ 用 query 過濾掉 factory-support
          if (id === undefined) {
            return { role: { not_equals: 'factory-support' } };
          }
          // 工廠端 HMAC route 走 overrideAccess: true，不會進到這裡
          if (!req.user) return false;
          // owner 也不可從 UI 刪 factory-support；要先在前端走 disable 流程
          return { role: { not_equals: 'factory-support' } };
        },
      },
      hooks: {
        // ADR-0100 防禦深化：客戶後台 UI 不可手動建 / 改 factory-support 角色。
        // HMAC 路由 overrideAccess: true 自動繞過此 hook。
        beforeChange: [
          ({ data, originalDoc, req }) => {
            const incoming = data as {
              role?: string | null;
              isFactoryManaged?: boolean | null;
            };
            const existing = originalDoc as { role?: string | null } | undefined;
            // 判斷操作上下文：overrideAccess=true → hmac-override；無 req.user → system；其餘 admin-ui
            const ctx: 'admin-ui' | 'hmac-override' | 'system' =
              req.context?.['support-access-override'] === true
                ? 'hmac-override'
                : req.user
                  ? 'admin-ui'
                  : 'system';
            const result = evaluateRoleChangePolicy({
              incomingRole: incoming.role,
              existingRole: existing?.role,
              incomingIsFactoryManaged: incoming.isFactoryManaged,
              operationContext: ctx,
            });
            if (!result.ok) {
              throw new Error(result.message);
            }
            return data;
          },
        ],
        // 登入策略：ADR-0100 通道凍結 + 99.4-2FA-2 7 天 TOTP 鎖帳。
        // 純邏輯抽到 lib/users-login-policy.ts，可單元測試。
        beforeLogin: [
          ({ user }) => {
            const result = evaluateLoginPolicy({
              role: (user as { role?: string }).role,
              factoryAccessDisabledAt: (user as { factoryAccessDisabledAt?: string | null })
                .factoryAccessDisabledAt,
              totpEnabled: (user as { totpEnabled?: boolean }).totpEnabled,
              createdAt: (user as { createdAt?: string }).createdAt,
            });
            if (!result.ok) {
              throw new Error(result.message);
            }
          },
        ],
        // 11-AUDIT-4：factory-support 成功登入 → 寫 audit log（login event）
        afterLogin: [
          async ({ req, user }) => {
            const u = user as { id?: number | string; email?: string; role?: string };
            if (u.role !== 'factory-support') return;
            try {
              await req.payload.create({
                collection: 'factory-support-logs',
                overrideAccess: true,
                data: {
                  action: 'login',
                  actorEmail: u.email ?? 'unknown',
                  payloadSummary: `factory-support 帳號登入後台（${u.email ?? '?'}）`,
                  timestamp: new Date().toISOString(),
                  ...(u.id !== undefined ? { relatedUserId: Number(u.id) } : {}),
                },
              });
            } catch (err) {
              // log 失敗不應擋登入，但要寫 Sentry / console 以便後續追查
              req.payload.logger?.error?.(
                `factory-support afterLogin 寫 audit log 失敗：${
                  err instanceof Error ? err.message : String(err)
                }`,
              );
            }
          },
        ],
      },
      admin: {
        useAsTitle: 'email',
        description:
          '後台使用者。owner / admin 預設應於 7 天內啟用 TOTP 2FA（見 docs/customer/delivery-sop.md）。factory-support 為工廠維修通道服務帳號（ADR-0100）。',
      },
      fields: [
        {
          name: 'role',
          type: 'select',
          // 寫進 JWT 讓 middleware 可在 edge 端讀取 role 做路由決策（實際 auth 仍由 Payload 把關）
          saveToJWT: true,
          options: [
            { label: 'Owner', value: 'owner' },
            { label: 'Admin', value: 'admin' },
            { label: 'Editor', value: 'editor' },
            { label: 'Viewer', value: 'viewer' },
            { label: 'Factory Support（工廠維修通道）', value: 'factory-support' },
          ],
          defaultValue: 'editor',
          admin: {
            description:
              '影響 2FA 強制 + 後台權限。factory-support 為 ADR-0100 揭露式維修通道服務帳號，僅工廠端透過 HMAC API 操作。',
          },
        },
        {
          name: 'isFactoryManaged',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'Factory 自動建立 / 維護的帳號。客戶不應手動建立此標記為 true 的帳號。',
            position: 'sidebar',
          },
        },
        {
          name: 'factoryAccessDisabledAt',
          type: 'date',
          admin: {
            description:
              '客戶請求停用 factory-support 通道的時間戳。設定後該服務帳號無法登入；清除即恢復。',
            position: 'sidebar',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'totpSecret',
          type: 'text',
          admin: { hidden: true, description: 'TOTP base32 secret（不要外洩）' },
        },
        {
          name: 'totpEnabled',
          type: 'checkbox',
          // 寫進 JWT 讓 middleware 判斷是否需要 2FA session cookie
          saveToJWT: true,
          defaultValue: false,
          admin: { description: '是否已啟用 TOTP 2FA' },
        },
        {
          name: 'totpEnabledAt',
          type: 'date',
          admin: { description: '2FA 啟用時間（7 天緩衝期判斷依據）' },
        },
        {
          name: 'recoveryCodes',
          type: 'json',
          admin: {
            hidden: true,
            description: '一次性救援碼（sha-256 hashed，使用後自陣列移除）',
          },
        },
      ],
    },
    Media,
    CategoriesCollection,
    TagsCollection,
    AuthorsCollection,
    PostSeriesCollection,
    Products,
    ProductCategories,
    ProductTags,
    Orders,
    Payments,
    Carts,
    Subscriptions,
    DiscountRules,
    Courses,
    CourseChapters,
    withRevalidateHooks(withHomepageUniqueValidator(buildPagesCollection()), {
      revalidatePaths: cmsPagePaths,
    }),
    withRevalidateHooks(ShopPages, {
      revalidatePaths: (doc) =>
        localizedPaths(SHOP_PREFIX, typeof doc?.slug === 'string' ? doc.slug : ''),
    }),
    withRevalidateHooks(CoursePages, {
      revalidatePaths: (doc) =>
        localizedPaths(COURSE_PREFIX, typeof doc?.slug === 'string' ? doc.slug : ''),
    }),
    withRevalidateHooks(PostsCollection, {
      revalidatePaths: (doc) =>
        localizedPaths(BLOG_PREFIX, typeof doc?.slug === 'string' ? doc.slug : ''),
    }),
    /* CMS 模組 collection（form / faq / comments / blog-marketing / seo broken-links）
     * 在後台暴露，前台路由 / API 端視各模組需求另接（goal-06 / goal-07）。
     * Revalidate hook 不套——這些 collection 內容由各自 API 拉，不直接走 Next ISR 路徑。
     */
    FormsCollection,
    FormSubmissionsCollection,
    /* @factory:prune-if-disabled cms.faq */
    FaqCategoriesCollection,
    /* @factory:prune-if-disabled cms.faq */
    FaqItemsCollection,
    CommentsCollection,
    CtaBlocksCollection,
    LeadMagnetsCollection,
    LeadCapturesCollection,
    NewsletterSubscribersCollection,
    ClickEventsCollection,
    BrokenLinksCollection,
    UserCredentialsCollection,
    WorkflowExecutions,
    WorkflowRegistry,
    FactorySupportLogs,
    AuditLogsCollection,
    InvoicesCollection,
    InvoiceAllowancesCollection,
    InvoiceLogsCollection,
  ],
  localization: {
    locales: [
      { label: '繁體中文', code: 'zh-TW' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'zh-TW',
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? 'dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URL ??
        'postgres://postgres:postgres@localhost:5432/saas_factory_bootstrap',
    },
    // PAYLOAD_PUSH=1 → 首次啟動自動 sync schema（建表 / 補欄）。
    //
    // 為何 env-gated 而非預設 on：push 模式對既有資料是破壞性的（會 ALTER / DROP 對齊
    // collection 定義），正式 production 該走 `payload migrate` migration files。
    // 但 demo 站從零建表、Factory 流程剛 provision 完 DB 立刻 deploy，沒既有資料可破壞，
    // 用 push 就能省掉「生成 migration → commit → deploy 才能用」這條長路。
    push: process.env.PAYLOAD_PUSH === '1',
  }),
  sharp,
  // R2 storage（gated on R2 env）；未設則 Media 走本地 staticDir
  plugins: r2StoragePlugins,
});
