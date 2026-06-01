import type { LandingTemplate } from '../types.js';

/** 活動報名範本。 */
export const eventTemplate: LandingTemplate = {
  id: 'event-v1',
  name: '活動報名標準版',
  category: 'event',
  description: '主打時間地點、講者陣容、議程。適合音樂節、講座、研討會、實體活動。',
  suitableFor: ['講座', '研討會', '音樂節', '展覽', '路跑'],
  brandColors: {
    primary: '#FF3E66',
    accent: '#2D2D44',
    background: '#FFFFFF',
    text: '#1F1F33',
  },
  defaultBlocks: [
    {
      type: 'hero',
      props: {
        headline: '2026 創業者高峰會｜30 位連續創業家同台',
        subheadline: '6 月 28 日 台北南港展覽館｜一天聽完 10 年實戰',
        media: { kind: 'image', url: '/placeholder/event-hero.jpg' },
        cta: { label: '立即報名', anchor: '#checkout' },
      },
    },
    {
      type: 'features',
      props: {
        title: '為什麼您一定要來',
        items: [
          { title: '頂尖講者陣容', desc: '30 位獨角獸創辦人 / 連續創業家' },
          { title: '主題深入', desc: '從 0 到 1、A 輪募資、跨境擴張' },
          { title: '專屬社交時段', desc: '中午 / 茶歇 / 晚宴三場 networking' },
          { title: '會後資料包', desc: '完整講義 + 影片回看' },
        ],
      },
    },
    {
      type: 'specs',
      props: {
        title: '活動資訊',
        rows: [
          { label: '日期', value: '2026 年 6 月 28 日（六）' },
          { label: '時間', value: '09:00 - 21:00' },
          { label: '地點', value: '台北南港展覽館 2 館 7F' },
          { label: '人數上限', value: '500 位' },
          { label: '語言', value: '中文（部分場次英文有逐步口譯）' },
        ],
      },
    },
    {
      type: 'gallery',
      props: {
        title: '往屆活動現場',
        images: [
          '/placeholder/event-1.jpg',
          '/placeholder/event-2.jpg',
          '/placeholder/event-3.jpg',
          '/placeholder/event-4.jpg',
        ],
      },
    },
    {
      type: 'testimonials',
      props: {
        title: '往屆參與者怎麼說',
        items: [
          { name: '張O翔', role: 'SaaS 創辦人', text: '一天的價值勝過讀十本書，當天就拿到兩個投資人聯繫。' },
          { name: '李O美', role: '行銷顧問', text: '講者真的拿出實戰數字分享，不是空泛理論。' },
        ],
      },
    },
    {
      type: 'faq',
      props: {
        title: '常見問題',
        items: [
          { q: '可以開發票嗎？', a: '可開立公司戶 / 個人發票，可指定統編。' },
          { q: '不能到場可以退費嗎？', a: '活動前 14 天可全額退款，14 天內可轉讓給他人。' },
          { q: '會提供餐點嗎？', a: '含午餐、下午茶、晚宴三餐。' },
        ],
      },
    },
    {
      type: 'countdown',
      props: {
        mode: 'real',
        endAt: '2026-06-28T09:00:00+08:00',
        label: '活動倒數',
      },
    },
    {
      type: 'checkout-form',
      props: {
        plans: [
          { id: 'early', name: '早鳥票（剩 50 張）', priceMinor: 380000, badge: '限時' },
          { id: 'standard', name: '一般票', priceMinor: 580000, badge: '', highlighted: true },
          { id: 'vip', name: 'VIP 票（含晚宴專屬桌）', priceMinor: 1280000, badge: '尊榮' },
        ],
        paymentMethods: ['credit-card'],
        requirePhone: true,
        requireAddress: false,
        extraFields: [
          { id: 'company', label: '公司 / 單位', required: false },
          { id: 'role', label: '職稱', required: false },
        ],
      },
    },
    {
      type: 'contact',
      props: {
        title: '想包場 / 團體報名？',
        body: '10 人以上團報享 85 折，請聯繫主辦單位。',
        email: 'event@example.com',
        line: '@example-event',
      },
    },
  ],
};
