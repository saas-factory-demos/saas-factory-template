/** 啟用的網站類型。對齊 `@saas-factory/types` 的客戶站 runtime SiteType。 */
export type SiteType = 'cms' | 'shop' | 'course' | 'lp' | 'blog';

/**
 * 產業類別（33 項）。屬於 meta 維度，影響推薦 preset 與 blocks，
 * 但不等於模組勾選。來源：goal-09 frontend-factory 規格。
 */
export type Industry =
  // 電商（10）
  | 'supplement'
  | 'tech-accessories'
  | 'fashion-apparel'
  | 'beauty-skincare'
  | 'home-furniture'
  | 'food-snacks'
  | 'baby-mom'
  | 'pet-supplies'
  | 'sports-outdoor'
  | 'craft-design'
  // 服務（8）
  | 'online-course'
  | 'fitness-gym'
  | 'salon'
  | 'medical-aesthetic'
  | 'dental-clinic'
  | 'restaurant'
  | 'travel-tour'
  | 'wedding'
  // B2B / 企業（6）
  | 'saas-software'
  | 'consulting'
  | 'manufacturing'
  | 'print-design'
  | 'logistics-trade'
  | 'legal-accounting'
  // 特殊（9）
  | 'ai-web3'
  | 'realestate'
  | 'crowdfunding'
  | 'nonprofit'
  | 'personal-brand'
  | 'event-conference'
  | 'nightclub-bar'
  | 'church-religion'
  | 'political-campaign';

/** 33 個 Industry 的 runtime 列表（給 Zod / 表單用）。 */
export const INDUSTRIES = [
  'supplement',
  'tech-accessories',
  'fashion-apparel',
  'beauty-skincare',
  'home-furniture',
  'food-snacks',
  'baby-mom',
  'pet-supplies',
  'sports-outdoor',
  'craft-design',
  'online-course',
  'fitness-gym',
  'salon',
  'medical-aesthetic',
  'dental-clinic',
  'restaurant',
  'travel-tour',
  'wedding',
  'saas-software',
  'consulting',
  'manufacturing',
  'print-design',
  'logistics-trade',
  'legal-accounting',
  'ai-web3',
  'realestate',
  'crowdfunding',
  'nonprofit',
  'personal-brand',
  'event-conference',
  'nightclub-bar',
  'church-religion',
  'political-campaign',
] as const satisfies readonly Industry[];

/** 20 套風格 preset key，對應未來 packages/frontend/* design tokens。 */
export type PresetKey =
  | 'modern-minimal'
  | 'luxury-editorial'
  | 'playful-bold'
  | 'corporate-trust'
  | 'academy-warm'
  | 'organic-wellness'
  | 'street-edge'
  | 'cyber-tech'
  | 'retro-nostalgic'
  | 'magazine-editorial'
  | 'artisan-craft'
  | 'beauty-boutique'
  | 'medical-clinical'
  | 'culinary-warmth'
  | 'travel-escape'
  | 'nightclub-neon'
  | 'sacred-serenity'
  | 'civic-bold'
  | 'crowdfund-energy'
  | 'realestate-prestige';

/** 20 個 PresetKey 的 runtime 列表。 */
export const PRESET_KEYS = [
  'modern-minimal',
  'luxury-editorial',
  'playful-bold',
  'corporate-trust',
  'academy-warm',
  'organic-wellness',
  'street-edge',
  'cyber-tech',
  'retro-nostalgic',
  'magazine-editorial',
  'artisan-craft',
  'beauty-boutique',
  'medical-clinical',
  'culinary-warmth',
  'travel-escape',
  'nightclub-neon',
  'sacred-serenity',
  'civic-bold',
  'crowdfund-energy',
  'realestate-prestige',
] as const satisfies readonly PresetKey[];

/** 暗色模式偏好。 */
export type DarkModePreference = 'light' | 'dark' | 'both' | 'auto';

/** 動畫等級（1=極簡到 5=強烈）。 */
export type MotionLevel = 1 | 2 | 3 | 4 | 5;

/** 金流方案 slug。 */
export type PaymentProvider =
  | 'newebpay'
  | 'ecpay'
  | 'linepay'
  | 'jkos'
  | 'tappay'
  | 'stripe'
  | 'paypal';

/** 物流方案 slug。 */
export type ShippingProvider =
  | 'tcat'
  | 'seven-eleven'
  | 'family-mart'
  | 'hct'
  | 'hilife'
  | 'post'
  | 'international';

/** 發票方案 slug。 */
export type InvoiceProvider = 'ezpay' | 'ecpay-invoice';

/** 發票開立模式。 */
export type InvoiceMode = 'realtime' | 'trigger' | 'scheduled';

/** 通知通道。 */
export type NotificationChannel = 'email' | 'line' | 'sms' | 'web-push';

/** 部署目標。 */
export type DeployTarget = 'vercel' | 'zeabur' | 'docker';

/** 圓角偏好。 */
export type RadiusPreference = 'sharp' | 'subtle' | 'soft' | 'extra-soft';

/** 字體偏好。 */
export type FontPreference = 'sans' | 'serif' | 'display' | 'mixed';

/** 視覺密度。 */
export type DensityPreference = 'compact' | 'normal' | 'spacious';

/** 模組 slug（細項勾選 module）。 */
export type ModuleSlug =
  // 電商
  | 'shop.product-variants'
  | 'shop.subscription'
  | 'shop.order-bump'
  | 'shop.oto'
  | 'shop.preorder'
  | 'shop.digital'
  | 'shop.points'
  | 'shop.tiers'
  | 'shop.wishlist'
  | 'shop.returns'
  | 'shop.multi-channel-inventory'
  | 'shop.product-feed'
  // 課程
  | 'course.watermark'
  | 'course.device-limit'
  | 'course.offline-download'
  | 'course.quiz'
  | 'course.assignment'
  | 'course.certificate'
  | 'course.live'
  | 'course.crowdfunding'
  | 'course.b2b'
  | 'course.interactive'
  | 'course.peer-review'
  // LP
  | 'lp.ab-test'
  | 'lp.exit-intent'
  | 'lp.notifications'
  | 'lp.countdown'
  | 'lp.sticky-cta'
  | 'lp.oto-funnel'
  | 'lp.cod'
  // 行銷
  | 'marketing.abandoned-cart'
  | 'marketing.referral'
  | 'marketing.affiliate'
  | 'marketing.automation-engine'
  | 'marketing.flash-sale'
  | 'marketing.group-buy'
  | 'marketing.email-campaigns'
  | 'marketing.line-marketing'
  | 'marketing.loyalty'
  | 'marketing.segments'
  | 'marketing.banner'
  | 'marketing.coupons'
  | 'marketing.retargeting'
  // CMS（形象站）
  | 'cms.about'
  | 'cms.contact'
  | 'cms.team'
  | 'cms.faq'
  | 'cms.testimonials'
  | 'cms.case-studies'
  | 'cms.locations'
  | 'cms.careers'
  // Blog（部落格）
  | 'blog.categories'
  | 'blog.tags'
  | 'blog.author-profiles'
  | 'blog.rss'
  | 'blog.search'
  | 'blog.related-posts'
  | 'blog.comments'
  | 'blog.newsletter';

/**
 * 所有合法的 ModuleSlug runtime 列表（給 Zod / 表單驗證用）。
 *
 * 利用 `satisfies readonly ModuleSlug[]` 強制完整性：若新增 ModuleSlug 但
 * 漏加入此陣列，TS 不會直接報錯，但任何 `as const` 比對都會抓到 — 因此
 * 新增 slug 時請同步增列在這裡。
 */
export const MODULE_SLUGS = [
  'shop.product-variants',
  'shop.subscription',
  'shop.order-bump',
  'shop.oto',
  'shop.preorder',
  'shop.digital',
  'shop.points',
  'shop.tiers',
  'shop.wishlist',
  'shop.returns',
  'shop.multi-channel-inventory',
  'shop.product-feed',
  'course.watermark',
  'course.device-limit',
  'course.offline-download',
  'course.quiz',
  'course.assignment',
  'course.certificate',
  'course.live',
  'course.crowdfunding',
  'course.b2b',
  'course.interactive',
  'course.peer-review',
  'lp.ab-test',
  'lp.exit-intent',
  'lp.notifications',
  'lp.countdown',
  'lp.sticky-cta',
  'lp.oto-funnel',
  'lp.cod',
  'marketing.abandoned-cart',
  'marketing.referral',
  'marketing.affiliate',
  'marketing.automation-engine',
  'marketing.flash-sale',
  'marketing.group-buy',
  'marketing.email-campaigns',
  'marketing.line-marketing',
  'marketing.loyalty',
  'marketing.segments',
  'marketing.banner',
  'marketing.coupons',
  'marketing.retargeting',
  'cms.about',
  'cms.contact',
  'cms.team',
  'cms.faq',
  'cms.testimonials',
  'cms.case-studies',
  'cms.locations',
  'cms.careers',
  'blog.categories',
  'blog.tags',
  'blog.author-profiles',
  'blog.rss',
  'blog.search',
  'blog.related-posts',
  'blog.comments',
  'blog.newsletter',
] as const satisfies readonly ModuleSlug[];

/**
 * 產業元資料：給 Wizard 推薦 preset / siteTypes / modules 用。
 *
 * 33 個產業的字典在 `./industries.ts` 的 `INDUSTRY_METADATA`。
 */
export interface IndustryMetadata {
  /** Industry slug（同 dict key）。 */
  key: Industry;
  /** 顯示名稱（繁中）。 */
  displayName: string;
  /** 大分類，與 Industry 註解的四大群組對應。 */
  category: 'commerce' | 'service' | 'b2b' | 'special';
  /** 推薦的 site type（Wizard 第 2 步預設勾選）。 */
  recommendedSiteTypes: readonly SiteType[];
  /** 推薦的模組（Wizard 第 3 步預設勾選）。 */
  recommendedModules: readonly ModuleSlug[];
  /** 推薦的 design preset（Wizard 第 4 步預選）。 */
  recommendedPresetId: PresetKey;
}

/** Wizard 第一步：客戶資料。 */
export interface ClientInfo {
  clientName: string;
  brandName: string;
  contactEmail: string;
  contactPhone?: string;
  taxId?: string;
  /** subdomain（例：xxx.factory.app）。 */
  subdomain: string;
  /** 自訂 domain（可選，後續可改）。 */
  customDomain?: string;
}

/** Wizard 第二步：網站類型勾選。 */
export interface SiteTypeSelection {
  enabled: SiteType[];
  /** 若 lp 勾選，可同時建多支 LP。 */
  lpCount?: number;
}

/** Wizard 第三步：模組勾選。 */
export interface ModuleSelection {
  enabled: ModuleSlug[];
}

/** Wizard 第四步：金流物流發票通知。 */
export interface IntegrationSelection {
  payments: PaymentProvider[];
  shipping: ShippingProvider[];
  invoice: { providers: InvoiceProvider[]; mode: InvoiceMode };
  notifications: NotificationChannel[];
}

/** Wizard 第五步：主題與品牌。 */
export interface ThemeSelection {
  /** 風格 preset。goal-09 後改用 PresetKey enum。 */
  presetId: PresetKey;
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  radius: RadiusPreference;
  font: FontPreference;
  density: DensityPreference;
  /** 暗色模式偏好（goal-09 新增）。 */
  darkMode: DarkModePreference;
  /** 動畫強度等級（goal-09 新增）。 */
  motionLevel: MotionLevel;
}

/**
 * 前台 Tier 1 高頻 Block 種類字面聯集（goal-09e 收緊）。
 *
 * 對應 `packages/frontend/blocks-library` 的 Tier 1 區塊清單（20 項）。
 * blocks-library 的 `BLOCK_REGISTRY` 與 schema 完整覆蓋此 20 個 key。
 */
export type FrontendTier1BlockKey =
  | 'hero'
  | 'header'
  | 'footer'
  | 'features-grid'
  | 'stats'
  | 'testimonials'
  | 'cta'
  | 'faq'
  | 'logo-cloud'
  | 'content-section'
  | 'pricing-table'
  | 'team'
  | 'timeline'
  | 'gallery'
  | 'newsletter'
  | 'contact'
  | 'breadcrumb'
  | 'tabs-section'
  | 'steps'
  | 'banner';

/** 20 個 Tier 1 block key 的 runtime 列表（給 Zod / registry 用）。 */
export const FRONTEND_TIER1_BLOCK_KEYS = [
  'hero',
  'header',
  'footer',
  'features-grid',
  'stats',
  'testimonials',
  'cta',
  'faq',
  'logo-cloud',
  'content-section',
  'pricing-table',
  'team',
  'timeline',
  'gallery',
  'newsletter',
  'contact',
  'breadcrumb',
  'tabs-section',
  'steps',
  'banner',
] as const satisfies readonly FrontendTier1BlockKey[];

/**
 * industry-templates（09f）採用的 dotted slug 風格 block key。
 *
 * 每個 slug 格式為 `<category>.<sub-style>`，由 33 個產業範本檔列舉而來。
 * 後續 Tier 2 / Tier 3 擴充新 industry block 時補入此 union；blocks-library 暫不必為其
 * 註冊 Component，BlockRenderer 在 09i 會做 fallback。
 */
export type FrontendIndustryBlockSlug =
  | 'blog.latest-posts'
  | 'category.tiles'
  | 'content.agenda-timeline'
  | 'content.brand-story'
  | 'content.case-study'
  | 'content.coverage-map'
  | 'content.event-list'
  | 'content.financial-transparency'
  | 'content.funding-progress'
  | 'content.impact-stats'
  | 'content.ingredient-spotlight'
  | 'content.intro'
  | 'content.itinerary-timeline'
  | 'content.location-map'
  | 'content.manifesto'
  | 'content.policy-pillars'
  | 'content.process-showcase'
  | 'content.product-demo'
  | 'content.roadmap'
  | 'content.routine-guide'
  | 'content.service-times'
  | 'content.style-guide'
  | 'content.tracking-demo'
  | 'content.welcome-message'
  | 'course.curriculum'
  | 'cta.back-now'
  | 'cta.booking'
  | 'cta.buy-ticket'
  | 'cta.consultation'
  | 'cta.contact'
  | 'cta.donate'
  | 'cta.enroll'
  | 'cta.final'
  | 'cta.free-trial'
  | 'cta.inquiry'
  | 'cta.membership'
  | 'cta.newsletter'
  | 'cta.quote-form'
  | 'cta.reservation'
  | 'cta.trial-offer'
  | 'cta.visit-us'
  | 'cta.volunteer-signup'
  | 'cta.waitlist'
  | 'faq.accordion'
  | 'features.grid-3'
  | 'footer.blog'
  | 'footer.corporate'
  | 'footer.shop'
  | 'gallery.ambience'
  | 'gallery.before-after'
  | 'gallery.destination'
  | 'gallery.facility-tour'
  | 'gallery.floorplans'
  | 'gallery.lookbook'
  | 'gallery.party-night'
  | 'gallery.portfolio'
  | 'gallery.room-inspiration'
  | 'hero.course'
  | 'hero.editorial'
  | 'hero.product-showcase'
  | 'hero.split'
  | 'marketing.countdown-banner'
  | 'marketing.flash-sale-banner'
  | 'pricing.tiers'
  | 'product.catalog'
  | 'product.comparison'
  | 'product.featured-grid'
  | 'profile.about-card'
  | 'profile.candidate'
  | 'profile.chef'
  | 'profile.coach-grid'
  | 'profile.consultant-grid'
  | 'profile.core-team'
  | 'profile.dj-grid'
  | 'profile.doctor-grid'
  | 'profile.instructor'
  | 'profile.partner-grid'
  | 'profile.speaker-grid'
  | 'profile.stylist-grid'
  | 'shop.instant-quote'
  | 'shop.subscription-cta'
  | 'social.client-logos'
  | 'social.instagram-feed'
  | 'social.platform-links'
  | 'social.press-mentions'
  | 'testimonials.carousel';

/**
 * 前台所有合法 Block key 聯集（goal-09e 收緊）。
 *
 * 收斂 Tier 1 simple key（給 blocks-library 用）與 industry-templates dotted slug。
 * 09e 之前 `BlockInstance.type` 為 `string`，收緊後僅允許這兩組已知 key。
 *
 * 後續擴充規則：
 * - 新增 Tier 1 base block → 加入 `FrontendTier1BlockKey`
 * - 新增 industry-specific block → 加入 `FrontendIndustryBlockSlug`
 */
export type FrontendBlockKey = FrontendTier1BlockKey | FrontendIndustryBlockSlug;

/**
 * Block 實例（單頁面內一個區塊）。
 * `type` 在 09e 收緊為 `FrontendBlockKey` enum；`variant` 維持 string，
 * 由各 block 自己的 Zod schema 進一步驗證。
 */
export interface BlockInstance {
  id: string;
  type: FrontendBlockKey;
  variant: string;
  config: Record<string, unknown>;
  visible: boolean;
  order: number;
}

/** 單一頁面的 block 組合。 */
export interface PageComposition {
  /** 頁面 key，例如 'homepage' / 'about' / 'product-list'。 */
  pageKey: string;
  blocks: BlockInstance[];
}

/** Wizard 新增步驟：前台組裝（goal-09 新增）。 */
export interface FrontendSelection {
  pages: PageComposition[];
  effects: {
    spotlight: boolean;
    magneticCTA: boolean;
    parallax: boolean;
    meshGradient: boolean;
  };
  aiCopy: {
    enabled: boolean;
    brandVoice?: string;
    targetAudience?: string;
    keySellingPoints?: string[];
  };
}

/** Wizard 第六步：多語系。 */
export interface I18nSelection {
  defaultLocale: string;
  enabledLocales: string[];
  multiCurrency: boolean;
  multiTimezone: boolean;
}

/** Wizard 第七步：部署設定。 */
export interface DeploySelection {
  target: DeployTarget;
  repoName: string;
  /** 同時建 staging + production，或先 staging。 */
  environments: Array<'staging' | 'production'>;
  customDomain?: string;
  /**
   * GitHub repo 可見性。
   * 預設 `true`（私有，正式客戶交付走這條）；demo / 開源樣板才設 `false`。
   * 為何 demo 要 public：Vercel Hobby plan 不支援 org private repo，
   * demo 站走 Hobby 就只能公開（要私有得升 Pro）。
   */
  privateRepo?: boolean;
}

/** Wizard 完整輸出（goal-09 後 10 個欄位，含 industry 與 frontend）。 */
export interface WizardOutput {
  client: ClientInfo;
  /** 產業（goal-09 新增，meta 維度，影響推薦預設值）。 */
  industry: Industry;
  siteTypes: SiteTypeSelection;
  modules: ModuleSelection;
  integrations: IntegrationSelection;
  theme: ThemeSelection;
  /** 前台組裝（goal-09 新增）。 */
  frontend: FrontendSelection;
  i18n: I18nSelection;
  deploy: DeploySelection;
}

/**
 * Wizard 步驟 label（給 UI 顯示用）。
 * goal-09 從 apps/factory/app/new/wizard-form.tsx 抽出，避免重複定義。
 * goal-09h：8 步 → 11 步，新增「產業」、「風格預覽」、「區塊組合」、「AI 文案」。
 */
export const WIZARD_STEPS = [
  '客戶資料',
  '產業',
  '網站類型',
  '模組勾選',
  '金物流通知',
  '主題',
  '風格預覽',
  '區塊組合',
  'AI 文案',
  '多語系',
  '部署',
  '確認送出',
] as const;

/** Wizard 步驟字面型別。 */
export type WizardStepLabel = (typeof WIZARD_STEPS)[number];

/** 已生成的客戶專案。 */
export interface Project {
  id: string;
  /** Wizard 完整快照。 */
  wizard: WizardOutput;
  /** 對應 generation id。 */
  generationId: string;
  /** 對應 GitHub repo URL。 */
  repoUrl?: string;
  /** 對應 deployment URL。 */
  deployUrl?: string;
  /** 對應 admin URL。 */
  adminUrl?: string;
  /** 用的 template tag。 */
  templateVersion?: string;
  status: 'generating' | 'ready' | 'live' | 'archived' | 'generation-failed' | 'deployed-but-incomplete';
  createdAt: Date;
  updatedAt: Date;
}

/** 生成流程步驟。 */
export type GenerationStep =
  | 'create-repo'
  | 'clone'
  | 'write-config'
  | 'apply-theme'
  | 'prune-modules'
  | 'write-env-template'
  | 'commit-push'
  | 'create-sentry-project'
  | 'provision-db'
  | 'deploy'
  | 'bootstrap-admin'
  | 'install-support-access'
  | 'generate-images'
  | 'seed-pages'
  | 'send-email';

/** 生成過程紀錄。 */
export interface ProjectGeneration {
  id: string;
  projectId?: string;
  /** Wizard 輸入快照。 */
  wizard: WizardOutput;
  status: 'pending' | 'running' | 'success' | 'failed' | 'rolled-back';
  /** 目前進行到的步驟。 */
  step?: GenerationStep;
  /** 已完成步驟。 */
  completedSteps: GenerationStep[];
  /** 失敗原因 + 出錯的 step。 */
  error?: { step: GenerationStep; message: string };
  /** 產出資源。 */
  outputs: {
    repoUrl?: string;
    /**
     * 真實 git clone 用的 URL（可能內嵌 PAT 等認證）；與 repoUrl 區隔避免把 token
     * 寫進顯示給 user / project DB 的位置。
     */
    repoCloneUrl?: string;
    deployUrl?: string;
    adminUrl?: string;
    adminEmail?: string;
    adminPassword?: string;
    templateVersion?: string;
    /** Sentry self-hosted 給該客戶站的 DSN（步驟 create-sentry-project 寫入）。 */
    sentryDsn?: string;
    /** Sentry project slug（= 客戶 subdomain）。 */
    sentryProjectSlug?: string;
    /**
     * Neon Postgres connection string（步驟 provision-db 寫入）。
     * 不對外顯示，僅作為 deploy step 注入 Vercel env 的來源。
     */
    databaseUrl?: string;
    /** Neon project id（後續 rollback / 刪除用）。 */
    neonProjectId?: string;
    /** Vercel project id（步驟 deploy 寫入；rollback 刪 project / debug 查狀態用）。 */
    vercelProjectId?: string;
    /**
     * 已 seed 到客戶站的頁數（步驟 seed-pages 寫入）。
     * 0 表示該步驟 noop（wizard.frontend.pages 為空 / adapter 未注入）。
     */
    seededPageCount?: number;
    /**
     * 已生成並 ingest 進客戶站 Media 的搭配圖數（步驟 generate-images 寫入）。
     * 0 / undefined 表示該步驟 noop（未注入 imageFiller / 無圖位 / 無 deployUrl）。
     */
    generatedImageCount?: number;
    /**
     * 該站盤點到的 image slot 總數（generate-images 寫入）。
     * 用來算填充率：generatedImageCount / imageSlotCount，後台 / 報告層可立刻看到部分失敗。
     */
    imageSlotCount?: number;
    /** 生圖或 ingest 失敗的 slot 數（不含 budget 中止）。> 0 表示有部分 slot 沒圖、需要單張重生。 */
    imageGenFailedCount?: number;
    /** generate-images 是否因預算用盡而提早結束。 */
    imageGenBudgetExhausted?: boolean;
    /**
     * Factory Support Access（ADR-0100）provision 結果。
     * 詳見 goal-11；未啟用 supportAccessProvisioner 時為 undefined。
     */
    supportAccess?: {
      email: string;
      /** 第一次 provision 時的密碼；idempotent 時為 null。應立即收入 Bitwarden 後從 outputs 清掉。 */
      initialPassword: string | null;
      alreadyProvisioned: boolean;
      /** ISO timestamp。 */
      provisionedAt: string;
    };
  };
  startedAt: Date;
  completedAt?: Date;
}

export { INDUSTRY_METADATA } from './industries.js';
