import config from '@saas-factory/eslint-config';

/**
 * design-tokens 的 lint 配置：
 *
 * - `scripts/**`：build-time generator，console.info 是合理輸出；import order
 *   不嚴格，因為這些檔案不會被 bundle / 客戶站使用
 * - `src/presets/index.ts`：generator 注入區塊（@gen-extended-presets:* 之間）
 *   的 import 順序由 PRESET_KEYS 決定、不是字母序；硬要符合 lint 會讓重生成跟
 *   lint 永遠在打架
 * - `src/presets/extended/**`：generator 產出的薄殼檔；不對它們強制完整 JSDoc
 */
export default [
  ...config,
  {
    files: ['scripts/**/*.mjs'],
    rules: {
      'no-console': 'off',
      'import/order': 'off',
    },
  },
  {
    files: ['src/presets/index.ts', 'src/presets/extended/**/*.ts'],
    rules: {
      'import/order': 'off',
    },
  },
];
