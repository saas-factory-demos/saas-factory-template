/**
 * 真實 dispatchAction：把 workflow 動作節點接到實體 side-effect。
 *
 * 設計取向：
 * - **可以全 stub 跑**：依賴透過建構函式注入，未注入則該 action 走 noop ok:true 或明確 ok:false，
 *   讓無 RESEND_API_KEY / 無外部憑證的環境也能 e2e 跑通整條鏈。
 * - **fail-fast 由 caller 決定**：本層失敗回 `ok:false` + error；executor 看到
 *   `ok:false` 會把整條 run 標 failed。retry 留給 scheduler / 上層。
 * - **outbound 限制**：webhook 加 5s timeout、僅允許 http(s)、reject file:// 等
 *   schema 避免被 trigger payload 灌進來的惡意 URL 打內部服務。
 *
 * 動作覆蓋（MVP）：
 * - send-email：用注入 EmailSender 寄信（params: to, subject, html?, text?）
 * - notify-admin：寄到 adminEmail（params: subject, message）
 * - webhook：HTTP POST 到 params.url，body = params.body（已 render）
 * - add-tag / remove-tag / create-task：log-only ok（要碰客戶站 Payload API，
 *   每站 secret / 表名不同，留待 per-app 接線後續工作）
 */

import type { DispatchAction, DispatchResult } from '@saas-factory/factory-workflows';

/**
 * Email 寄送介面。為何不直接 import factory-generator 的 EmailSender：
 * 這個 pkg 要給 template 用，template 不該依賴 factory-generator
 * （那是接案工廠自己的 codegen 工具）。caller 提供形狀相符的 adapter 即可。
 */
export interface EmailSender {
  send(input: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<{ ok: true } | { ok: false; error: string }>;
}

export interface DispatchDeps {
  email?: EmailSender;
  /** notify-admin 寄到這個 email。 */
  adminEmail?: string;
  /** webhook timeout（毫秒），預設 5000。 */
  webhookTimeoutMs?: number;
  /** 自訂 fetch（測試用）；預設 globalThis.fetch。 */
  fetchImpl?: typeof fetch;
  /** Log 介面（測試用）；預設 console。 */
  logger?: { info: (msg: string, meta?: unknown) => void; warn: (msg: string, meta?: unknown) => void };
}

/**
 * 建立 dispatchAction。
 *
 * 缺對應 dep 時對應 action 回 `ok:false`（要明示），不靜默吞掉；
 * 唯一例外是 add-tag / remove-tag / create-task 這三個尚未接客戶站的，
 * 統一 log + ok:true，讓 workflow 編輯 / 測試可以放心擺進去。
 */
export function createDispatchAction(deps: DispatchDeps = {}): DispatchAction {
  const log = deps.logger ?? console;
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const webhookTimeoutMs = deps.webhookTimeoutMs ?? 5000;

  return async ({ actionType, params }): Promise<DispatchResult> => {
    switch (actionType) {
      case 'send-email':
        return dispatchSendEmail(deps.email, params, log);
      case 'notify-admin':
        return dispatchNotifyAdmin(deps.email, deps.adminEmail, params, log);
      case 'webhook':
        return dispatchWebhook(params, fetchImpl, webhookTimeoutMs, log);
      case 'add-tag':
      case 'remove-tag':
      case 'create-task':
        log.info(`[dispatch] ${actionType} 尚未接客戶站，視為 ok（記 log）`, { params });
        return { ok: true };
      default: {
        // exhaustive check
        const _exhaustive: never = actionType;
        return { ok: false, error: `未知 actionType：${String(_exhaustive)}` };
      }
    }
  };
}

async function dispatchSendEmail(
  email: EmailSender | undefined,
  params: Record<string, string | number | boolean>,
  log: NonNullable<DispatchDeps['logger']>,
): Promise<DispatchResult> {
  if (!email) return { ok: false, error: 'send-email 缺 email sender' };
  const to = String(params.to ?? '');
  const subject = String(params.subject ?? '');
  if (!to || !subject) return { ok: false, error: 'send-email 缺 to / subject' };
  const html =
    params.html !== undefined
      ? String(params.html)
      : `<p>${escapeHtml(String(params.text ?? subject))}</p>`;
  const text = params.text !== undefined ? String(params.text) : stripHtml(html);
  try {
    const res = await email.send({ to, subject, html, text });
    if (!res.ok) return { ok: false, error: res.error };
    log.info('[dispatch] send-email ok', { to, subject });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'send-email 失敗' };
  }
}

async function dispatchNotifyAdmin(
  email: EmailSender | undefined,
  adminEmail: string | undefined,
  params: Record<string, string | number | boolean>,
  log: NonNullable<DispatchDeps['logger']>,
): Promise<DispatchResult> {
  if (!email) return { ok: false, error: 'notify-admin 缺 email sender' };
  if (!adminEmail) return { ok: false, error: 'notify-admin 缺 adminEmail' };
  const subject = String(params.subject ?? '[workflow] 通知');
  const message = String(params.message ?? '');
  const html = `<p>${escapeHtml(message)}</p>`;
  try {
    const res = await email.send({ to: adminEmail, subject, html, text: message });
    if (!res.ok) return { ok: false, error: res.error };
    log.info('[dispatch] notify-admin ok', { adminEmail, subject });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'notify-admin 失敗' };
  }
}

async function dispatchWebhook(
  params: Record<string, string | number | boolean>,
  fetchImpl: typeof fetch,
  timeoutMs: number,
  log: NonNullable<DispatchDeps['logger']>,
): Promise<DispatchResult> {
  const url = String(params.url ?? '');
  if (!url) return { ok: false, error: 'webhook 缺 url' };
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: 'webhook url 格式錯誤' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: `webhook 僅支援 http(s)，收到：${parsed.protocol}` };
  }
  const body = params.body !== undefined ? String(params.body) : '';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body || '{}',
      signal: controller.signal,
    });
    if (!res.ok) {
      return { ok: false, error: `webhook ${res.status} ${res.statusText}` };
    }
    log.info('[dispatch] webhook ok', { url, status: res.status });
    return { ok: true };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { ok: false, error: `webhook timeout（${timeoutMs}ms）` };
    }
    return { ok: false, error: err instanceof Error ? err.message : 'webhook 失敗' };
  } finally {
    clearTimeout(timer);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '').trim();
}
