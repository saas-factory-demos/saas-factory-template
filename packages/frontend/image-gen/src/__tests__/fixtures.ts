import type { PageComposition, ThemeSelection, WizardOutput } from '@saas-factory/factory-types';

/** 測試用最小 ThemeSelection，可覆寫部分欄位。 */
export function makeTheme(overrides: Partial<ThemeSelection> = {}): ThemeSelection {
  return {
    presetId: 'culinary-warmth',
    primaryColor: '#B8442A',
    accentColor: '#E8C07D',
    radius: 'soft',
    font: 'serif',
    density: 'spacious',
    darkMode: 'light',
    motionLevel: 3,
    ...overrides,
  };
}

/** 測試用最小 WizardOutput（只填生圖會用到的 theme / industry / frontend，其餘給合法預設值）。 */
export function makeWizard(overrides: { theme?: Partial<ThemeSelection>; pages?: PageComposition[] } = {}): WizardOutput {
  return {
    client: {
      clientName: '測試客戶',
      brandName: '測試品牌',
      contactEmail: 'test@example.com',
      subdomain: 'demo-test',
    },
    industry: 'restaurant',
    siteTypes: { enabled: ['cms'] },
    modules: { enabled: [] },
    integrations: {
      payments: [],
      shipping: [],
      invoice: { providers: [], mode: 'realtime' },
      notifications: [],
    },
    theme: makeTheme(overrides.theme),
    frontend: {
      pages: overrides.pages ?? [],
      effects: { spotlight: false, magneticCTA: false, parallax: false, meshGradient: false },
      aiCopy: { enabled: false },
    },
    i18n: {
      defaultLocale: 'zh-TW',
      enabledLocales: ['zh-TW'],
      multiCurrency: false,
      multiTimezone: false,
    },
    deploy: {
      target: 'vercel',
      repoName: 'demo-test',
      environments: ['production'],
    },
  };
}

/** 一頁含多種 image slot 的測試頁面（hero 背景 + features icon 陣列 + gallery）。 */
export const PAGE_WITH_IMAGES: PageComposition = {
  pageKey: 'homepage',
  blocks: [
    {
      id: 'b-hero',
      type: 'hero',
      variant: 'centered',
      visible: true,
      order: 0,
      config: {
        headline: '歡迎',
        backgroundImage: { src: '/p/hero.jpg', alt: '餐廳內景' },
      },
    },
    {
      id: 'b-feat',
      type: 'features-grid',
      variant: 'grid-3',
      visible: true,
      order: 1,
      config: {
        items: [
          { title: '新鮮食材', icon: { src: '/p/i1.jpg', alt: '新鮮食材' } },
          { title: '主廚手藝', icon: { src: '/p/i2.jpg', alt: '主廚手藝' } },
        ],
      },
    },
    {
      id: 'b-gallery',
      type: 'gallery.ambience',
      variant: 'grid',
      visible: true,
      order: 2,
      config: {
        images: [{ src: '/p/g1.jpg', alt: '用餐環境' }],
      },
    },
    {
      id: 'b-hidden',
      type: 'banner',
      variant: 'default',
      visible: false,
      order: 3,
      config: { image: { src: '/p/hidden.jpg', alt: '隱藏' } },
    },
  ],
};
