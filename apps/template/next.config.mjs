import { withPayload } from '@payloadcms/next/withPayload';
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: false,
  },
  /* 媒體檔強制 immutable 長 cache：
   * Payload media route 預設給 `max-age=0, must-revalidate`（因為 doc 可能被改），
   * 但我們的 gen-* / regen-* / placeholder-* / 一般上傳檔名都帶 hash/timestamp/tenantId
   * 已等同 fingerprint，可長期 immutable。沒此設定每次 reload 5 張 2-3 MB 圖
   * 都 cold-start serverless + S3 GetObject → 行動裝置 30-60 秒才畫完。
   * 加完第一次 GET 後 Vercel edge 會 cache 一年，後續所有訪客直接吃 CDN（~5 ms）。 */
  async headers() {
    return [
      {
        source: '/api/media/file/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, s-maxage=31536000, immutable',
          },
        ],
      },
    ];
  },
  // 監聽 frontend / factory 工作區的 TS source（套件以 .js 後綴 import）。
  transpilePackages: [
    '@saas-factory/factory-types',
    '@saas-factory/frontend-blocks',
    '@saas-factory/frontend-motion',
    '@saas-factory/frontend-block-renderer',
    '@saas-factory/frontend-primitives',
    '@saas-factory/frontend-tokens',
  ],
  webpack: (config) => {
    // 套件內部以 `.js` 後綴 import TS 原始碼（NodeNext / Bundler 慣例）；
    // 在 webpack 補上 `.ts` / `.tsx` extension alias 才能解析。
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js'],
    };
    // motion-system 的 dynamic-loaders 僅在 Level 4-5 才會 await import；
    // 沒裝 gsap / three / @react-three/fiber 時，標為 false 讓 webpack 跳過解析。
    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      gsap: false,
      three: false,
      '@react-three/fiber': false,
    };
    return config;
  },
};

// Sentry build-time 整合。
// - tunnelRoute：把 Sentry 請求繞道自家網域，避開 ad-blocker / 嚴格 CSP
// - silent：CI 安靜輸出
// - 無 SENTRY_AUTH_TOKEN 時 sourcemap 上傳自動 skip，不影響 build。
const sentryBuildOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sentryUrl: process.env.SENTRY_URL,
  silent: !process.env.CI,
  tunnelRoute: '/monitoring',
  disableLogger: true,
  hideSourceMaps: true,
  widenClientFileUpload: true,
};

export default withSentryConfig(withPayload(nextConfig), sentryBuildOptions);
