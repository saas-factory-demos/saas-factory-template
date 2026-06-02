#!/usr/bin/env tsx
/**
 * Seed pages CLI。
 *
 * 用法：
 *   pnpm seed:pages -- --industry organic-wellness --site-type cms --tenant tenant-1
 *   pnpm seed:pages -- --industry online-course --site-type cms --tenant t1 --dry-run
 *
 * 流程：
 * 1. 讀 INDUSTRY_TEMPLATES[industry].pages[siteType] → PageComposition[]
 * 2. pageCompositionsToPayloadPages 轉成 Payload pages.create 輸入
 * 3. --dry-run：印 JSON 不下 DB（離線可跑）
 * 4. 非 dry-run：boot Payload → 逐筆 create
 *
 * 退出碼：0=成功；1=參數錯誤；2=Payload 連線錯誤；3=create 過程錯誤
 */
import { parseArgs } from 'node:util';

import { INDUSTRY_TEMPLATES } from '@saas-factory/frontend-industries';

import { pageCompositionsToPayloadPages } from '../lib/payload-seed.js';

import type { Industry, SiteType } from '@saas-factory/factory-types';
import type { getPayload } from 'payload';

interface CliArgs {
  industry: Industry;
  siteType: SiteType;
  tenant: string;
  dryRun: boolean;
}

const SITE_TYPES: readonly SiteType[] = ['cms', 'shop', 'course', 'lp', 'blog'];

function parseCliArgs(): CliArgs {
  const { values } = parseArgs({
    allowPositionals: true,
    options: {
      industry: { type: 'string' },
      'site-type': { type: 'string' },
      tenant: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
  });

  if (values.help) {
    printHelp();
    process.exit(0);
  }

  const industry = values.industry as Industry | undefined;
  const siteType = values['site-type'] as SiteType | undefined;
  const tenant = values.tenant;

  if (!industry || !(industry in INDUSTRY_TEMPLATES)) {
    fail(`--industry 必填且需在 INDUSTRY_TEMPLATES（可用：${Object.keys(INDUSTRY_TEMPLATES).slice(0, 5).join(', ')} …）`);
  }
  if (!siteType || !SITE_TYPES.includes(siteType)) {
    fail(`--site-type 必填且需為 ${SITE_TYPES.join(' / ')}`);
  }
  if (!tenant) {
    fail('--tenant 必填（多租戶 id）');
  }

  return {
    industry,
    siteType,
    tenant,
    dryRun: values['dry-run'] === true,
  };
}

function printHelp(): void {
  process.stdout.write(`用法：pnpm seed:pages -- --industry <slug> --site-type <type> --tenant <id> [--dry-run]

選項：
  --industry    Industry slug（如 organic-wellness / supplement / online-course）
  --site-type   cms | shop | course | lp | blog
  --tenant      多租戶 id（寫入 pages.tenantId）
  --dry-run     不下 DB，只印 JSON
  --help        顯示此說明
`);
}

function fail(msg: string): never {
  process.stderr.write(`[seed-pages] ${msg}\n`);
  process.exit(1);
}

async function main(): Promise<void> {
  const args = parseCliArgs();
  const template = INDUSTRY_TEMPLATES[args.industry];
  const compositions = template.pages[args.siteType] ?? [];

  if (compositions.length === 0) {
    process.stderr.write(
      `[seed-pages] 警告：${args.industry} / ${args.siteType} 在 INDUSTRY_TEMPLATES 內無 PageComposition，無事可做。\n`,
    );
    return;
  }

  const inputs = pageCompositionsToPayloadPages(args.tenant, compositions);

  process.stdout.write(
    `[seed-pages] industry=${args.industry} siteType=${args.siteType} tenant=${args.tenant} 共 ${inputs.length} 頁\n`,
  );

  if (args.dryRun) {
    process.stdout.write(JSON.stringify(inputs, null, 2) + '\n');
    process.stdout.write(`[seed-pages] dry-run 完成（未寫入 DB）\n`);
    return;
  }

  let payload: Awaited<ReturnType<typeof getPayload>>;
  try {
    const { getPayload } = await import('payload');
    const { default: config } = await import('../payload.config.js');
    payload = await getPayload({ config });
  } catch (err) {
    process.stderr.write(`[seed-pages] 連線 Payload 失敗：${(err as Error).message}\n`);
    process.exit(2);
  }

  let ok = 0;
  let fails = 0;
  for (const input of inputs) {
    try {
      /* Payload 產生型別對 block fields 要求嚴格（required headline 等），
       * industry-templates 出的 BlockInstance 不一定全填——這裡信任種子資料
       * 由 schema 驗證層攔截錯誤，型別層用 cast 跳過。 */
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      await payload.create({ collection: 'pages', data: input as any });
      ok += 1;
      process.stdout.write(`  ✓ ${input.slug}（${input.title}）\n`);
    } catch (err) {
      fails += 1;
      process.stderr.write(`  ✗ ${input.slug}：${(err as Error).message}\n`);
    }
  }
  process.stdout.write(`[seed-pages] 完成：成功 ${ok} / 失敗 ${fails}\n`);
  if (fails > 0) process.exit(3);
}

main().catch((err: unknown) => {
  process.stderr.write(`[seed-pages] 未預期錯誤：${(err as Error).stack ?? String(err)}\n`);
  process.exit(99);
});
