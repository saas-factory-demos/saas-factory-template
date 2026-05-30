import type { Post, RssMetadata } from './types.js';

/**
 * 轉義 XML 特殊字元。
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * RSS item 生成（單篇文章）。
 */
function renderItem(post: Post, baseUrl: string): string {
  const lines: string[] = ['    <item>'];
  const push = (tag: string, value?: string, cdata = false): void => {
    if (value === undefined || value === '') return;
    if (cdata) {
      lines.push(`      <${tag}><![CDATA[${value}]]></${tag}>`);
    } else {
      lines.push(`      <${tag}>${escapeXml(value)}</${tag}>`);
    }
  };
  push('title', post.title);
  push('link', `${baseUrl}/blog/${post.slug}`);
  push('guid', post.id);
  if (post.publishedAt) push('pubDate', post.publishedAt.toUTCString());
  push('description', post.excerpt);
  if (post.plainText) push('content:encoded', post.plainText, true);
  lines.push('    </item>');
  return lines.join('\n');
}

/**
 * 產生 RSS 2.0 feed。
 */
export function generateRss(posts: Post[], metadata: RssMetadata): string {
  const baseUrl = metadata.link.replace(/\/+$/, '');
  const items = [...posts]
    .filter((p) => p.status === 'published')
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
    .map((p) => renderItem(p, baseUrl));

  const head = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    '  <channel>',
    `    <title>${escapeXml(metadata.title)}</title>`,
    `    <link>${escapeXml(metadata.link)}</link>`,
    `    <description>${escapeXml(metadata.description)}</description>`,
    `    <language>${escapeXml(metadata.language ?? 'zh-TW')}</language>`,
    `    <atom:link href="${escapeXml(metadata.feedUrl)}" rel="self" type="application/rss+xml" />`,
  ];
  const tail = ['  </channel>', '</rss>'];
  return [...head, ...items, ...tail].join('\n');
}
