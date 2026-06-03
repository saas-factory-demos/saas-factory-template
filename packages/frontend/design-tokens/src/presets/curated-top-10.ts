import type { PresetKey } from '@saas-factory/factory-types';

/**
 * Top 10 策展推薦 preset（B — theme-factory 啟發）。
 *
 * Wizard 主題選擇頁的「精選 10 套」展示順序；對應 SaaS factory 最常見的
 * 10 種客戶 archetype。181 套 preset 完整列表保留在 `PRESET_KEYS`，但對
 * 「不知道怎麼選」的客戶這 10 套是 default recommendation。
 *
 * 來源：anthropics 官方 `theme-factory` skill 的「10 themes showcase」概念。
 * 與該 skill 的差異：那邊是 slide deck themes，我們這邊是網站 design tokens。
 *
 * 選擇原則：
 * 1. 涵蓋最常見產業 funnel（SaaS、電商、課程、餐廳、美容、醫療、律師、地產、NPO、個人品牌）
 * 2. 視覺差異要大（避免「都很 SaaS 風」用戶分不出來）
 * 3. light + dark 都支援良好
 * 4. 已策展（hand-crafted）優先於擴充（auto-generated）— 品質保證
 */
export const CURATED_TOP_10: ReadonlyArray<PresetKey> = [
  'modern-minimal', // 通用 SaaS / 顧問首選
  'beauty-boutique', // 美容 / 美妝 / 婚紗
  'culinary-warmth', // 餐飲 / 烘焙 / 食品
  'corporate-trust', // 法律 / 會計 / 金融
  'medical-clinical', // 醫療 / 牙醫 / 診所
  'academy-warm', // 線上課程 / 教育 / 親子
  'luxury-editorial', // 精品 / 奢華 / 時尚
  'realestate-prestige', // 房地產 / 建築
  'crowdfund-energy', // 募資 / 新創 / NGO
  'modern-minimal', // 個人品牌 — 與 SaaS 同基底但 motionLevel=1 較克制
];

/**
 * 第二層推薦：「主題探索」展示用的另外 10 套（從擴充庫精選）。
 *
 * Wizard 點「看更多風格」展開時顯示，涵蓋擴充庫的視覺極端。
 */
export const CURATED_EXPLORE_10: ReadonlyArray<PresetKey> = [
  'gaming', // 高彩、強動效
  'fintech-crypto', // 暗黑、漸層、未來感
  'ai-chatbot-platform', // AI / 對話介面
  'photography-studio', // 攝影 / 視覺工作室
  'yoga-and-stretching-guide', // 瑜伽 / 身心
  'meditation-and-mindfulness', // 冥想 / 自然
  'language-learning-app', // 教育 app
  'book-and-reading-tracker', // 閱讀 / 書店
  'newsletter-platform', // 內容 creator
  'design-system-component-library', // 設計師 / 工具
];
