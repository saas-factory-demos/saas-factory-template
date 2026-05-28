/**
 * Factory Support Access CLI ops 工具（對應 ADR-0100 + goal-11）。
 *
 * 本機 / 跳板機 / 急救情境下不必透過 factory app HTTP API，直接從 terminal 操作。
 * 內部仍走相同 HMAC client，不繞過任何稽核。
 *
 * 用法：
 *   tsx scripts/support-access-cli.ts <site-url> <action> [options]
 *
 * actions：
 *   status                          查狀態（provisioned / disabled / 本月存取次數）
 *   provision --email=X             建立 factory-support 帳號
 *   rotate --reason="說明"          重設密碼
 *   disable --reason="說明"         凍結
 *   enable --reason="說明"          解除凍結
 *   audit-log [--limit=20] [--filterAction=login] [--before=ISO]
 *                                   查近期稽核紀錄
 *
 * 環境變數：
 * - FACTORY_SUPPORT_SECRET：必填（HMAC 密鑰，>= 32 字元）
 * - FACTORY_ACTOR_EMAIL：選填，預設 `cli@factory.local`，會寫進客戶站 audit log
 *
 * 範例：
 *   tsx scripts/support-access-cli.ts https://demo-shop.vercel.app status
 *   tsx scripts/support-access-cli.ts https://demo-shop.vercel.app rotate \
 *     --reason="季度排程 rotate"
 *   tsx scripts/support-access-cli.ts https://demo-shop.vercel.app audit-log --limit=50
 */

import {
  createSupportAccessClient,
  type SupportAccessAction,
  type SupportAccessAuditEntry,
} from '@saas-factory/factory-support-access';

interface CliArgs {
  siteUrl: string;
  action: string;
  flags: Map<string, string>;
}

function parseArgs(argv: string[]): CliArgs {
  const positional = argv.filter((a) => !a.startsWith('--'));
  const siteUrl = positional[0];
  const action = positional[1];
  if (!siteUrl || !action) {
    throw new Error(
      '用法：tsx scripts/support-access-cli.ts <site-url> <action> [--flags]\n' +
        'actions：status / provision / rotate / disable / enable / audit-log',
    );
  }
  if (!/^https?:\/\//.test(siteUrl)) {
    throw new Error(`siteUrl 必須是完整 URL（含 https://），收到：${siteUrl}`);
  }
  const flags = new Map<string, string>();
  for (const arg of argv) {
    if (arg.startsWith('--')) {
      const [k, v] = arg.slice(2).split('=', 2);
      if (k && v !== undefined) flags.set(k, v);
    }
  }
  return { siteUrl, action, flags };
}

function need(args: CliArgs, name: string): string {
  const v = args.flags.get(name);
  if (!v) throw new Error(`${args.action} 需要 --${name}=...`);
  return v;
}

function formatAuditEntry(entry: SupportAccessAuditEntry): string {
  const date = entry.timestamp.replace('T', ' ').replace(/\..+$/, '');
  const ip = entry.clientIp ? ` ip=${entry.clientIp}` : '';
  return `[${date}] ${entry.action.padEnd(16)} by ${entry.actorEmail.padEnd(24)} — ${entry.payloadSummary}${ip}`;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const secret = process.env.FACTORY_SUPPORT_SECRET;
  if (!secret) {
    throw new Error('FACTORY_SUPPORT_SECRET 環境變數未設定');
  }
  const actorEmail = process.env.FACTORY_ACTOR_EMAIL ?? 'cli@factory.local';
  const client = createSupportAccessClient(secret);

  // 把 string 收到 SupportAccessAction 並驗證
  const ACTION_ALIASES: Record<string, SupportAccessAction> = {
    status: 'status',
    provision: 'provision',
    rotate: 'rotate-password',
    'rotate-password': 'rotate-password',
    disable: 'disable',
    enable: 'enable',
    'audit-log': 'audit-log',
    audit: 'audit-log',
  };
  const normalizedAction = ACTION_ALIASES[args.action];
  if (!normalizedAction) {
    throw new Error(`未知 action：${args.action}（合法：${Object.keys(ACTION_ALIASES).join(' / ')}）`);
  }

  /* eslint-disable no-console -- CLI 腳本 */
  switch (normalizedAction) {
    case 'status': {
      const res = await client.status({ siteUrl: args.siteUrl, actorEmail });
      if (!('ok' in res) || !res.ok) {
        console.error(`status 失敗：${'reason' in res ? `${res.reason} — ${res.message}` : res}`);
        process.exit(1);
      }
      console.log(`Factory Support 通道狀態（${args.siteUrl}）：`);
      console.log(`  provisioned         ：${res.provisioned ? '是' : '否'}`);
      console.log(`  disabled            ：${res.disabled ? '是' : '否'}`);
      console.log(`  lastLoginAt         ：${res.lastLoginAt ?? '從未登入'}`);
      console.log(`  monthlyAccessCount  ：${res.monthlyAccessCount}`);
      return;
    }
    case 'provision': {
      const email = need(args, 'email');
      const res = await client.provision({ siteUrl: args.siteUrl, email, actorEmail });
      if (!('ok' in res) || !res.ok) {
        console.error(`provision 失敗：${'reason' in res ? `${res.reason} — ${res.message}` : res}`);
        process.exit(1);
      }
      if (res.alreadyProvisioned) {
        console.log(`帳號已存在（idempotent），未建立新密碼。`);
      } else {
        console.log(`✅ 已建立 factory-support 帳號`);
        console.log(`  email      ：${email}`);
        console.log(`  初始密碼   ：${res.initialPassword}`);
        console.log(`  → 立刻收進 Bitwarden 路徑 clients/<subdomain>/factory-support`);
      }
      return;
    }
    case 'rotate-password': {
      const reason = need(args, 'reason');
      const res = await client.rotatePassword({ siteUrl: args.siteUrl, actorEmail, reason });
      if (!('ok' in res) || !res.ok) {
        console.error(`rotate 失敗：${'reason' in res ? `${res.reason} — ${res.message}` : res}`);
        process.exit(1);
      }
      console.log(`✅ rotate 完成`);
      console.log(`  新密碼  ：${res.newPassword}`);
      console.log(`  → 立刻收進 Bitwarden 並從本 terminal scrollback 刪除`);
      return;
    }
    case 'disable': {
      const reason = need(args, 'reason');
      const res = await client.disable({ siteUrl: args.siteUrl, actorEmail, reason });
      if (!('ok' in res) || !res.ok) {
        console.error(`disable 失敗：${'reason' in res ? `${res.reason} — ${res.message}` : res}`);
        process.exit(1);
      }
      console.log(`✅ disable 完成於 ${res.disabledAt}`);
      console.log(`  注意：L1（factory-support 登入）已凍結；L3（platform-level）仍保留`);
      return;
    }
    case 'enable': {
      const reason = need(args, 'reason');
      const res = await client.enable({ siteUrl: args.siteUrl, actorEmail, reason });
      if (!('ok' in res) || !res.ok) {
        console.error(`enable 失敗：${'reason' in res ? `${res.reason} — ${res.message}` : res}`);
        process.exit(1);
      }
      console.log(`✅ enable 完成於 ${res.enabledAt}`);
      return;
    }
    case 'audit-log': {
      const limit = args.flags.get('limit') ? Number.parseInt(args.flags.get('limit')!, 10) : 20;
      const before = args.flags.get('before');
      const filterAction = args.flags.get('filterAction');
      const res = await client.auditLog({
        siteUrl: args.siteUrl,
        actorEmail,
        limit,
        ...(before ? { before } : {}),
        ...(filterAction
          ? {
              filterAction: filterAction as Parameters<typeof client.auditLog>[0]['filterAction'],
            }
          : {}),
      });
      if (!('ok' in res) || !res.ok) {
        console.error(`audit-log 失敗：${'reason' in res ? `${res.reason} — ${res.message}` : res}`);
        process.exit(1);
      }
      console.log(`近期 ${res.entries.length} 筆稽核紀錄（總約 ${res.totalEstimate} 筆）：\n`);
      for (const entry of res.entries) {
        console.log(formatAuditEntry(entry));
      }
      if (res.nextCursor) {
        console.log(`\n下一頁：--before=${res.nextCursor}`);
      }
      return;
    }
    default: {
      // 不可能到這（所有 6 個 SupportAccessAction 都已 case 過），保底拋錯
      const exhaustive: never = normalizedAction;
      throw new Error(`未實作的 action：${String(exhaustive)}`);
    }
  }
  /* eslint-enable no-console */
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console -- CLI 腳本
  console.error('support-access-cli 失敗：', err instanceof Error ? err.message : err);
  process.exit(1);
});
