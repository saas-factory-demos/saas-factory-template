import { sanitizeHtml } from './sanitize.js';
import { BLOCK_SCHEMAS, type BlockType } from './schemas.js';

/** 區塊驗證結果。 */
export interface BlockValidationResult {
  valid: boolean;
  /** 驗證 + default 套用後的 props。 */
  data?: Record<string, unknown>;
  /** 驗證錯誤訊息（path → msg）。 */
  errors?: Array<{ path: string; message: string }>;
}

/**
 * 對 custom-html / rich-text 等內含 HTML 的 block，跑一次 server-side sanitize。
 *
 * 為何在 validator 而非 renderer：validator 是「儲存前必經」單點，
 * 在這裡 sanitize 確保即使前端某處忘了再 sanitize 一次，DB 也不會落入 XSS payload。
 */
function sanitizeBlockData(type: BlockType, data: Record<string, unknown>): Record<string, unknown> {
  if (type === 'custom-html') {
    const allowScripts = data.allowScripts === true;
    if (!allowScripts && typeof data.html === 'string') {
      return { ...data, html: sanitizeHtml(data.html) };
    }
    return data;
  }
  if (type === 'rich-text') {
    if (data.format === 'html' && typeof data.content === 'string') {
      return { ...data, content: sanitizeHtml(data.content) };
    }
    return data;
  }
  return data;
}

/** 驗證並 fill default 一個區塊的 props。 */
export function validateBlock(type: string, props: unknown): BlockValidationResult {
  const schema = BLOCK_SCHEMAS[type as BlockType];
  if (!schema) {
    return { valid: false, errors: [{ path: 'type', message: `未知區塊類型：${type}` }] };
  }
  const result = schema.safeParse(props);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    };
  }
  const sanitized = sanitizeBlockData(type as BlockType, result.data as Record<string, unknown>);
  return { valid: true, data: sanitized };
}

/** 一次驗證一整頁所有區塊，回傳每個區塊的結果（用於儲存前後台驗證）。 */
export function validateBlocks(
  blocks: Array<{ id: string; type: string; props: unknown }>,
): Array<BlockValidationResult & { id: string }> {
  return blocks.map((b) => ({ id: b.id, ...validateBlock(b.type, b.props) }));
}

/** 列出所有可用區塊類型（給後台「新增區塊」選單）。 */
export function listBlockTypes(): BlockType[] {
  return Object.keys(BLOCK_SCHEMAS) as BlockType[];
}
