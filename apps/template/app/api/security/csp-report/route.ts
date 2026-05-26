/**
 * CSP 違規回報接收端點。
 *
 * 瀏覽器在違反 CSP 時會 POST 以下兩種格式之一：
 * - 舊版（`Content-Security-Policy-Report-Only` + `report-uri`）：`{ "csp-report": { ... } }`
 * - 新版（`report-to` + Reporting API）：`[ { "type": "csp-violation", "body": { ... } } ]`
 *
 * 本端點接收兩種格式，限制 body 大小（防濫用），輸出結構化 log 供 Sentry / loki 收集。
 * 不依賴外部資料庫，避免攻擊者灌入大量假違規拖垮後端。
 */

const MAX_BODY_BYTES = 16 * 1024; // 16 KB，CSP 報告通常 < 2 KB

interface CspReportLegacy {
  'csp-report'?: {
    'document-uri'?: string;
    'violated-directive'?: string;
    'effective-directive'?: string;
    'blocked-uri'?: string;
    'source-file'?: string;
    'line-number'?: number;
    'status-code'?: number;
  };
}

interface CspReportV3 {
  type?: string;
  body?: {
    documentURL?: string;
    violatedDirective?: string;
    effectiveDirective?: string;
    blockedURL?: string;
    sourceFile?: string;
    lineNumber?: number;
    statusCode?: number;
  };
}

/**
 * 接收 CSP 違規回報。
 */
export async function POST(request: Request): Promise<Response> {
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (contentLength > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  let payload: CspReportLegacy | CspReportV3[] | unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const violations = normalize(payload);
  for (const v of violations) {
    // 結構化日誌：Vercel / self-hosted Sentry 會自動收集 stderr
    console.warn(
      JSON.stringify({
        kind: 'csp-violation',
        documentUri: v.documentUri,
        directive: v.directive,
        blockedUri: v.blockedUri,
        sourceFile: v.sourceFile,
        line: v.line,
        at: new Date().toISOString(),
      }),
    );
  }

  return new Response(null, { status: 204 });
}

interface NormalizedViolation {
  documentUri?: string;
  directive?: string;
  blockedUri?: string;
  sourceFile?: string;
  line?: number;
}

/**
 * 將兩種 CSP 回報格式正規化為單一結構。
 */
function normalize(payload: unknown): NormalizedViolation[] {
  if (Array.isArray(payload)) {
    return payload
      .filter((item): item is CspReportV3 => typeof item === 'object' && item !== null)
      .filter((item) => item.type === 'csp-violation' && item.body)
      .map((item) => ({
        documentUri: item.body?.documentURL,
        directive: item.body?.effectiveDirective ?? item.body?.violatedDirective,
        blockedUri: item.body?.blockedURL,
        sourceFile: item.body?.sourceFile,
        line: item.body?.lineNumber,
      }));
  }

  if (typeof payload === 'object' && payload !== null && 'csp-report' in payload) {
    const r = (payload as CspReportLegacy)['csp-report'];
    if (!r) return [];
    return [
      {
        documentUri: r['document-uri'],
        directive: r['effective-directive'] ?? r['violated-directive'],
        blockedUri: r['blocked-uri'],
        sourceFile: r['source-file'],
        line: r['line-number'],
      },
    ];
  }

  return [];
}
