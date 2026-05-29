import config from '@saas-factory/eslint-config/next';

// migrations/ 是 payload CLI 自動產出的 schema snapshot；
// 對應規則放鬆只在這個資料夾，避免每次 generate:migrations 都要手動 fix lint。
export default [
  ...config,
  {
    ignores: ['migrations/**'],
  },
];
