/** 社群分享平台。 */
export type SharePlatform =
  | 'facebook'
  | 'twitter'
  | 'line'
  | 'telegram'
  | 'whatsapp'
  | 'email'
  | 'copy-link';

/**
 * 產生社群分享連結。
 *
 * @param platform 平台
 * @param url 要分享的網址
 * @param title 標題（部分平台會用）
 */
export function buildShareUrl(platform: SharePlatform, url: string, title = ''): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    case 'line':
      return `https://social-plugins.line.me/lineit/share?url=${u}`;
    case 'telegram':
      return `https://t.me/share/url?url=${u}&text=${t}`;
    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${t}%20${u}`;
    case 'email':
      return `mailto:?subject=${t}&body=${u}`;
    case 'copy-link':
      return url;
  }
}

/** 一次拿全部平台的連結。 */
export function buildAllShareUrls(url: string, title = ''): Record<SharePlatform, string> {
  const platforms: SharePlatform[] = [
    'facebook',
    'twitter',
    'line',
    'telegram',
    'whatsapp',
    'email',
    'copy-link',
  ];
  const out = {} as Record<SharePlatform, string>;
  for (const p of platforms) out[p] = buildShareUrl(p, url, title);
  return out;
}
