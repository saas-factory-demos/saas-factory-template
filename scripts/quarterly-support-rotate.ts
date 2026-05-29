/**
 * 季度 Factory Support 通道密碼 rotate 腳本（ADR-0100 / 11-AUDIT-3）。
 *
 * 由 `.github/workflows/quarterly-support-rotate.yml` 在每季首月 1 號 03:00 UTC
 * （= 11:00 Asia/Taipei）觸發。
 *
 * 流程：
 * 1. 從 factory `GET /api/projects` 拿所有 project 列表
 * 2. 對每個 project 呼叫 `POST /api/projects/[id]/support-access` action=rotate
 * 3. 收集新密碼後寄信給 factory owner，提醒立刻收進 Bitwarden
 * 4. 任一站 rotate 失敗：繼續做其他站，最後集中報失敗清單；exit 1 讓 workflow 紅燈
 *
 * 環境變數：
 * - `FACTORY_URL`：factory app production URL
 * - `FACTORY_BEARER_TOKEN`：呼叫 factory API 用
 * - `RESEND_API_KEY`：寄信用
 * - `REPORT_FROM`：寄件者（Resend 已驗證網域）
 * - `REPORT_TO`：收件人 csv
 */

interface ProjectSnapshot {
  id: string;
  wizard?: { client?: { clientName?: string; subdomain?: string } };
  deployUrl?: string;
  status?: string;
}

interface RotateOk {
  ok: true;
  newPassword: string;
}

interface RotateError {
  ok: false;
  reason?: string;
  message?: string;
  error?: string;
}

type RotateResult = RotateOk | RotateError;

interface RotateOutcome {
  projectId: string;
  clientName: string;
  subdomain: string;
  ok: boolean;
  /** 成功時的新密碼，給寄信用（敏感，僅出現在 factory owner 收的信） */
  newPassword?: string;
  /** 失敗時的錯誤摘要 */
  error?: string;
}

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`必要環境變數未設：${name}`);
  return v;
}

/** 從 factory 拉專案列表（排除已 archived / failed）。 */
async function fetchProjects(factoryUrl: string, token: string): Promise<ProjectSnapshot[]> {
  const url = `${factoryUrl.replace(/\/$/, '')}/api/projects`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`拉專案列表失敗：${res.status} ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as { projects?: ProjectSnapshot[] };
  return (json.projects ?? []).filter((p) => p.status !== 'archived' && p.deployUrl);
}

/** 對單一專案呼叫 rotate。 */
async function rotateOne(
  factoryUrl: string,
  token: string,
  project: ProjectSnapshot,
): Promise<RotateOutcome> {
  const clientName = project.wizard?.client?.clientName ?? '(未命名)';
  const subdomain = project.wizard?.client?.subdomain ?? project.id;
  const url = `${factoryUrl.replace(/\/$/, '')}/api/projects/${project.id}/support-access`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        action: 'rotate',
        reason: '季度排程 rotate（quarterly-support-rotate workflow）',
      }),
    });
    const text = await res.text();
    let parsed: RotateResult;
    try {
      parsed = JSON.parse(text) as RotateResult;
    } catch {
      return {
        projectId: project.id,
        clientName,
        subdomain,
        ok: false,
        error: `回應非 JSON：HTTP ${res.status}`,
      };
    }
    if ('ok' in parsed && parsed.ok === true) {
      return { projectId: project.id, clientName, subdomain, ok: true, newPassword: parsed.newPassword };
    }
    const err = (parsed as RotateError).message ?? (parsed as RotateError).error ?? `HTTP ${res.status}`;
    return { projectId: project.id, clientName, subdomain, ok: false, error: err };
  } catch (err) {
    return {
      projectId: project.id,
      clientName,
      subdomain,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** 渲染結果為寄信用的明文。包含敏感密碼，**只寄給 factory owner**。 */
function renderEmailText(outcomes: RotateOutcome[], period: string): string {
  const ok = outcomes.filter((o) => o.ok);
  const fail = outcomes.filter((o) => !o.ok);
  const lines: string[] = [];
  lines.push(`Factory Support 季度密碼 rotate 完成（${period}）`);
  lines.push('');
  lines.push(`總計：${outcomes.length} 站 / 成功 ${ok.length} / 失敗 ${fail.length}`);
  lines.push('');
  lines.push('=== 成功 rotate（請立即收入 Bitwarden，本郵件 24 小時後手動刪除）===');
  for (const o of ok) {
    lines.push('');
    lines.push(`* ${o.clientName} (${o.subdomain})`);
    lines.push(`  - project ID: ${o.projectId}`);
    lines.push(`  - 新密碼: ${o.newPassword ?? '(unknown)'}`);
    lines.push(`  - Bitwarden 路徑: clients/${o.subdomain}/factory-support`);
  }
  if (fail.length > 0) {
    lines.push('');
    lines.push('=== 失敗 rotate（請手動跑 SOP 第五.5 節 rotate 流程）===');
    for (const o of fail) {
      lines.push(`* ${o.clientName} (${o.subdomain}): ${o.error ?? '?'}`);
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('本郵件包含敏感資訊，請於收入 Bitwarden 後立即刪除。');
  lines.push('稽核軌跡已寫入每站 factory-support-logs collection。');
  return lines.join('\n');
}

async function sendEmail(args: {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  text: string;
}): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${args.apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: args.from,
      to: args.to,
      subject: args.subject,
      text: args.text,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend 寄信失敗：${res.status} ${body.slice(0, 300)}`);
  }
}

async function main(): Promise<void> {
  const factoryUrl = need('FACTORY_URL');
  const token = need('FACTORY_BEARER_TOKEN');
  const resendKey = need('RESEND_API_KEY');
  const from = need('REPORT_FROM');
  const to = need('REPORT_TO')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (to.length === 0) throw new Error('REPORT_TO 至少要有一個收件人');

  const now = new Date();
  const period = `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;

  const projects = await fetchProjects(factoryUrl, token);
  if (projects.length === 0) {
    // eslint-disable-next-line no-console -- CLI 腳本回傳給 GitHub Actions log
    console.log(`沒有需要 rotate 的專案（${period}），跳過。`);
    return;
  }

  // 序列執行避免對 factory app 同時 N 個 rotate 撞 rate limit（factory route 10/min）
  const outcomes: RotateOutcome[] = [];
  for (const p of projects) {
    outcomes.push(await rotateOne(factoryUrl, token, p));
  }

  const text = renderEmailText(outcomes, period);
  await sendEmail({
    apiKey: resendKey,
    from,
    to,
    subject: `[SaaS Factory] Factory Support 季度密碼 rotate（${period}）`,
    text,
  });

  const failCount = outcomes.filter((o) => !o.ok).length;
  if (failCount > 0) {
    // eslint-disable-next-line no-console -- CLI 腳本回傳給 GitHub Actions log
    console.error(`季度 rotate 完成，${failCount} 站失敗：詳見郵件`);
    process.exit(1);
  }
  // eslint-disable-next-line no-console -- CLI 腳本回傳給 GitHub Actions log
  console.log(`季度 rotate 全部成功（${period}），共 ${outcomes.length} 站。`);
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console -- 失敗訊息要在 Actions log 可見
  console.error('季度 rotate 失敗：', err);
  process.exit(1);
});

export {};
