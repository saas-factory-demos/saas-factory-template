/**
 * Anthropic Messages API streaming 解析器。
 *
 * 對應 09j-hardening-report.md「streaming 版本（generateCopyStream）仍未實作」TODO。
 *
 * Anthropic SSE 事件格式：
 *   event: <name>\n
 *   data: <json>\n\n
 *
 * 關注的事件：
 * - `content_block_delta`：每個 text chunk（`.delta.text`）
 * - `message_delta`：含最終 `.usage`，用於 budget recordActual
 *
 * 其他事件（message_start / content_block_start / content_block_stop / message_stop /
 * ping）讀過跳過。
 */

/** Stream parser 回傳的事件聯集。 */
export type AnthropicStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'usage'; inputTokens: number; outputTokens: number }
  | { type: 'error'; message: string };

interface ContentBlockDelta {
  type: 'content_block_delta';
  delta?: { type?: string; text?: string };
}

interface MessageDeltaEvent {
  type: 'message_delta';
  usage?: { input_tokens?: number; output_tokens?: number };
}

interface ErrorEvent {
  type: 'error';
  error?: { type?: string; message?: string };
}

/**
 * 把 Anthropic SSE ReadableStream 拆成事件流。
 *
 * 為何用 AsyncGenerator：caller 可以用 `for await` 把每個 chunk 即時推出去
 * （Server-Sent Events / Next.js streaming Response），不必等全部 buffer 完。
 */
export async function* parseAnthropicStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<AnthropicStreamEvent, void, void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE 事件以 \n\n 分隔
      let separatorIndex = buffer.indexOf('\n\n');
      while (separatorIndex !== -1) {
        const rawEvent = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex + 2);
        const parsed = parseSseEvent(rawEvent);
        if (parsed) yield parsed;
        separatorIndex = buffer.indexOf('\n\n');
      }
    }
    // flush 最後 chunk（伺服器若沒以 \n\n 結束）
    if (buffer.trim().length > 0) {
      const parsed = parseSseEvent(buffer);
      if (parsed) yield parsed;
    }
  } finally {
    reader.releaseLock();
  }
}

/** 解一個 SSE 事件字串（已去尾 \n\n）。 */
function parseSseEvent(raw: string): AnthropicStreamEvent | null {
  const lines = raw.split('\n');
  let data = '';
  for (const line of lines) {
    if (line.startsWith('data:')) {
      data += line.slice(5).trim();
    }
  }
  if (data.length === 0) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as { type?: string };

  switch (obj.type) {
    case 'content_block_delta': {
      const e = parsed as ContentBlockDelta;
      const text = e.delta?.text;
      if (typeof text === 'string' && text.length > 0) {
        return { type: 'text', text };
      }
      return null;
    }
    case 'message_delta': {
      const e = parsed as MessageDeltaEvent;
      const u = e.usage;
      if (u && (typeof u.input_tokens === 'number' || typeof u.output_tokens === 'number')) {
        return {
          type: 'usage',
          inputTokens: u.input_tokens ?? 0,
          outputTokens: u.output_tokens ?? 0,
        };
      }
      return null;
    }
    case 'error': {
      const e = parsed as ErrorEvent;
      return {
        type: 'error',
        message: e.error?.message ?? 'unknown stream error',
      };
    }
    default:
      // 未感興趣的事件（message_start / content_block_start / ping 等）
      return null;
  }
}
