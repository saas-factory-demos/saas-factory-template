/**
 * L3 ownership transfer 退場驗證腳本（ADR-0100 + l3-ownership-transfer-sop.md 退場稽核章節）。
 *
 * 用途：客戶完成所有平台 ownership transfer 後，工廠端跑此腳本驗證：
 * - GitHub repo：factory token 已不可存取
 * - Vercel project：factory token 已不可存取
 * - Neon project：factory API key 已不可存取
 * - Cloudflare R2 bucket：factory access key 已不可存取（如有提供）
 * - Sentry self-hosted：對應 project 已 disabled / 刪除
 * - Bunny.net stream library：factory API key 已不可存取（如有提供）
 *
 * 用法：
 *   tsx scripts/audit-platform-access.ts <subdomain> [--repo=org/name]
 *     [--vercel-project-id=prj_xxx] [--neon-project-id=np_xxx]
 *     [--r2-bucket=bucket] [--sentry-project-slug=slug]
 *     [--bunny-library-id=12345]
 *
 * 環境變數：
 * - FACTORY_GITHUB_TOKEN：GitHub fine-grained PAT
 * - VERCEL_TOKEN（+ optional VERCEL_TEAM_ID）：Vercel token
 * - NEON_API_KEY：Neon API key
 * - R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_ACCOUNT_ID（optional）：Cloudflare R2
 * - SENTRY_AUTH_TOKEN / SENTRY_URL / SENTRY_ORG（optional）：self-hosted Sentry
 * - BUNNY_STREAM_API_KEY（optional）：Bunny.net stream API key
 *
 * 結果：
 * - 全部 4xx/5xx／not-found → exit 0（transfer 驗證通過）
 * - 任一平台仍可存取 → exit 1（必須立即處理）
 */

interface PlatformCheckResult {
  platform: string;
  resource: string;
  /** transfer 後預期：should be unable to access */
  ok: boolean;
  /** 給人看的訊息 */
  message: string;
}

interface CliArgs {
  subdomain: string;
  repo?: string;
  vercelProjectId?: string;
  neonProjectId?: string;
  r2Bucket?: string;
  sentryProjectSlug?: string;
  /** Bunny.net stream library id（數字字串）。 */
  bunnyLibraryId?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const positional = argv.filter((a) => !a.startsWith('--'));
  const subdomain = positional[0];
  if (!subdomain) {
    throw new Error('用法：tsx scripts/audit-platform-access.ts <subdomain> [--flags]');
  }
  const flags = new Map<string, string>();
  for (const arg of argv) {
    if (arg.startsWith('--')) {
      const [k, v] = arg.slice(2).split('=', 2);
      if (k && v) flags.set(k, v);
    }
  }
  return {
    subdomain,
    ...(flags.get('repo') ? { repo: flags.get('repo')! } : {}),
    ...(flags.get('vercel-project-id') ? { vercelProjectId: flags.get('vercel-project-id')! } : {}),
    ...(flags.get('neon-project-id') ? { neonProjectId: flags.get('neon-project-id')! } : {}),
    ...(flags.get('r2-bucket') ? { r2Bucket: flags.get('r2-bucket')! } : {}),
    ...(flags.get('sentry-project-slug')
      ? { sentryProjectSlug: flags.get('sentry-project-slug')! }
      : {}),
    ...(flags.get('bunny-library-id')
      ? { bunnyLibraryId: flags.get('bunny-library-id')! }
      : {}),
  };
}

async function checkGitHub(repo: string, token: string): Promise<PlatformCheckResult> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' },
    });
    if (res.status === 404 || res.status === 403 || res.status === 401) {
      return {
        platform: 'GitHub',
        resource: repo,
        ok: true,
        message: `已切斷（HTTP ${res.status}）`,
      };
    }
    if (res.status === 200) {
      return {
        platform: 'GitHub',
        resource: repo,
        ok: false,
        message: `仍可存取（HTTP 200）— factory token 必須 revoke 或 transfer 未完成`,
      };
    }
    return {
      platform: 'GitHub',
      resource: repo,
      ok: false,
      message: `非預期回應（HTTP ${res.status}），請手動驗證`,
    };
  } catch (err) {
    return {
      platform: 'GitHub',
      resource: repo,
      ok: false,
      message: `網路錯誤：${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function checkVercel(
  projectId: string,
  token: string,
  teamId: string | undefined,
): Promise<PlatformCheckResult> {
  try {
    const url = new URL(`https://api.vercel.com/v9/projects/${projectId}`);
    if (teamId) url.searchParams.set('teamId', teamId);
    const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
    if (res.status === 404 || res.status === 403 || res.status === 401) {
      return {
        platform: 'Vercel',
        resource: projectId,
        ok: true,
        message: `已切斷（HTTP ${res.status}）`,
      };
    }
    if (res.status === 200) {
      return {
        platform: 'Vercel',
        resource: projectId,
        ok: false,
        message: 'project 仍在 factory team — transfer 未完成',
      };
    }
    return {
      platform: 'Vercel',
      resource: projectId,
      ok: false,
      message: `非預期回應（HTTP ${res.status}）`,
    };
  } catch (err) {
    return {
      platform: 'Vercel',
      resource: projectId,
      ok: false,
      message: `網路錯誤：${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function checkNeon(projectId: string, apiKey: string): Promise<PlatformCheckResult> {
  try {
    const res = await fetch(`https://console.neon.tech/api/v2/projects/${projectId}`, {
      headers: { authorization: `Bearer ${apiKey}`, accept: 'application/json' },
    });
    if (res.status === 404 || res.status === 403 || res.status === 401) {
      return {
        platform: 'Neon',
        resource: projectId,
        ok: true,
        message: `已切斷（HTTP ${res.status}）`,
      };
    }
    if (res.status === 200) {
      return {
        platform: 'Neon',
        resource: projectId,
        ok: false,
        message: 'project 仍在 factory org — transfer 未完成',
      };
    }
    return {
      platform: 'Neon',
      resource: projectId,
      ok: false,
      message: `非預期回應（HTTP ${res.status}）`,
    };
  } catch (err) {
    return {
      platform: 'Neon',
      resource: projectId,
      ok: false,
      message: `網路錯誤：${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function checkR2(bucket: string): Promise<PlatformCheckResult> {
  // R2 用 S3 sigv4 簽章較複雜，這裡做最小可行檢查：
  // 1. 若 R2_ACCESS_KEY_ID 等 env 都還在，提醒 user revoke
  // 2. 真實簽章驗證留給 rclone CLI 在 SOP 內手動跑
  const hasKey = Boolean(
    process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ACCOUNT_ID,
  );
  return {
    platform: 'R2',
    resource: bucket,
    ok: !hasKey,
    message: hasKey
      ? 'factory 端 R2_* env 仍存在 — 請至 Cloudflare dashboard revoke access key + 從 factory env 移除'
      : 'factory 端已無 R2 credentials',
  };
}

async function checkSentry(
  projectSlug: string,
  baseUrl: string,
  org: string,
  token: string,
): Promise<PlatformCheckResult> {
  try {
    const res = await fetch(
      `${baseUrl.replace(/\/$/, '')}/api/0/projects/${org}/${projectSlug}/`,
      { headers: { authorization: `Bearer ${token}` } },
    );
    if (res.status === 404) {
      return {
        platform: 'Sentry',
        resource: projectSlug,
        ok: true,
        message: '已刪除（404）',
      };
    }
    if (res.status === 403 || res.status === 401) {
      return {
        platform: 'Sentry',
        resource: projectSlug,
        ok: true,
        message: `已不可存取（HTTP ${res.status}）`,
      };
    }
    if (res.status === 200) {
      const data = (await res.json()) as { status?: string };
      if (data.status === 'disabled' || data.status === 'pending_deletion') {
        return {
          platform: 'Sentry',
          resource: projectSlug,
          ok: true,
          message: `已停用（status=${data.status}）`,
        };
      }
      return {
        platform: 'Sentry',
        resource: projectSlug,
        ok: false,
        message: 'project 仍 active — 請進 Sentry console 停用',
      };
    }
    return {
      platform: 'Sentry',
      resource: projectSlug,
      ok: false,
      message: `非預期回應（HTTP ${res.status}）`,
    };
  } catch (err) {
    return {
      platform: 'Sentry',
      resource: projectSlug,
      ok: false,
      message: `網路錯誤：${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Bunny.net stream library 檢查：transfer 後預期 factory 端 API key 無法存取
 * 對應 library。
 *
 * Bunny stream API：GET https://video.bunnycdn.com/library/{libraryId}
 * - 200 → 仍可存取，transfer 未完
 * - 401 / 404 → 已切斷
 */
async function checkBunny(libraryId: string, apiKey: string): Promise<PlatformCheckResult> {
  try {
    const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}`, {
      headers: { AccessKey: apiKey, accept: 'application/json' },
    });
    if (res.status === 404 || res.status === 403 || res.status === 401) {
      return {
        platform: 'Bunny',
        resource: libraryId,
        ok: true,
        message: `已切斷（HTTP ${res.status}）`,
      };
    }
    if (res.status === 200) {
      return {
        platform: 'Bunny',
        resource: libraryId,
        ok: false,
        message: 'library 仍可存取 — factory API key 必須 revoke 或遷移未完成',
      };
    }
    return {
      platform: 'Bunny',
      resource: libraryId,
      ok: false,
      message: `非預期回應（HTTP ${res.status}），請手動驗證`,
    };
  } catch (err) {
    return {
      platform: 'Bunny',
      resource: libraryId,
      ok: false,
      message: `網路錯誤：${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const results: PlatformCheckResult[] = [];

  if (args.repo && process.env.FACTORY_GITHUB_TOKEN) {
    results.push(await checkGitHub(args.repo, process.env.FACTORY_GITHUB_TOKEN));
  } else if (args.repo) {
    results.push({
      platform: 'GitHub',
      resource: args.repo,
      ok: false,
      message: 'FACTORY_GITHUB_TOKEN 未設，無法驗證（傳統會在 transfer 後 revoke token，但建議手動驗證）',
    });
  }

  if (args.vercelProjectId && process.env.VERCEL_TOKEN) {
    results.push(
      await checkVercel(args.vercelProjectId, process.env.VERCEL_TOKEN, process.env.VERCEL_TEAM_ID),
    );
  } else if (args.vercelProjectId) {
    results.push({
      platform: 'Vercel',
      resource: args.vercelProjectId,
      ok: false,
      message: 'VERCEL_TOKEN 未設，無法驗證',
    });
  }

  if (args.neonProjectId && process.env.NEON_API_KEY) {
    results.push(await checkNeon(args.neonProjectId, process.env.NEON_API_KEY));
  } else if (args.neonProjectId) {
    results.push({
      platform: 'Neon',
      resource: args.neonProjectId,
      ok: false,
      message: 'NEON_API_KEY 未設，無法驗證',
    });
  }

  if (args.r2Bucket) {
    results.push(await checkR2(args.r2Bucket));
  }

  if (
    args.sentryProjectSlug &&
    process.env.SENTRY_AUTH_TOKEN &&
    process.env.SENTRY_URL &&
    process.env.SENTRY_ORG
  ) {
    results.push(
      await checkSentry(
        args.sentryProjectSlug,
        process.env.SENTRY_URL,
        process.env.SENTRY_ORG,
        process.env.SENTRY_AUTH_TOKEN,
      ),
    );
  } else if (args.sentryProjectSlug) {
    results.push({
      platform: 'Sentry',
      resource: args.sentryProjectSlug,
      ok: false,
      message: 'SENTRY_AUTH_TOKEN / SENTRY_URL / SENTRY_ORG 未齊備，無法驗證',
    });
  }

  if (args.bunnyLibraryId && process.env.BUNNY_STREAM_API_KEY) {
    results.push(await checkBunny(args.bunnyLibraryId, process.env.BUNNY_STREAM_API_KEY));
  } else if (args.bunnyLibraryId) {
    results.push({
      platform: 'Bunny',
      resource: args.bunnyLibraryId,
      ok: false,
      message: 'BUNNY_STREAM_API_KEY 未設，無法驗證',
    });
  }

  // 渲染結果
  // eslint-disable-next-line no-console -- CLI 腳本
  console.log(`\nL3 平台存取驗證：${args.subdomain}\n${'='.repeat(60)}`);
  for (const r of results) {
    const symbol = r.ok ? '✅' : '❌';
    // eslint-disable-next-line no-console -- CLI 腳本
    console.log(`${symbol} ${r.platform.padEnd(8)} ${r.resource.padEnd(45)} ${r.message}`);
  }
  const failed = results.filter((r) => !r.ok);
  // eslint-disable-next-line no-console -- CLI 腳本
  console.log(`${'='.repeat(60)}\n總計 ${results.length} 項；${failed.length} 項未通過。\n`);

  if (failed.length > 0) {
    // eslint-disable-next-line no-console -- CLI 腳本
    console.error('未通過項目必須立即處理（見 docs/customer/l3-ownership-transfer-sop.md）。');
    process.exit(1);
  }
  if (results.length === 0) {
    // eslint-disable-next-line no-console -- CLI 腳本
    console.log('沒有檢查項目（請至少提供 --repo / --vercel-project-id / --neon-project-id 之一）');
    process.exit(2);
  }
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console -- CLI 腳本
  console.error('audit-platform-access 失敗：', err);
  process.exit(1);
});

export {};
