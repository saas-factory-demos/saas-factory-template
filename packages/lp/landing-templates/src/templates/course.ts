import type { LandingTemplate } from '../types.js';

/** 課程預售範本。 */
export const courseTemplate: LandingTemplate = {
  id: 'course-v1',
  name: '課程預售標準版',
  category: 'course',
  description: '主打講師背景、學員成果、課程大綱。適合線上課程、訓練營、知識付費。',
  suitableFor: ['線上課程', '訓練營', '工作坊', '社團訂閱'],
  brandColors: {
    primary: '#5B3FFF',
    accent: '#FFB400',
    background: '#FAFAFC',
    text: '#1A1A2E',
  },
  defaultBlocks: [
    {
      type: 'hero',
      props: {
        headline: '6 週學會 AI 工具，月省 40 小時工時',
        subheadline: '前 Google 工程師親授，超過 2000 位學員實證',
        media: { kind: 'video', url: '/placeholder/course-trailer.mp4' },
        cta: { label: '預購早鳥價', anchor: '#checkout' },
      },
    },
    {
      type: 'pain-points',
      props: {
        title: '您是不是也面臨這些問題',
        items: [
          { icon: 'overwork', text: '加班到深夜，效率還是上不去' },
          { icon: 'fear', text: '怕被 AI 取代，但不知從哪開始' },
          { icon: 'scattered', text: '看了幾百支 YouTube，學完還是不會用' },
        ],
      },
    },
    {
      type: 'features',
      props: {
        title: '這堂課給您什麼',
        items: [
          { title: '完整 6 大模組', desc: 'Prompt 設計到自動化串接' },
          { title: '30 個實戰範例', desc: '電子報、報表、簡報、客服回覆' },
          { title: '專屬社群', desc: '畢業後加入學長姐互動圈' },
          { title: '一年內無限回看', desc: '隨時複習，不怕忘' },
        ],
      },
    },
    {
      type: 'testimonials',
      props: {
        title: '學員成果',
        items: [
          { name: 'Kelly', role: '電商營運', text: '把每週報表時間從 8 小時砍到 1.5 小時。' },
          { name: 'Jason', role: '小公司老闆', text: '用課堂教的自動化省下半個員工的工時。' },
          { name: 'Mia', role: '行銷企劃', text: '提案速度變兩倍，老闆問我是不是換腦袋。' },
        ],
      },
    },
    {
      type: 'specs',
      props: {
        title: '課程大綱',
        rows: [
          { label: 'Week 1', value: '入門：Prompt 工程核心原則' },
          { label: 'Week 2', value: '進階：上下文管理與長文寫作' },
          { label: 'Week 3', value: '工作流：自動化 Email、報表' },
          { label: 'Week 4', value: '資料分析與圖表生成' },
          { label: 'Week 5', value: '串接 API 與工作自動化' },
          { label: 'Week 6', value: '個人工作流設計與專案實戰' },
        ],
      },
    },
    {
      type: 'trust-badges',
      props: {
        items: [
          { name: '前 Google 工程師', logo: '/placeholder/google-alum.png' },
          { name: '台大資工碩士', logo: '/placeholder/ntu.png' },
          { name: '已開課 12 期', logo: '/placeholder/badge-12.png' },
        ],
      },
    },
    {
      type: 'faq',
      props: {
        title: '常見問題',
        items: [
          { q: '零基礎可以學嗎？', a: '可以，第一週從最基礎的 Prompt 概念開始。' },
          { q: '上課方式？', a: '預錄影片＋每週直播 Q&A，可重複觀看。' },
          { q: '退費政策？', a: '開課 7 天內未進入第 2 週可退費。' },
        ],
      },
    },
    {
      type: 'countdown',
      props: {
        mode: 'real',
        endAt: '2026-06-15T23:59:59+08:00',
        label: '早鳥優惠倒數',
      },
    },
    {
      type: 'checkout-form',
      props: {
        plans: [
          { id: 'self', name: '自學版', priceMinor: 580000, badge: '' },
          { id: 'standard', name: '標準版（含直播 Q&A）', priceMinor: 880000, badge: '最推薦', highlighted: true },
          { id: 'mentor', name: '一對一 Mentor', priceMinor: 1880000, badge: '名額有限' },
        ],
        paymentMethods: ['credit-card', 'installment'],
        requirePhone: true,
        requireAddress: false,
      },
    },
    {
      type: 'guarantee',
      props: {
        title: '7 天退費保證',
        body: '開課後 7 天內未進入第 2 週課程，可申請全額退費。',
      },
    },
  ],
};
