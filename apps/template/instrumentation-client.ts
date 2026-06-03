import * as Sentry from '@sentry/nextjs';

/**
 * 客戶端 Sentry 初始化（瀏覽器 runtime）。
 *
 * 未設 `NEXT_PUBLIC_SENTRY_DSN` 時整段 no-op。
 *
 * 客戶站可透過下列 env 微調：
 * - `NEXT_PUBLIC_SENTRY_DSN`：必填，self-hosted Sentry 給的 DSN
 * - `NEXT_PUBLIC_SENTRY_ENVIRONMENT`：預設 `production`
 * - `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`：預設 0.1
 * - `NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE`：預設 0（關 Session Replay 節省空間）
 * - `NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE`：預設 1（出錯才錄）
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'production',
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    replaysSessionSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? '0'),
    replaysOnErrorSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? '1'),
    integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
  });
}

/**
 * App Router 客戶端導頁追蹤（Next 15 須匯出此 hook）。
 */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
