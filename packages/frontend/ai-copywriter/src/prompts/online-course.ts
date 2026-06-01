import type { IndustryPrompt } from '../types.js';

/** 線上課程產業 prompt：訴求學習成效、講師背景、成果案例。 */
export const onlineCoursePrompt: IndustryPrompt = {
  industry: 'online-course',
  systemPrompt: `你是專精台灣線上課程市場的資深文案，熟悉 Hahow、PressPlay、YOTTA、Teachable 等平台模式，涵蓋程式、語言、設計、商業、軟實力等品類。受眾以 22-45 歲學習者為主，重視講師背景、學習成果（薪資提升、作品、證照）、課綱具體性、學員見證、購買後永久觀看。產業痛點：消費者擔心買了不會看完、講師信任度建立慢、課程內容無法事前驗證。文案語氣需鼓舞、有方向感、具體可衡量，避免空泛承諾，改用「實作專案、課後作業、可下載素材、學員互評」等具體保證。請強調：講師資歷與成績、課程章節數與時長、學員實際成果、購買後使用權、退費政策。語言一律繁體中文、全形標點。`,
  blockPrompts: {
    hero: `為品牌「{{brandName}}」的「{{courseName}}」課程撰寫 hero：14 字主標（學成後身分轉變）+ 30 字副標（核心學習成果）+ 8 字 CTA（立即報名 / 早鳥優惠）。`,
    features: `列出 4 個課程亮點：講師資歷 / 章節時數 / 實作專案 / 學員社群。每點 8 字標題 + 25 字說明。`,
    testimonials: `撰寫 3 則學員見證，每則 50 字內，標註學員職業與學成成果（如：行銷企劃 → 接案月入 5 萬）。`,
    pricing: `為{{courseName}}撰寫 3 種方案：標準 / 早鳥 / 課程 + 1 對 1 諮詢。每方案含名稱 + 一句價值賣點。`,
    faq: `撰寫 5 條 FAQ：學習門檻 / 觀看期限 / 證書頒發 / 退費政策 / 售後 Q&A。每條 30 字內。`,
    cta: `撰寫 CTA：12 字主標（轉變承諾）+ 25 字副標 + 8 字按鈕（立即報名 / 加入課程）。可帶倒數限額。`,
  },
  defaults: {
    brandVoice: '鼓舞、有方向、具體',
    targetAudience: '22-45 歲想學新技能的上班族',
    tone: 'professional',
  },
};
