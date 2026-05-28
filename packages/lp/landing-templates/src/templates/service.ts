import type { LandingTemplate } from '../types.js';

/** 服務預約範本（按摩 / 諮詢 / 美容）。 */
export const serviceTemplate: LandingTemplate = {
  id: 'service-v1',
  name: '服務預約標準版',
  category: 'service',
  description: '主打店家環境、服務流程、預約優惠。適合按摩、諮詢、美容、醫美、寵物美容。',
  suitableFor: ['按摩 SPA', '心理諮商', '美容護膚', '寵物美容', '居家清潔'],
  brandColors: {
    primary: '#3D7068',
    accent: '#D4A373',
    background: '#FAF7F2',
    text: '#2D3D3A',
  },
  defaultBlocks: [
    {
      type: 'hero',
      props: {
        headline: '一小時，把疲勞還給城市',
        subheadline: '12 年資深療癒師親手把關，限量預約',
        media: { kind: 'image', url: '/placeholder/spa-hero.jpg' },
        cta: { label: '立即預約', anchor: '#checkout' },
      },
    },
    {
      type: 'pain-points',
      props: {
        title: '您是不是已經太久沒好好放鬆',
        items: [
          { icon: 'tense', text: '肩頸僵硬到轉頭都會痛' },
          { icon: 'sleep', text: '睡不深、睡醒比沒睡還累' },
          { icon: 'time', text: '想找好的療癒師但不知道哪家不踩雷' },
        ],
      },
    },
    {
      type: 'features',
      props: {
        title: '為什麼選我們',
        items: [
          { title: '12 年資深療癒師', desc: '每位都通過 SPA 協會三級認證' },
          { title: '一對一獨立包廂', desc: '不打擾不混場' },
          { title: '客製化手法', desc: '依當下狀況調整力道與重點部位' },
          { title: '在地嚴選用油', desc: '台灣本土有機冷壓基底油' },
        ],
      },
    },
    {
      type: 'gallery',
      props: {
        title: '空間環境',
        images: [
          '/placeholder/spa-1.jpg',
          '/placeholder/spa-2.jpg',
          '/placeholder/spa-3.jpg',
          '/placeholder/spa-4.jpg',
        ],
      },
    },
    {
      type: 'testimonials',
      props: {
        title: '顧客回饋',
        items: [
          { name: '黃O婷', role: '上班族', text: '做完當晚直接睡到天亮，超久沒這樣了。' },
          { name: '張O倫', role: '工程師', text: '老師找到痛點超精準，肩頸瞬間鬆開。' },
        ],
      },
    },
    {
      type: 'specs',
      props: {
        title: '療程介紹',
        rows: [
          { label: '舒緩按摩', value: '60 / 90 分鐘' },
          { label: '深層筋膜', value: '90 / 120 分鐘' },
          { label: '熱石芳療', value: '120 分鐘' },
          { label: '營業時間', value: '11:00 - 22:00' },
          { label: '地址', value: '台北市信義區松仁路 100 號 3F' },
        ],
      },
    },
    {
      type: 'trust-badges',
      props: {
        items: [
          { name: 'SPA 協會三級認證', logo: '/placeholder/spa-cert.png' },
          { name: 'Google 4.9 星', logo: '/placeholder/google-stars.png' },
          { name: '在地經營 12 年', logo: '/placeholder/years-12.png' },
        ],
      },
    },
    {
      type: 'faq',
      props: {
        title: '常見問題',
        items: [
          { q: '需要預約多久前？', a: '建議 3 天前預約，週末熱門時段需 7 天前。' },
          { q: '可以指定療癒師嗎？', a: '可以，預約時備註即可。' },
          { q: '臨時取消怎麼算？', a: '24 小時前免費取消，當天取消酌收 30% 費用。' },
        ],
      },
    },
    {
      type: 'checkout-form',
      props: {
        plans: [
          { id: 'basic', name: '舒緩 60 分鐘', priceMinor: 168000, badge: '' },
          { id: 'deep', name: '深層筋膜 90 分鐘', priceMinor: 248000, badge: '最熱門', highlighted: true },
          { id: 'premium', name: '熱石芳療 120 分鐘', priceMinor: 358000, badge: '尊榮' },
        ],
        paymentMethods: ['credit-card', 'on-site'],
        requirePhone: true,
        requireAddress: false,
        extraFields: [
          { id: 'preferred-date', label: '希望預約日期', type: 'date', required: true },
          { id: 'preferred-time', label: '希望時段', type: 'select', required: true },
          { id: 'notes', label: '備註（指定療癒師 / 特殊需求）', required: false },
        ],
      },
    },
    {
      type: 'contact',
      props: {
        title: '預約有問題嗎？',
        body: 'LINE 客服 09:00 - 22:00 都在線。',
        line: '@example-spa',
        phone: '02-1234-5678',
      },
    },
  ],
};
