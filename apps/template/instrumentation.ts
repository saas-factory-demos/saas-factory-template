import * as Sentry from '@sentry/nextjs';

/**
 * Next.js instrumentation hook（server + edge runtime）。
 *
 * 行為：
 * - 未設 `NEXT_PUBLIC_SENTRY_DSN` 時整段 no-op（dev / 本機 build 不會發任何請求）。
 * - 生產環境設好 DSN 後自動把 Node / Edge runtime 的 unhandled error / promise rejection 送到 self-hosted Sentry。
 *
 * 對應 self-hosted Sentry 主機：見 `infra/sentry-self-hosted/README.md`。
 */
export async function register(): Promise<void> {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  const environment = process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'production';
  const release = process.env.SENTRY_RELEASE;
  const tracesSampleRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1');

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn,
      environment,
      release,
      tracesSampleRate,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn,
      environment,
      release,
      tracesSampleRate,
    });
  }
}

/**
 * Next 15 onRequestError hook：把 RSC / Route Handler / Server Action 的錯誤交給 Sentry。
 */
export const onRequestError = Sentry.captureRequestError;
