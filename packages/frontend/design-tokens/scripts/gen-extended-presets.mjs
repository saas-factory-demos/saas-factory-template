#!/usr/bin/env node
/**
 * Generator: ui-ux-pro-max CSV → extended preset .ts 檔案
 *
 * 流程：
 * 1. 讀 ~/.claude/skills/ui-ux-pro-max/src/ui-ux-pro-max/data/colors.csv (161 palettes)
 * 2. 每筆 → slug + Chinese displayName + PresetConfig
 * 3. 透過既有 createPreset() 生成；輸出簡短檔（< 50 行）
 * 4. 自動分配 radius profile / motion level 依 product type
 * 5. 寫 PresetKey 自動擴充 patch（用 generator-output.json 給 type 更新使用）
 *
 * 跳過：與既有 20 個 PRESET_KEYS 同名 / 同 product type 衝突的（避免覆寫手刻 preset）
 *
 * 用法：
 *   node packages/frontend/design-tokens/scripts/gen-extended-presets.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../../..');
const PRESETS_DIR = resolve(REPO_ROOT, 'packages/frontend/design-tokens/src/presets');
const EXTENDED_DIR = resolve(PRESETS_DIR, 'extended');
const CSV_PATH = join(
  homedir(),
  '.claude/skills/ui-ux-pro-max/src/ui-ux-pro-max/data/colors.csv',
);

/** kebab-case slug，限定 a-z0-9- */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

/** 中文 display 標籤（簡化版：保留原英文 product type 但加首尾標點符號）。 */
function displayName(productType) {
  // 直接保留英文標籤，使用者後續可在 _zh.json 自訂中譯
  return productType;
}

/**
 * 依 product type 大類別推 radius profile + motionLevel + industry hint。
 *
 * industries 必須對應 @saas-factory/factory-types 的 Industry union（33 項）；
 * 沒對到的情境留空陣列（recommendedIndustries 是建議性質、可空）。
 */
function inferProfile(productType) {
  const lower = productType.toLowerCase();
  let radius = 'soft';
  let motionLevel = 2;
  let industries = [];

  if (/luxury|jewelry|premium/.test(lower)) {
    radius = 'sharp';
    motionLevel = 1;
    industries = ['personal-brand'];
  } else if (/fashion|apparel/.test(lower)) {
    radius = 'sharp';
    motionLevel = 2;
    industries = ['fashion-apparel'];
  } else if (/editorial|magazine|news/.test(lower)) {
    radius = 'sharp';
    motionLevel = 1;
    industries = ['consulting'];
  } else if (/wine|brewery/.test(lower)) {
    radius = 'sharp';
    motionLevel = 2;
    industries = ['food-snacks'];
  } else if (/architecture|interior/.test(lower)) {
    radius = 'sharp';
    motionLevel = 1;
    industries = ['home-furniture'];
  } else if (/beauty|spa|salon/.test(lower)) {
    radius = 'plush';
    motionLevel = 2;
    industries = ['beauty-skincare', 'salon'];
  } else if (/baby|kids|childcare/.test(lower)) {
    radius = 'plush';
    motionLevel = 2;
    industries = ['baby-mom'];
  } else if (/wellness|yoga|meditation|mindfulness/.test(lower)) {
    radius = 'plush';
    motionLevel = 2;
    industries = ['fitness-gym'];
  } else if (/wedding/.test(lower)) {
    radius = 'plush';
    motionLevel = 2;
    industries = ['wedding'];
  } else if (/bakery|cafe/.test(lower)) {
    radius = 'plush';
    motionLevel = 2;
    industries = ['restaurant'];
  } else if (/banking|insurance/.test(lower)) {
    radius = 'subtle';
    motionLevel = 1;
    industries = ['legal-accounting'];
  } else if (/legal/.test(lower)) {
    radius = 'subtle';
    motionLevel = 1;
    industries = ['legal-accounting'];
  } else if (/enterprise|corporate|b2b/.test(lower)) {
    radius = 'subtle';
    motionLevel = 1;
    industries = ['consulting'];
  } else if (/government|civic|public service/.test(lower)) {
    radius = 'subtle';
    motionLevel = 1;
    industries = ['nonprofit'];
  } else if (/non-profit|charity|community/.test(lower)) {
    radius = 'soft';
    motionLevel = 2;
    industries = ['nonprofit'];
  } else if (/church|religious/.test(lower)) {
    radius = 'soft';
    motionLevel = 1;
    industries = ['church-religion'];
  } else if (/gaming|arcade|esports/.test(lower)) {
    radius = 'soft';
    motionLevel = 5;
    industries = ['nightclub-bar'];
  } else if (/nightclub|festival/.test(lower)) {
    radius = 'soft';
    motionLevel = 4;
    industries = ['nightclub-bar'];
  } else if (/crypto|nft|web3/.test(lower)) {
    radius = 'soft';
    motionLevel = 3;
    industries = ['ai-web3'];
  } else if (/streaming|music|video/.test(lower)) {
    radius = 'soft';
    motionLevel = 3;
    industries = ['event-conference'];
  } else if (/saas/.test(lower)) {
    radius = 'soft';
    motionLevel = 2;
    industries = ['saas-software'];
  } else if (/ai|chatbot|generative/.test(lower)) {
    radius = 'soft';
    motionLevel = 3;
    industries = ['ai-web3'];
  } else if (/developer|coding|api|cybersecurity/.test(lower)) {
    radius = 'soft';
    motionLevel = 2;
    industries = ['saas-software'];
  } else if (/analytics|dashboard|crm|productivity|tool/.test(lower)) {
    radius = 'soft';
    motionLevel = 2;
    industries = ['saas-software'];
  } else if (/medical|pharma|dental|veterinary|clinic|therapy/.test(lower)) {
    radius = 'subtle';
    motionLevel = 1;
    industries = ['medical-aesthetic'];
  } else if (/health|biotech/.test(lower)) {
    radius = 'subtle';
    motionLevel = 1;
    industries = ['medical-aesthetic'];
  } else if (/fitness|gym|sports/.test(lower)) {
    radius = 'soft';
    motionLevel = 3;
    industries = ['fitness-gym', 'sports-outdoor'];
  } else if (/education|academy|learning|course|tutor|language|kids learning/.test(lower)) {
    radius = 'soft';
    motionLevel = 2;
    industries = ['online-course'];
  } else if (/marketplace/.test(lower)) {
    radius = 'soft';
    motionLevel = 3;
    industries = ['fashion-apparel'];
  } else if (/ecommerce|e-commerce|shop|retail|boutique/.test(lower)) {
    radius = 'soft';
    motionLevel = 3;
    industries = ['fashion-apparel'];
  } else if (/food|restaurant|delivery|grocery|recipe/.test(lower)) {
    radius = 'plush';
    motionLevel = 2;
    industries = ['restaurant', 'food-snacks'];
  } else if (/farm|agriculture/.test(lower)) {
    radius = 'soft';
    motionLevel = 2;
    industries = ['food-snacks'];
  } else if (/travel|airline|hotel|booking|tourism/.test(lower)) {
    radius = 'soft';
    motionLevel = 3;
    industries = ['travel-tour'];
  } else if (/real estate|realestate|property|construction/.test(lower)) {
    radius = 'subtle';
    motionLevel = 2;
    industries = ['realestate'];
  } else if (/automotive|car|transit|delivery|ride|logistics/.test(lower)) {
    radius = 'soft';
    motionLevel = 2;
    industries = ['logistics-trade'];
  } else if (/event/.test(lower)) {
    radius = 'soft';
    motionLevel = 3;
    industries = ['event-conference'];
  } else if (/pet/.test(lower)) {
    radius = 'plush';
    motionLevel = 2;
    industries = ['pet-supplies'];
  } else if (/personal|portfolio|creator|freelancer|link-in-bio/.test(lower)) {
    radius = 'soft';
    motionLevel = 2;
    industries = ['personal-brand'];
  } else if (/photo|drawing|art|design/.test(lower)) {
    radius = 'soft';
    motionLevel = 2;
    industries = ['craft-design'];
  } else if (/manufacturing|aerospace|drone|biotech|quantum/.test(lower)) {
    radius = 'subtle';
    motionLevel = 1;
    industries = ['manufacturing'];
  }

  // 保證至少一個 industry（presets.test.ts 要求 recommendedIndustries.length > 0）；
  // 沒對到分類 → fallback 'consulting'（最中性、適合 utility / 工具類 app）
  if (industries.length === 0) {
    industries = ['consulting'];
  }

  return { radius, motionLevel, industries };
}

/** 把 #RRGGBB 解析成 {hue, sat, lightness} HSL（粗略，給 surface 用）。 */
function hexToHsl(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let sat = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        hue = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        hue = (b - r) / d + 2;
        break;
      case b:
        hue = (r - g) / d + 4;
        break;
    }
    hue /= 6;
  }
  return {
    hue: Math.round(hue * 360),
    sat: Math.round(sat * 100),
    lightness: Math.round(l * 100),
  };
}

/** parse 一行 csv，支援雙引號包覆的欄位。 */
function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

/** const-case camelCase var name. */
function toCamel(slug) {
  return slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function main() {
  if (!existsSync(EXTENDED_DIR)) mkdirSync(EXTENDED_DIR, { recursive: true });

  const csv = readFileSync(CSV_PATH, 'utf8').trim().split('\n');
  const rows = csv.slice(1).map(parseCsvLine);

  // 拒寫的 slug（與既有 20 個 PRESET_KEYS 重名）
  const EXISTING_SLUGS = new Set(
    readdirSync(PRESETS_DIR)
      .filter((f) => f.endsWith('.ts') && !f.startsWith('_'))
      .map((f) => f.replace(/\.ts$/, '')),
  );

  const generated = [];
  const skipped = [];

  for (const row of rows) {
    const productType = row[1]?.trim();
    if (!productType) continue;
    const slug = slugify(productType);
    if (!slug) continue;
    if (EXISTING_SLUGS.has(slug)) {
      skipped.push({ reason: 'existing-slug-collision', productType, slug });
      continue;
    }

    const primary = row[2]?.trim();
    const accent = row[6]?.trim();
    const bgHex = row[8]?.trim();
    const notes = row[18]?.trim() ?? '';
    if (!primary || !accent || !bgHex) continue;

    const surfaceHsl = hexToHsl(bgHex);
    const profile = inferProfile(productType);

    const camel = toCamel(slug);
    const filePath = join(EXTENDED_DIR, `${slug}.ts`);

    const body = `import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * ${productType}（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary ${primary} / accent ${accent} / surface ${bgHex}。
 * 備註：${notes.replace(/\*\//g, '* /')}
 */
export const ${camel}: DesignTokens = createPreset({
  meta: {
    name: '${slug}',
    displayName: '${displayName(productType).replace(/'/g, "\\'")}',
    description: '${productType.replace(/'/g, "\\'")} — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ${JSON.stringify(profile.industries)},
    motionLevelRecommended: ${profile.motionLevel},
    darkModePrimary: 'both',
  },
  primaryHex: '${primary}',
  accentHex: '${accent}',
  surfaceLight: { hue: ${surfaceHsl.hue}, sat: ${Math.min(surfaceHsl.sat, 40)} },
  surfaceDark: { hue: ${surfaceHsl.hue}, sat: ${Math.min(surfaceHsl.sat, 30)} },
  typography: {
    fontFamily: {
      sans: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Source Serif Pro', 'Noto Serif TC', serif",
      display: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    headingFamily: 'sans',
    bodyFamily: 'sans',
  },
  radius: '${profile.radius}',
  motion: { level: ${profile.motionLevel} },
  density: 'normal',
});
`;
    writeFileSync(filePath, body);
    generated.push({ slug, camel, productType });
  }

  // 寫 _index.ts 給 extended/ folder 內部 re-export
  const indexLines = generated.map((g) => `export { ${g.camel} } from './${g.slug}.js';`);
  writeFileSync(join(EXTENDED_DIR, '_index.ts'), `${indexLines.join('\n')}\n`);

  // 寫 generator-output.json 供 update-presets-registry 用
  writeFileSync(
    join(EXTENDED_DIR, '_generated.json'),
    JSON.stringify({ generated, skipped }, null, 2),
  );

  console.info(`[gen] generated ${generated.length}, skipped ${skipped.length}`);
}

main();
