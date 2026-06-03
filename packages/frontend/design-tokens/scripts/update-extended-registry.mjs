#!/usr/bin/env node
/**
 * 把 _generated.json 內 161 個 slug 注入 PresetKey type 與 presets registry。
 *
 * 修改：
 *   packages/factory/types/src/index.ts：
 *     - 在 PresetKey union 末尾 append `| 'slug-a' | 'slug-b' ...`
 *     - 在 PRESET_KEYS array 末尾 append 對應 string
 *   packages/frontend/design-tokens/src/presets/index.ts：
 *     - import from './extended/_index.js'
 *     - 在 presets object 末尾 append 對應 entries
 *
 * Idempotent：用 BEGIN / END 標記之間整段重寫，重跑等同覆蓋上次結果。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../../..');
const GEN_JSON = resolve(
  REPO_ROOT,
  'packages/frontend/design-tokens/src/presets/extended/_generated.json',
);
const TYPES_PATH = resolve(REPO_ROOT, 'packages/factory/types/src/index.ts');
const PRESETS_INDEX = resolve(
  REPO_ROOT,
  'packages/frontend/design-tokens/src/presets/index.ts',
);

const BEGIN = '// @gen-extended-presets:begin';
const END = '// @gen-extended-presets:end';

function injectBetweenMarkers(src, begin, end, payload) {
  const beginIdx = src.indexOf(begin);
  const endIdx = src.indexOf(end);
  if (beginIdx === -1 || endIdx === -1) {
    throw new Error(`找不到 marker：${begin} / ${end}`);
  }
  return src.slice(0, beginIdx + begin.length) + '\n' + payload + '\n  ' + src.slice(endIdx);
}

function main() {
  const gen = JSON.parse(readFileSync(GEN_JSON, 'utf8'));
  const slugs = gen.generated.map((g) => g.slug);
  const camels = gen.generated.map((g) => g.camel);

  // 1. 更新 PresetKey type + PRESET_KEYS
  let types = readFileSync(TYPES_PATH, 'utf8');
  // PresetKey union 注入：尾端最後一個 | 之後 append
  const unionPayload = slugs.map((s) => `  | '${s}'`).join('\n');
  types = injectBetweenMarkers(types, BEGIN + '-union', END + '-union', unionPayload);
  // PRESET_KEYS array 注入
  const arrayPayload = slugs.map((s) => `  '${s}',`).join('\n');
  types = injectBetweenMarkers(types, BEGIN + '-array', END + '-array', arrayPayload);
  writeFileSync(TYPES_PATH, types);

  // 2. 更新 presets index
  let index = readFileSync(PRESETS_INDEX, 'utf8');
  // import 注入
  const importPayload = camels
    .map(
      (c, i) => `import { ${c} } from './extended/${slugs[i]}.js';`,
    )
    .join('\n');
  index = injectBetweenMarkers(index, BEGIN + '-imports', END + '-imports', importPayload);
  // registry 注入
  const entriesPayload = slugs
    .map((s, i) => `  '${s}': ${camels[i]},`)
    .join('\n');
  index = injectBetweenMarkers(index, BEGIN + '-entries', END + '-entries', entriesPayload);
  writeFileSync(PRESETS_INDEX, index);

  console.info(`[update] injected ${slugs.length} slugs into PresetKey + presets registry`);
}

main();
