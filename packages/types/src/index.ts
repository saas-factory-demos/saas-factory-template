/**
 * 客戶專案總設定
 * 決定這個站要啟用哪些網站類型、模組、provider
 *
 * 型別定義鏡像自 docs/config-schema.md，兩邊不能漂移
 */
export interface ProjectConfig {
  /** 專案基本資訊 */
  meta: ProjectMeta;

  /** 啟用的網站類型（可複選） */
  siteTypes: SiteType[];

  /** 多店家設定 */
  tenancy: TenancyConfig;

  /** 各功能模組設定 */
  modules: ModulesConfig;

  /** Provider 設定（金流／物流／發票／通知） */
  providers: ProvidersConfig;

  /** 主題設定 */
  theme: ThemeConfig;

  /** SEO ／ 分析 */
  seo: SEOConfig;
  analytics: AnalyticsConfig;

  /** 多語系 */
  i18n: I18nConfig;

  /** 法規合規 */
  compliance: ComplianceConfig;
}

// ─── 基本資訊 ────────────────────────────────

export interface ProjectMeta {
  /** 內部識別 */
  projectId: string;
  /** 客戶名稱 */
  clientName: string;
  /** 品牌名稱 */
  brandName: string;
  /** 主網域 */
  domain: string;
  contactEmail: string;
  contactPhone?: string;
  /** 統一編號 */
  businessRegistration?: string;
  createdAt: Date;
  /** 用於追蹤升級 */
  version: string;
}

// ─── 網站類型 ────────────────────────────────

export type SiteType =
  | 'cms'      // 形象站
  | 'shop'     // 電商
  | 'course'   // 課程
  | 'lp'       // 一頁式
  | 'blog';    // 部落格

// ─── 多店家 ────────────────────────────────

export interface TenancyConfig {
  enabled: boolean;
  mode: 'single' | 'multi';
  tenants?: Tenant[];
  /** 跨店共用會員 */
  sharedMembers: boolean;
  /** 跨店共用庫存 */
  sharedInventory: boolean;
  /** 跨店訂單統一看 */
  sharedOrders: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  enabledSiteTypes: SiteType[];
}

// ─── 模組設定 ────────────────────────────────

export interface ModulesConfig {
  shop?: ShopModuleConfig;
  course?: CourseModuleConfig;
  lp?: LPModuleConfig;
  cms?: CMSModuleConfig;
  blog?: BlogModuleConfig;
  marketing?: MarketingModuleConfig;
  reports?: ReportsModuleConfig;
}

// ── 電商模組 ──

export interface ShopModuleConfig {
  // 商品
  multiVariant: boolean;
  preOrder: boolean;
  digitalProducts: boolean;
  productVideo: boolean;
  product3DAR: boolean;

  // 庫存
  inventory: {
    enabled: boolean;
    preDeduct: boolean;
    preDeductTTL: number;
    safetyStock: boolean;
    multiWarehouse: boolean;
    batchTracking: boolean;
    crossChannelSync: boolean;
  };

  // 購物車與結帳
  guestCheckout: boolean;
  onePageCheckout: boolean;
  shippingCalculator: boolean;

  // 會員
  memberTiers: boolean;
  points: boolean;
  storedValue: boolean;
  birthdayReward: boolean;

  // 行銷
  wishlist: boolean;
  reviews: boolean;
  upsell: {
    orderBump: boolean;
    oneClickUpsell: boolean;
    crossSell: boolean;
  };
  flashSale: boolean;
  groupBuy: boolean;
  subscription: boolean;

  // 退換貨
  returnRequest: boolean;
  partialRefund: boolean;
  exchangeOrder: boolean;

  // Feeds
  feeds: {
    googleMerchant: boolean;
    metaCatalog: boolean;
    lineLAP: boolean;
    tiktok: boolean;
  };

  // 防詐刷
  fraudDetection: boolean;
}

// ── 課程模組 ──

export interface CourseModuleConfig {
  videoProvider: 'bunny' | 'mux';
  audioOnly: boolean;
  pdfWithAnnotations: boolean;
  interactiveExercise: boolean;

  watermark: {
    enabled: boolean;
    dynamic: boolean;
    content: 'email' | 'phone' | 'custom';
  };
  drm: boolean;
  deviceLimit: number;

  notesTimestamped: boolean;
  inVideoQuestion: boolean;
  speedMemory: boolean;
  autoplay: boolean;
  offlineDownload: boolean;
  backgroundPlay: boolean;

  quiz: boolean;
  assignment: boolean;
  peerReview: boolean;

  certificate: {
    enabled: boolean;
    blockchain: boolean;
    linkedInShare: boolean;
    expiration: boolean;
  };

  discussion: boolean;
  studentDirectory: boolean;
  externalCommunity: 'none' | 'line' | 'discord' | 'telegram';

  pricingMode: Array<'one-time' | 'subscription' | 'bundle' | 'pay-per-lesson'>;
  prelaunch: {
    crowdfunding: boolean;
    earlyBird: boolean;
  };

  liveClass: {
    enabled: boolean;
    provider: 'zoom' | 'meet' | 'jitsi';
    autoRecord: boolean;
  };

  b2bEnterprise: boolean;
  sso: Array<'saml' | 'oauth'>;

  multiInstructor: boolean;
  instructorRevShare: boolean;

  certifications: {
    govLearningHours: boolean;
    cpe: boolean;
  };
}

// ── 一頁式模組 ──

export interface LPModuleConfig {
  blockEditor: boolean;
  customBlocks: boolean;
  versionControl: boolean;
  scheduledPublish: boolean;
  passwordProtectedPreview: boolean;

  formCheckout: boolean;
  cashOnDelivery: boolean;
  threeTierPricing: boolean;
  orderBump: boolean;
  oneClickUpsell: boolean;
  /** OTO 層數（建議 2-3） */
  upsellLayers: number;

  exitIntent: boolean;
  liveNotifications: boolean;
  countdown: {
    enabled: boolean;
    mode: 'real' | 'dynamic';
  };
  visitorCounter: boolean;
  floatingCTA: boolean;
  heroVideo: boolean;

  multipleVersions: boolean;
  abTesting: boolean;
  utmTracking: boolean;
  customDomains: boolean;

  amp: boolean;
}

// ── 形象站模組 ──

export interface CMSModuleConfig {
  customPages: boolean;
  faq: boolean;
  contactForm: boolean;
  newsletter: boolean;
  teamProfile: boolean;
  portfolio: boolean;
  testimonials: boolean;
}

// ── 部落格模組 ──

export interface BlogModuleConfig {
  enabled: boolean;
  categories: boolean;
  tags: boolean;
  authors: boolean;
  comments: 'none' | 'native' | 'disqus';
  rssExport: boolean;
  relatedPosts: boolean;
  readingTime: boolean;
}

// ── 行銷模組 ──

export interface MarketingModuleConfig {
  automation: {
    enabled: boolean;
    triggers: AutomationTrigger[];
  };

  abandonedCart: {
    enabled: boolean;
    sequences: number;
  };

  retargeting: boolean;

  affiliate: {
    enabled: boolean;
    multiLevel: boolean;
  };
  referral: boolean;

  coupons: boolean;

  bannerScheduler: boolean;
}

export type AutomationTrigger =
  | 'order.completed'
  | 'order.cancelled'
  | 'cart.abandoned'
  | 'user.signup'
  | 'user.birthday'
  | 'user.inactive'
  | 'product.viewed'
  | 'product.back-in-stock'
  | 'subscription.created'
  | 'subscription.cancelled'
  | 'course.enrolled'
  | 'course.completed'
  | 'lesson.completed'
  | 'lp.viewed'
  | 'lp.form-started';

// ── 報表模組 ──

export interface ReportsModuleConfig {
  dashboard: boolean;
  customReports: boolean;
  scheduledExport: boolean;
  comparisonViews: boolean;
  forecasting: boolean;
  anomalyAlerts: boolean;
}

// ─── Provider 設定 ────────────────────────────────

export interface ProvidersConfig {
  payment: PaymentProviderConfig;
  invoice: InvoiceProviderConfig;
  shipping: ShippingProviderConfig;
  notification: NotificationProviderConfig;
  storage: StorageProviderConfig;
  video: VideoProviderConfig;
}

export interface PaymentProviderConfig {
  primary: PaymentProvider;
  enabled: {
    newebpay?: {
      methods: Array<
        | 'credit'
        | 'credit-installment'
        | 'atm'
        | 'cvs'
        | 'cvs-barcode'
        | 'linepay'
        | 'applepay'
        | 'googlepay'
        | 'samsungpay'
        | 'jkopay'
        | 'pi-wallet'
        | 'easycard'
        | 'esun-wallet'
      >;
      installmentPeriods?: Array<3 | 6 | 12 | 18 | 24>;
    };
    ecpay?: {
      methods: Array<
        | 'credit'
        | 'atm'
        | 'cvs'
        | 'barcode'
        | 'webatm'
        | 'applepay'
        | 'googlepay'
        | 'taiwanpay'
        | 'bnpl'
      >;
    };
    'linepay-official'?: boolean;
    'jkopay-official'?: boolean;
    tappay?: boolean;
    stripe?: {
      subscription: boolean;
      international: boolean;
    };
    paypal?: boolean;
    /** 儲值金 */
    storedValue?: boolean;
    /** B2B 匯款 */
    enterpriseTransfer?: boolean;
  };
}

export type PaymentProvider = 'newebpay' | 'ecpay' | 'tappay' | 'stripe' | 'paypal';

export interface InvoiceProviderConfig {
  provider: 'ezpay' | 'ecpay-invoice' | 'none';
  mode: 'instant' | 'trigger' | 'scheduled';
  b2bSupport: boolean;
  carrierTypes: Array<'mobile' | 'natural-person' | 'donation' | 'company'>;
}

export interface ShippingProviderConfig {
  enabled: {
    blackcat?: boolean;
    hct?: boolean;
    '7eleven'?: { codCheckout: boolean };
    'family-mart'?: { codCheckout: boolean };
    hilife?: { codCheckout: boolean };
    post?: boolean;
    /** 自取 */
    pickup?: boolean;
    international?: Array<'ems' | 'dhl' | 'fedex'>;
    /** 大型物流 */
    largeAppliance?: boolean;
    /** 冷鏈 */
    coldChain?: boolean;
  };
  /** 注意：未列入 'distance-based'（需 geo provider，列為 Phase 2） */
  feeRules: 'fixed' | 'weight-based' | 'custom';
}

export interface NotificationProviderConfig {
  email: 'resend' | 'sendgrid' | 'mailgun';
  sms?: 'mitake' | 'twilio';
  line: {
    messagingAPI: boolean;
    officialAccount: boolean;
  };
  webPush: boolean;
}

export interface StorageProviderConfig {
  primary: 'r2' | 's3' | 'local';
  cdn: 'cloudflare' | 'bunny' | 'none';
}

export interface VideoProviderConfig {
  primary: 'bunny' | 'mux';
}

// ─── 主題 ────────────────────────────────

/**
 * Theme preset key。
 *
 * 20 套細分 preset（與 `@saas-factory/factory-types` 的 `PresetKey` 對齊），
 * 另加 6 套舊版基底別名（`luxury` / `playful` / `corporate` / `academy`）作為
 * 向後相容 token，以及通用 fallback `'custom'`。
 *
 * goal-09i：原本 6 套基底改為 20 套 union，便於前台 design-tokens 套到客戶站
 * runtime 而不再丟資訊。新增細分 preset 需同步更新 `PresetKey`。
 */
export type ThemePresetKey =
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
  | 'realestate-prestige'
  | 'luxury'
  | 'playful'
  | 'corporate'
  | 'academy'
  | 'custom';

export interface ThemeConfig {
  preset: ThemePresetKey;
  tokens: DesignTokens;
  componentVariants?: Record<string, string>;
}

export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  /** 圓角程度 */
  radius: 'sharp' | 'subtle' | 'soft' | 'extra-soft';
  fontFamily: {
    sans: string;
    serif: string;
    display: string;
  };
  spacing: 'tight' | 'normal' | 'spacious';
  shadow: 'flat' | 'subtle' | 'soft' | 'dramatic';
}

// ─── SEO ────────────────────────────────

export interface SEOConfig {
  defaultTitle: string;
  defaultDescription: string;
  defaultOGImage?: string;
  /** 自動產 OG image */
  dynamicOGImage: boolean;
  schemaOrg: {
    organization: boolean;
    localBusiness: boolean;
    product: boolean;
    course: boolean;
    article: boolean;
    breadcrumb: boolean;
    faq: boolean;
    event: boolean;
  };
  sitemap: boolean;
  robots: boolean;
  hreflang: boolean;
}

// ─── 分析 ────────────────────────────────

export interface AnalyticsConfig {
  ga4?: { measurementId: string };
  metaPixel?: {
    pixelId: string;
    /** CAPI（伺服器端） */
    conversionAPI: boolean;
    capiAccessToken?: string;
  };
  gtm?: { containerId: string };
  tiktokPixel?: { pixelId: string };
  linePixel?: { tagId: string };
  hotjar?: { siteId: string };
  /** 內部用 */
  postHog?: { apiKey: string };
}

// ─── 多語系 ────────────────────────────────

export interface I18nConfig {
  enabled: boolean;
  defaultLocale: Locale;
  locales: Locale[];
  fallbackLocale: Locale;
  multiCurrency: boolean;
  currencies: Currency[];
  multiTimezone: boolean;
}

export type Locale =
  | 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'ko' | 'vi' | 'id' | 'th' | 'ms';

export interface Currency {
  code: 'TWD' | 'USD' | 'JPY' | 'EUR' | 'CNY' | 'KRW' | 'VND' | 'IDR' | 'THB' | 'MYR';
  symbol: string;
  /** 對 TWD 匯率 */
  rate?: number;
  taxIncluded: boolean;
}

// ─── 合規 ────────────────────────────────

export interface ComplianceConfig {
  /** GDPR-like */
  cookieConsent: boolean;
  privacyPolicy: boolean;
  termsOfService: boolean;
  refundPolicy: boolean;

  taiwan: {
    /** 個資法 */
    personalDataAct: boolean;
    /** 消保法 */
    consumerProtectionAct: boolean;
    /** 7 天鑑賞期 */
    sevenDayRefund: boolean;
    invoiceCompliance: boolean;
  };

  /** 後台 2FA */
  twoFactorAuth: boolean;
  /** 操作審計 */
  auditLog: boolean;
  /** 個資匯出（法定權利） */
  dataExport: boolean;
  /** 個資刪除（法定權利） */
  dataDeletion: boolean;
}

// ─── 預設值 ────────────────────────────────

export const defaultConfig: Partial<ProjectConfig> = {
  siteTypes: ['cms'],
  tenancy: {
    enabled: false,
    mode: 'single',
    sharedMembers: false,
    sharedInventory: false,
    sharedOrders: false,
  },
  theme: {
    preset: 'modern-minimal',
    tokens: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#666666',
        accent: '#0066ff',
        background: '#ffffff',
        foreground: '#1a1a1a',
      },
      // 預設圓角風（依 CLAUDE.md 設計偏好）
      radius: 'soft',
      fontFamily: {
        sans: 'system-ui',
        serif: 'Georgia',
        display: 'system-ui',
      },
      spacing: 'normal',
      shadow: 'subtle',
    },
  },
  i18n: {
    enabled: false,
    defaultLocale: 'zh-TW',
    locales: ['zh-TW'],
    fallbackLocale: 'zh-TW',
    multiCurrency: false,
    currencies: [{
      code: 'TWD',
      symbol: 'NT$',
      taxIncluded: true,
    }],
    multiTimezone: false,
  },
  compliance: {
    cookieConsent: true,
    privacyPolicy: true,
    termsOfService: true,
    refundPolicy: true,
    taiwan: {
      personalDataAct: true,
      consumerProtectionAct: true,
      sevenDayRefund: true,
      invoiceCompliance: true,
    },
    twoFactorAuth: true,
    auditLog: true,
    dataExport: true,
    dataDeletion: true,
  },
};
