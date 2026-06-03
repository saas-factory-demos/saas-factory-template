/**
 * Workflow 參數模板引擎。
 *
 * 用途：marketing automation 的 action / condition params 內若帶 `{{var}}`，
 * 執行階段須以實際 context 替換。例：
 *
 *   send-email.subject = "嗨 {{customer.displayName}}，歡迎"
 *   webhook.url = "https://api.example.com/notify?email={{customer.email}}"
 *
 * 安全性原則（為何不直接用 Mustache / Handlebars）：
 * 1. 嚴禁任意表達式：不可 `{{1+1}}`、不可 function call、不可條件 helper
 * 2. 變數白名單強制：未列入 `allowedVars` 一律拒（防客戶誤打到 `process.env`）
 * 3. 巢狀路徑支援：`{{customer.email}}` / `{{event.tagId}}`，深度上限 5（防 ReDoS）
 * 4. 不做 HTML 跳脫：caller 自己決定是否包 escape（webhook URL / email body 規則不同）
 * 5. Missing var → throw（fail-closed，不要 silent 變空字串導致 webhook 打錯 URL）
 *
 * 邊界：
 * - template 字串不可超過 8KB（避免巨型 prompt injection）
 * - 一次渲染最多展開 200 個變數（避免人工塞 10 萬個 placeholder）
 */

const TEMPLATE_MAX_LEN = 8 * 1024;
const MAX_EXPANSIONS = 200;
const MAX_PATH_DEPTH = 5;
const VAR_PATH_RE = /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/;
const PLACEHOLDER_RE = /\{\{\s*([^{}]+?)\s*\}\}/g;

export interface RenderOptions {
  /** 允許出現的變數路徑（完整匹配）。例：['customer.email', 'event.tagId']。 */
  allowedVars: readonly string[];
}

/**
 * 渲染模板字串。命中未授權變數 / 找不到值都會 throw。
 */
export function renderTemplate(
  template: string,
  context: Record<string, unknown>,
  opts: RenderOptions,
): string {
  if (template.length > TEMPLATE_MAX_LEN) {
    throw new Error(`template 超過長度上限 ${TEMPLATE_MAX_LEN}`);
  }
  const allowed = new Set(opts.allowedVars);
  let count = 0;
  return template.replace(PLACEHOLDER_RE, (_match, raw: string) => {
    count++;
    if (count > MAX_EXPANSIONS) {
      throw new Error(`template 展開次數超過上限 ${MAX_EXPANSIONS}`);
    }
    const path = raw.trim();
    if (!VAR_PATH_RE.test(path)) {
      throw new Error(`非法變數路徑：${path}`);
    }
    if (path.split('.').length > MAX_PATH_DEPTH) {
      throw new Error(`變數路徑過深（>${MAX_PATH_DEPTH}）：${path}`);
    }
    if (!allowed.has(path)) {
      throw new Error(`未授權變數：${path}`);
    }
    const value = resolvePath(context, path);
    if (value === undefined || value === null) {
      throw new Error(`變數無值：${path}`);
    }
    return stringify(value);
  });
}

/**
 * 抽取 template 中所有 placeholder 變數路徑（不去重、保留出現順序）。
 *
 * 用於編輯器即時提示「你引用的變數」。不做安全檢查。
 */
export function extractVariables(template: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  PLACEHOLDER_RE.lastIndex = 0;
  while ((m = PLACEHOLDER_RE.exec(template)) !== null) {
    const path = m[1]?.trim();
    if (path) out.push(path);
  }
  return out;
}

/**
 * 預先靜態驗證 template（編輯器存檔前用）。
 *
 * 回錯誤訊息陣列；空陣列表示通過。**不需要實際 context**，只看語法 + 白名單。
 */
export function validateTemplate(
  template: string,
  allowedVars: readonly string[],
): string[] {
  const errors: string[] = [];
  if (template.length > TEMPLATE_MAX_LEN) {
    errors.push(`template 超過長度上限 ${TEMPLATE_MAX_LEN}`);
    return errors;
  }
  const allowed = new Set(allowedVars);
  let m: RegExpExecArray | null;
  PLACEHOLDER_RE.lastIndex = 0;
  const seen: string[] = [];
  while ((m = PLACEHOLDER_RE.exec(template)) !== null) {
    const path = m[1]?.trim() ?? '';
    seen.push(path);
    if (!VAR_PATH_RE.test(path)) {
      errors.push(`非法變數路徑：${path}`);
      continue;
    }
    if (path.split('.').length > MAX_PATH_DEPTH) {
      errors.push(`變數路徑過深：${path}`);
      continue;
    }
    if (!allowed.has(path)) {
      errors.push(`未授權變數：${path}`);
    }
  }
  if (seen.length > MAX_EXPANSIONS) {
    errors.push(`placeholder 數量超過上限 ${MAX_EXPANSIONS}`);
  }
  return errors;
}

/**
 * 渲染 record 內所有 string value（保留 number / boolean 原值）。
 *
 * action / condition 的 params 直接餵這個。
 */
export function renderParams(
  params: Record<string, string | number | boolean>,
  context: Record<string, unknown>,
  opts: RenderOptions,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    out[k] = typeof v === 'string' ? renderTemplate(v, context, opts) : v;
  }
  return out;
}

/**
 * MVP 預設允許變數。執行引擎 / API 可基於 trigger 型別擴充。
 *
 * 注意：放這裡是約定常識集合，不能放使用者輸入 / env 等敏感值。
 */
export const DEFAULT_ALLOWED_VARS: readonly string[] = [
  'customer.id',
  'customer.email',
  'customer.phone',
  'customer.displayName',
  'customer.lifecycleStage',
  'event.type',
  'event.tagId',
  'event.pagePath',
  'event.formId',
  'event.orderId',
  'now',
  'tenant.id',
  'tenant.name',
];

/**
 * 預檢 workflow 內所有節點 params 內的模板字串。
 *
 * 回錯誤陣列；空表示 workflow 內所有 `{{var}}` 都符合白名單 + 語法。
 */
export function validateWorkflowTemplates(
  nodes: Array<{
    id: string;
    data: {
      kind: string;
      params?: Record<string, string | number | boolean>;
      value?: string | number | boolean | Array<string | number>;
    };
  }>,
  allowedVars: readonly string[] = DEFAULT_ALLOWED_VARS,
): string[] {
  const errors: string[] = [];
  for (const n of nodes) {
    const params = n.data.params;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (typeof v !== 'string') continue;
        for (const e of validateTemplate(v, allowedVars)) {
          errors.push(`節點 ${n.id} 的 params.${k}：${e}`);
        }
      }
    }
    if (typeof n.data.value === 'string') {
      for (const e of validateTemplate(n.data.value, allowedVars)) {
        errors.push(`節點 ${n.id} 的 value：${e}`);
      }
    }
  }
  return errors;
}

function resolvePath(ctx: Record<string, unknown>, path: string): unknown {
  let cur: unknown = ctx;
  for (const seg of path.split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined;
    // __proto__ / constructor / prototype 一律拒（prototype pollution 防線）
    if (seg === '__proto__' || seg === 'constructor' || seg === 'prototype') return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

function stringify(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toISOString();
  // object / array：JSON 序列化（不要 [object Object]）
  return JSON.stringify(value);
}
