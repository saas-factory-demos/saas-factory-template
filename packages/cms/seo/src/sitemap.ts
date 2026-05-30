import type { SitemapEntry } from './types.js';

/**
 * 產生 sitemap.xml。
 */
export function generateSitemap(entries: SitemapEntry[]): string {
  const items = entries
    .map((e) => {
      const parts = [`    <loc>${escapeXml(e.loc)}</loc>`];
      if (e.lastmod) parts.push(`    <lastmod>${e.lastmod.toISOString().slice(0, 10)}</lastmod>`);
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (e.priority !== undefined) {
        parts.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
      }
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`;
}

/**
 * 多 sitemap 索引（站台超大時用）。
 */
export function generateSitemapIndex(
  sitemaps: Array<{ loc: string; lastmod?: Date }>,
): string {
  const items = sitemaps
    .map((s) => {
      const last = s.lastmod ? `    <lastmod>${s.lastmod.toISOString().slice(0, 10)}</lastmod>` : '';
      return `  <sitemap>\n    <loc>${escapeXml(s.loc)}</loc>${last ? `\n${last}` : ''}\n  </sitemap>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
