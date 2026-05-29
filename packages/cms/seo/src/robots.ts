import type { RobotsRule } from './types.js';

/**
 * 產生 robots.txt。
 *
 * @example
 * generateRobotsTxt({
 *   rules: [{ userAgent: '*', allow: ['/'], disallow: ['/admin'] }],
 *   sitemapUrls: ['https://x.com/sitemap.xml'],
 * })
 */
export function generateRobotsTxt(input: {
  rules: RobotsRule[];
  sitemapUrls?: string[];
  host?: string;
}): string {
  const lines: string[] = [];
  for (const r of input.rules) {
    lines.push(`User-agent: ${r.userAgent}`);
    for (const a of r.allow ?? []) lines.push(`Allow: ${a}`);
    for (const d of r.disallow ?? []) lines.push(`Disallow: ${d}`);
    if (r.crawlDelay !== undefined) lines.push(`Crawl-delay: ${r.crawlDelay}`);
    lines.push('');
  }
  if (input.host) lines.push(`Host: ${input.host}`);
  for (const sm of input.sitemapUrls ?? []) lines.push(`Sitemap: ${sm}`);
  return lines.join('\n').replace(/\n+$/, '\n');
}
