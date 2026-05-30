import type { LandingTemplate } from '../types.js';

/** 3C 配件範本。 */
export const electronicsTemplate: LandingTemplate = {
  id: 'electronics-v1',
  name: '3C 配件標準版',
  category: 'electronics',
  description: '主打規格、開箱影片、實測對比。適合無線耳機、行動電源、車充等小家電配件。',
  suitableFor: ['藍牙耳機', '行動電源', '快充頭', '車載支架', '智慧手錶'],
  brandColors: {
    primary: '#0B5FFF',
    accent: '#00C2A8',
    background: '#0E1117',
    text: '#F2F4F8',
  },
  defaultBlocks: [
    {
      type: 'hero',
      props: {
        headline: '一充 30 秒，續航 8 小時',
        subheadline: '不只是耳機，是您通勤路上的全新體驗',
        media: { kind: 'video', url: '/placeholder/earbud-hero.mp4', autoplay: true, muted: true },
        cta: { label: '搶先預購', anchor: '#checkout' },
      },
    },
    {
      type: 'pain-points',
      props: {
        title: '舊耳機是不是這樣',
        items: [
          { icon: 'battery', text: '通勤一半沒電，只能拔線聽歌' },
          { icon: 'noise', text: '捷運上根本聽不清楚' },
          { icon: 'fit', text: '戴久耳朵又脹又痛' },
        ],
      },
    },
    {
      type: 'features',
      props: {
        title: '六大升級',
        items: [
          { title: '主動降噪 -42dB', desc: '捷運、飛機都能安靜' },
          { title: '8 小時續航', desc: '搭配充電盒可達 32 小時' },
          { title: '快充 30 秒', desc: '不到一分鐘多兩小時' },
          { title: '人體工學', desc: '長戴 6 小時不痛' },
          { title: 'IPX5 防水', desc: '運動、雨天都能戴' },
          { title: '低延遲', desc: '遊戲、追劇音畫同步' },
        ],
      },
    },
    {
      type: 'video',
      props: {
        title: '實機開箱',
        url: '/placeholder/unboxing.mp4',
        poster: '/placeholder/unboxing-poster.jpg',
      },
    },
    {
      type: 'specs',
      props: {
        title: '完整規格',
        rows: [
          { label: '藍牙版本', value: '5.3' },
          { label: '驅動單體', value: '13mm 動圈' },
          { label: '電池容量', value: '單耳 60mAh / 盒 500mAh' },
          { label: '充電孔', value: 'USB-C' },
          { label: '重量', value: '單耳 4.8g' },
          { label: '保固', value: '一年保固' },
        ],
      },
    },
    {
      type: 'trust-badges',
      props: {
        items: [
          { name: 'NCC 認證', logo: '/placeholder/ncc.png' },
          { name: 'BSMI 商檢', logo: '/placeholder/bsmi.png' },
          { name: '原廠保固', logo: '/placeholder/warranty.png' },
        ],
      },
    },
    {
      type: 'testimonials',
      props: {
        title: '使用者好評',
        items: [
          { name: 'David', role: '科技 YouTuber', text: '這個價位能做到 -42dB 降噪，真的誇張。' },
          { name: 'Anna', role: '空姐', text: '飛長途必備，世界瞬間安靜。' },
        ],
      },
    },
    {
      type: 'faq',
      props: {
        title: '常見問題',
        items: [
          { q: '可以同時連兩台裝置嗎？', a: '可以，支援多點連接，手機跟筆電可同時連。' },
          { q: 'iPhone / Android 都能用嗎？', a: '都可以，藍牙 5.3 廣相容。' },
          { q: '保固怎麼算？', a: '收到貨起算一年，非人為損壞免費更換。' },
        ],
      },
    },
    {
      type: 'countdown',
      props: {
        mode: 'real',
        endAt: '2026-06-30T23:59:59+08:00',
        label: '預購倒數',
      },
    },
    {
      type: 'checkout-form',
      props: {
        plans: [
          { id: 'single', name: '單支', priceMinor: 198000, badge: '' },
          { id: 'pair', name: '兩支組（情侶 / 家庭）', priceMinor: 358000, badge: '最熱銷', highlighted: true },
          { id: 'with-case', name: '單支＋皮革保護套', priceMinor: 248000, badge: '質感升級' },
        ],
        paymentMethods: ['credit-card', 'cod', 'apple-pay'],
        requirePhone: true,
        requireAddress: true,
      },
    },
    {
      type: 'guarantee',
      props: {
        title: '7 天鑑賞期 + 一年保固',
        body: '不滿意 7 天內可退，一年內非人為損壞免費換新。',
      },
    },
  ],
};
