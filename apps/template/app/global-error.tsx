'use client';

import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect } from 'react';

/**
 * App Router 根層錯誤邊界。
 *
 * Next.js 規定：global-error.tsx 必須位於 `app/` 根目錄，且本身要自帶 `<html>` / `<body>`。
 * 當 layout / template 自己 throw 時 React 還沒能 mount 任何上層元件，
 * 唯有此檔有機會接住，並把錯誤送 Sentry。
 *
 * 無 DSN 時 `Sentry.captureException` 為 no-op，不影響使用者體驗。
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }): React.JSX.Element {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="zh-Hant">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
