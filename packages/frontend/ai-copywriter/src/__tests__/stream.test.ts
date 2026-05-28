import { describe, expect, it } from 'vitest';

import { parseAnthropicStream, type AnthropicStreamEvent } from '../stream.js';

/** 從字串建立 Uint8Array ReadableStream（單一 chunk）。 */
function stringToStream(s: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(s));
      controller.close();
    },
  });
}

/** 把字串拆成 N chunk 模擬真實 SSE（驗證 buffer 切割正確）。 */
function stringToChunkedStream(s: string, chunkSize: number): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index >= s.length) {
        controller.close();
        return;
      }
      const slice = s.slice(index, index + chunkSize);
      controller.enqueue(encoder.encode(slice));
      index += chunkSize;
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<AnthropicStreamEvent[]> {
  const events: AnthropicStreamEvent[] = [];
  for await (const event of parseAnthropicStream(stream)) {
    events.push(event);
  }
  return events;
}

describe('parseAnthropicStream', () => {
  it('content_block_delta → 產 text event', async () => {
    const sse =
      'event: content_block_delta\n' +
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hello"}}\n\n';
    const events = await collect(stringToStream(sse));
    expect(events).toEqual([{ type: 'text', text: 'Hello' }]);
  });

  it('連續多個 delta → 多個 text event', async () => {
    const sse =
      'event: content_block_delta\n' +
      'data: {"type":"content_block_delta","delta":{"text":"嗨"}}\n\n' +
      'event: content_block_delta\n' +
      'data: {"type":"content_block_delta","delta":{"text":"，"}}\n\n' +
      'event: content_block_delta\n' +
      'data: {"type":"content_block_delta","delta":{"text":"世界"}}\n\n';
    const events = await collect(stringToStream(sse));
    expect(events.map((e) => ('text' in e ? e.text : ''))).toEqual(['嗨', '，', '世界']);
  });

  it('message_delta with usage → 產 usage event', async () => {
    const sse =
      'event: message_delta\n' +
      'data: {"type":"message_delta","usage":{"input_tokens":120,"output_tokens":50}}\n\n';
    const events = await collect(stringToStream(sse));
    expect(events).toEqual([{ type: 'usage', inputTokens: 120, outputTokens: 50 }]);
  });

  it('error event → 產 error event', async () => {
    const sse =
      'event: error\n' +
      'data: {"type":"error","error":{"type":"overloaded","message":"伺服器忙線"}}\n\n';
    const events = await collect(stringToStream(sse));
    expect(events).toEqual([{ type: 'error', message: '伺服器忙線' }]);
  });

  it('其他事件（message_start / ping 等）→ 不產任何 event', async () => {
    const sse =
      'event: message_start\n' +
      'data: {"type":"message_start","message":{"id":"msg_1"}}\n\n' +
      'event: ping\n' +
      'data: {"type":"ping"}\n\n';
    const events = await collect(stringToStream(sse));
    expect(events).toEqual([]);
  });

  it('小 chunk 拆分 → 仍能正確跨 chunk 解析事件', async () => {
    const sse =
      'event: content_block_delta\n' +
      'data: {"type":"content_block_delta","delta":{"text":"chunky"}}\n\n';
    // 每 5 byte 一個 chunk，故意切到事件中間
    const events = await collect(stringToChunkedStream(sse, 5));
    expect(events).toEqual([{ type: 'text', text: 'chunky' }]);
  });

  it('完整 conversation → text + usage 都正確產出', async () => {
    const sse =
      'event: message_start\n' +
      'data: {"type":"message_start"}\n\n' +
      'event: content_block_delta\n' +
      'data: {"type":"content_block_delta","delta":{"text":"AI "}}\n\n' +
      'event: content_block_delta\n' +
      'data: {"type":"content_block_delta","delta":{"text":"回應"}}\n\n' +
      'event: message_delta\n' +
      'data: {"type":"message_delta","usage":{"input_tokens":80,"output_tokens":20}}\n\n' +
      'event: message_stop\n' +
      'data: {"type":"message_stop"}\n\n';
    const events = await collect(stringToStream(sse));
    expect(events).toEqual([
      { type: 'text', text: 'AI ' },
      { type: 'text', text: '回應' },
      { type: 'usage', inputTokens: 80, outputTokens: 20 },
    ]);
  });

  it('非法 JSON data → 安全忽略不 throw', async () => {
    const sse =
      'event: content_block_delta\n' +
      'data: not-valid-json\n\n' +
      'event: content_block_delta\n' +
      'data: {"type":"content_block_delta","delta":{"text":"ok"}}\n\n';
    const events = await collect(stringToStream(sse));
    expect(events).toEqual([{ type: 'text', text: 'ok' }]);
  });
});
