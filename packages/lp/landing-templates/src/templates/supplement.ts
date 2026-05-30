import type { LandingTemplate } from '../types.js';

/** 保健食品範本（美容 / 健康類）。 */
export const supplementTemplate: LandingTemplate = {
  id: 'supplement-v1',
  name: '保健食品標準版',
  category: 'supplement',
  description: '主打成分、見證、信任徽章，配 30 天退費保證。適合美容、養生、機能性食品。',
  suitableFor: ['膠原蛋白', '酵素', '葉黃素', '魚油', '益生菌'],
  brandColors: {
    primary: '#E07A5F',
    accent: '#81B29A',
    background: '#FFF8F0',
    text: '#3D405B',
  },
  defaultBlocks: [
    {
      type: 'hero',
      props: {
        headline: '一杯，補回您每天流失的青春膠原',
        subheadline: '日本臨床實證配方，連喝 14 天有感',
        media: { kind: 'image', url: '/placeholder/supplement-hero.jpg' },
        cta: { label: '立即試用', anchor: '#checkout' },
      },
    },
    {
      type: 'pain-points',
      props: {
        title: '您是不是也有這些困擾',
        items: [
          { icon: 'mirror', text: '皮膚暗沉、彈性流失' },
          { icon: 'clock', text: '熬夜加班，氣色越來越差' },
          { icon: 'spend', text: '試過很多保養品，都沒感覺' },
        ],
      },
    },
    {
      type: 'solution',
      props: {
        title: '真正補進去的，才有用',
        body: '我們的配方使用日本進口低分子膠原蛋白，分子量 < 2000 Da，吸收率比一般高 4 倍。',
        bullets: ['低分子膠原 5000mg', '專利吸收技術', '臨床實驗 14 天有感'],
      },
    },
    {
      type: 'features',
      props: {
        title: '為什麼選我們',
        items: [
          { title: '日本原料', desc: '與東京大學合作開發配方' },
          { title: 'SGS 檢驗', desc: '每批次重金屬、塑化劑檢測' },
          { title: '無腥味', desc: '添加 30% 維生素 C，好喝不卡喉' },
        ],
      },
    },
    {
      type: 'trust-badges',
      props: {
        items: [
          { name: 'SGS 認證', logo: '/placeholder/sgs.png' },
          { name: 'HACCP 廠製造', logo: '/placeholder/haccp.png' },
          { name: '日本進口原料', logo: '/placeholder/jp.png' },
        ],
      },
    },
    {
      type: 'before-after',
      props: {
        title: '使用 28 天前後對照',
        before: '/placeholder/before.jpg',
        after: '/placeholder/after.jpg',
        caption: '王小姐 38 歲，連續使用 28 天',
      },
    },
    {
      type: 'testimonials',
      props: {
        title: '真實使用者見證',
        items: [
          { name: '陳O芳', role: '42 歲、上班族', text: '喝了三個月，連同事都問我是不是去做了醫美。' },
          { name: '林O美', role: '35 歲、媽媽', text: '熬夜照顧小孩臉色超差，喝這個一個月就有差。' },
        ],
      },
    },
    {
      type: 'specs',
      props: {
        title: '產品規格',
        rows: [
          { label: '容量', value: '50ml × 30 入' },
          { label: '保存期限', value: '常溫 24 個月' },
          { label: '產地', value: '日本' },
        ],
      },
    },
    {
      type: 'faq',
      props: {
        title: '常見問題',
        items: [
          { q: '一天要喝幾包？', a: '建議每天 1 包，睡前空腹喝吸收最好。' },
          { q: '孕婦可以喝嗎？', a: '孕婦及哺乳婦女建議先諮詢醫師。' },
          { q: '多久會有感覺？', a: '一般使用者反映 14 天有感，建議完整療程 3 個月。' },
        ],
      },
    },
    {
      type: 'countdown',
      props: {
        mode: 'dynamic',
        durationMinutes: 30,
        label: '限時優惠倒數',
      },
    },
    {
      type: 'checkout-form',
      props: {
        plans: [
          { id: 'plan-1', name: '單盒體驗', priceMinor: 99000, badge: '' },
          { id: 'plan-3', name: '三盒組（推薦）', priceMinor: 249000, badge: '最划算', highlighted: true },
          { id: 'plan-6', name: '半年保養組', priceMinor: 459000, badge: '' },
        ],
        paymentMethods: ['credit-card', 'cod'],
        requirePhone: true,
        requireAddress: true,
      },
    },
    {
      type: 'guarantee',
      props: {
        title: '30 天無效退費',
        body: '不滿意可在 30 天內申請全額退款，運費我們吸收。',
      },
    },
  ],
};
