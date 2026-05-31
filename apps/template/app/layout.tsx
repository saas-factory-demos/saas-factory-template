import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { projectConfig } from '@/project.config';

import './globals.css';

export const metadata: Metadata = {
  title: projectConfig.meta.brandName,
  description: `${projectConfig.meta.brandName} — SaaS Factory template`,
};

/**
 * 全站根佈局。
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
