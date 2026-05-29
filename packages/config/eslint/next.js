import globals from 'globals';

import base from './index.js';

/**
 * Next.js 專案專用設定。
 * 在 base 之上補 browser globals 與 React/JSX 容忍規則。
 * 注意：Next 自家規則（next/core-web-vitals）由 app 端 eslintrc 自行接入，
 * 因為 eslint-config-next 尚未原生支援 flat config。
 */
export default [
  ...base,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.es2022 },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
];
