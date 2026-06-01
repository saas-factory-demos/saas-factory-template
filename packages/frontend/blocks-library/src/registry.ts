import { FRONTEND_TIER1_BLOCK_KEYS } from '@saas-factory/factory-types';

import { Banner, BANNER_VARIANTS, bannerDefaults, bannerSchema } from './blocks/banner/index.js';
import { Breadcrumb, BREADCRUMB_VARIANTS, breadcrumbDefaults, breadcrumbSchema } from './blocks/breadcrumb/index.js';
import { Contact, CONTACT_VARIANTS, contactDefaults, contactSchema } from './blocks/contact/index.js';
import { ContentSection, CONTENT_SECTION_VARIANTS, contentSectionDefaults, contentSectionSchema } from './blocks/content-section/index.js';
import { Cta, CTA_VARIANTS, ctaBlockSchema, ctaDefaults } from './blocks/cta/index.js';
import { Faq, FAQ_VARIANTS, faqDefaults, faqSchema } from './blocks/faq/index.js';
import { FeaturesGrid, FEATURES_GRID_VARIANTS, featuresGridDefaults, featuresGridSchema } from './blocks/features-grid/index.js';
import { Footer, FOOTER_VARIANTS, footerDefaults, footerSchema } from './blocks/footer/index.js';
import { Gallery, GALLERY_VARIANTS, galleryDefaults, gallerySchema } from './blocks/gallery/index.js';
import { Header, HEADER_VARIANTS, headerDefaults, headerSchema } from './blocks/header/index.js';
import { Hero, HERO_VARIANTS, heroDefaults, heroSchema } from './blocks/hero/index.js';
import { LogoCloud, LOGO_CLOUD_VARIANTS, logoCloudDefaults, logoCloudSchema } from './blocks/logo-cloud/index.js';
import { Newsletter, NEWSLETTER_VARIANTS, newsletterDefaults, newsletterSchema } from './blocks/newsletter/index.js';
import { PricingTable, PRICING_TABLE_VARIANTS, pricingTableDefaults, pricingTableSchema } from './blocks/pricing-table/index.js';
import { Stats, STATS_VARIANTS, statsDefaults, statsSchema } from './blocks/stats/index.js';
import { Steps, STEPS_VARIANTS, stepsDefaults, stepsSchema } from './blocks/steps/index.js';
import { TabsSection, TABS_SECTION_VARIANTS, tabsSectionDefaults, tabsSectionSchema } from './blocks/tabs-section/index.js';
import { Team, TEAM_VARIANTS, teamDefaults, teamSchema } from './blocks/team/index.js';
import { Testimonials, TESTIMONIALS_VARIANTS, testimonialsDefaults, testimonialsSchema } from './blocks/testimonials/index.js';
import { Timeline, TIMELINE_VARIANTS, timelineDefaults, timelineSchema } from './blocks/timeline/index.js';

import type { BlockRegistry } from './types.js';

/**
 * 20 個 Tier 1 block 的中央 registry。
 *
 * Wizard、template-writer、storybook 透過此 map 取得：
 * - schema：驗證 user / AI 產出的 config
 * - component：實際渲染 block 的 React 元件
 * - displayName：UI 顯示名稱（繁中）
 * - variants：版型 slug 清單（給 UI 切換器使用）
 * - defaultConfig：新增 block instance 時的預設 props
 */
// 使用 unknown 中介轉型避免 BlockRegistry 對每個 key 嚴格泛型協變的 TS 噪音
// （個別 entry 已透過 schema + defaultConfig 同源 z.infer，類型在外層仍安全）。
export const BLOCK_REGISTRY: BlockRegistry = {
  hero: {
    schema: heroSchema,
    component: Hero,
    displayName: '首屏 Hero',
    variants: HERO_VARIANTS,
    defaultConfig: heroDefaults,
  },
  header: {
    schema: headerSchema,
    component: Header,
    displayName: '頁首導覽',
    variants: HEADER_VARIANTS,
    defaultConfig: headerDefaults,
  },
  footer: {
    schema: footerSchema,
    component: Footer,
    displayName: '頁尾',
    variants: FOOTER_VARIANTS,
    defaultConfig: footerDefaults,
  },
  'features-grid': {
    schema: featuresGridSchema,
    component: FeaturesGrid,
    displayName: '功能特色',
    variants: FEATURES_GRID_VARIANTS,
    defaultConfig: featuresGridDefaults,
  },
  stats: {
    schema: statsSchema,
    component: Stats,
    displayName: '數據統計',
    variants: STATS_VARIANTS,
    defaultConfig: statsDefaults,
  },
  testimonials: {
    schema: testimonialsSchema,
    component: Testimonials,
    displayName: '客戶見證',
    variants: TESTIMONIALS_VARIANTS,
    defaultConfig: testimonialsDefaults,
  },
  cta: {
    schema: ctaBlockSchema,
    component: Cta,
    displayName: '行動呼籲 CTA',
    variants: CTA_VARIANTS,
    defaultConfig: ctaDefaults,
  },
  faq: {
    schema: faqSchema,
    component: Faq,
    displayName: '常見問題',
    variants: FAQ_VARIANTS,
    defaultConfig: faqDefaults,
  },
  'logo-cloud': {
    schema: logoCloudSchema,
    component: LogoCloud,
    displayName: '客戶 Logo 牆',
    variants: LOGO_CLOUD_VARIANTS,
    defaultConfig: logoCloudDefaults,
  },
  'content-section': {
    schema: contentSectionSchema,
    component: ContentSection,
    displayName: '內容區塊',
    variants: CONTENT_SECTION_VARIANTS,
    defaultConfig: contentSectionDefaults,
  },
  'pricing-table': {
    schema: pricingTableSchema,
    component: PricingTable,
    displayName: '方案訂價',
    variants: PRICING_TABLE_VARIANTS,
    defaultConfig: pricingTableDefaults,
  },
  team: {
    schema: teamSchema,
    component: Team,
    displayName: '團隊成員',
    variants: TEAM_VARIANTS,
    defaultConfig: teamDefaults,
  },
  timeline: {
    schema: timelineSchema,
    component: Timeline,
    displayName: '時間軸',
    variants: TIMELINE_VARIANTS,
    defaultConfig: timelineDefaults,
  },
  gallery: {
    schema: gallerySchema,
    component: Gallery,
    displayName: '圖庫',
    variants: GALLERY_VARIANTS,
    defaultConfig: galleryDefaults,
  },
  newsletter: {
    schema: newsletterSchema,
    component: Newsletter,
    displayName: '電子報訂閱',
    variants: NEWSLETTER_VARIANTS,
    defaultConfig: newsletterDefaults,
  },
  contact: {
    schema: contactSchema,
    component: Contact,
    displayName: '聯絡我們',
    variants: CONTACT_VARIANTS,
    defaultConfig: contactDefaults,
  },
  breadcrumb: {
    schema: breadcrumbSchema,
    component: Breadcrumb,
    displayName: '麵包屑導覽',
    variants: BREADCRUMB_VARIANTS,
    defaultConfig: breadcrumbDefaults,
  },
  'tabs-section': {
    schema: tabsSectionSchema,
    component: TabsSection,
    displayName: '頁籤區塊',
    variants: TABS_SECTION_VARIANTS,
    defaultConfig: tabsSectionDefaults,
  },
  steps: {
    schema: stepsSchema,
    component: Steps,
    displayName: '流程步驟',
    variants: STEPS_VARIANTS,
    defaultConfig: stepsDefaults,
  },
  banner: {
    schema: bannerSchema,
    component: Banner,
    displayName: '橫幅 Banner',
    variants: BANNER_VARIANTS,
    defaultConfig: bannerDefaults,
  },
};

/** 取得 registry 內所有 block key（與 factory-types 順序對齊）。 */
export const BLOCK_KEYS = FRONTEND_TIER1_BLOCK_KEYS;
