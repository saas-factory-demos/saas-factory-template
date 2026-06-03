import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // GSAP / R3F / three 是 motion-system 內 Level 4-5 才需要的可選 peer
    // dependency，blocks-library 測試環境用不到，stub 掉避免 Vite 預掃描噴錯。
    server: {
      deps: {
        inline: ['@saas-factory/frontend-motion'],
      },
    },
  },
  resolve: {
    alias: {
      gsap: new URL('./src/__tests__/stubs/empty.ts', import.meta.url).pathname,
      '@react-three/fiber': new URL('./src/__tests__/stubs/empty.ts', import.meta.url).pathname,
      three: new URL('./src/__tests__/stubs/empty.ts', import.meta.url).pathname,
    },
  },
});
