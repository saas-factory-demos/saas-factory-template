import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** AI / Web3：LP 主（產品 launch），CMS 輔（文件）。 */
export const aiWeb3Template: IndustryTemplate = {
  industry: 'ai-web3',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.split', 'cyber-animated', 1),
        block('lp-vision', 'content.manifesto', 'centered-bold', 2),
        block('lp-features', 'features.grid-3', 'tech-spec', 3),
        block('lp-roadmap', 'content.roadmap', 'milestone-timeline', 4),
        block('lp-team', 'profile.core-team', 'card-grid', 5),
        block('lp-waitlist', 'cta.waitlist', 'highlighted-form', 6),
      ]),
    ],
  },
  extraModules: ['lp.ab-test'],
  copyTone: {
    brandVoice: '前衛、技術深、改變產業',
    targetAudience: '早期採用者、開發者、加密貨幣社群',
    keySellingPoints: [
      '開源協議、社群共治',
      'L2 縮放、Gas 費低、TPS 高',
      'AI 模型本地推論、不上傳雲端',
    ],
  },
};
