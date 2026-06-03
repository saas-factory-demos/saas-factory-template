import { notFound } from 'next/navigation';

import type { ReactNode } from 'react';

import { isSupportedLocale, type Locale } from '@/lib/locale';

export const dynamicParams = false;

export function generateStaticParams(): Array<{ locale: Locale }> {
  return [{ locale: 'zh-TW' }, { locale: 'en' }];
}

/**
 * Locale 層 layout。
 *
 * Payload localization 註冊 zh-TW / en。URL 進入點 /{locale}/...
 * 未匹配的 locale 經由 middleware redirect 到預設語系。
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }
  return children;
}
