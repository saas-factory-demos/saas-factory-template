import type { RecordParams } from './types.js';
import type { Payload } from 'payload';


/**
 * Audit recorder 介面。
 *
 * - 業務模組依賴此介面（不直接綁 Payload）便於測試
 * - 生產用 `PayloadAuditRecorder`；測試用 `InMemoryAuditRecorder`
 */
export interface AuditRecorder {
  record(params: RecordParams): Promise<void>;
}

/**
 * 高敏感欄位 redact 清單。
 *
 * before / after / metadata 中若含這些 key，寫入 audit log 前自動換成 `[REDACTED]`。
 */
const REDACTED_KEYS = new Set([
  'password',
  'passwordHash',
  'apiToken',
  'apiKey',
  'secret',
  'sessionToken',
  'creditCard',
  'cvv',
]);

function redact<T extends Record<string, unknown> | null | undefined>(
  obj: T,
): T {
  if (!obj) {
    return obj;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (REDACTED_KEYS.has(key)) {
      result[key] = '[REDACTED]';
    } else if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      result[key] = redact(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

/**
 * Payload-backed 實作。
 *
 * 直接呼叫 Payload local API 寫入 `audit-logs` collection。
 */
export class PayloadAuditRecorder implements AuditRecorder {
  constructor(private readonly payload: Payload) {}

  async record(params: RecordParams): Promise<void> {
    await this.payload.create({
      collection: 'audit-logs',
      data: {
        ...params,
        before: redact(params.before ?? null) ?? undefined,
        after: redact(params.after ?? null) ?? undefined,
        metadata: redact(params.metadata ?? {}) ?? undefined,
      },
      overrideAccess: true,
    });
  }
}

/**
 * 測試 / dev 用 in-memory 實作。
 */
export class InMemoryAuditRecorder implements AuditRecorder {
  readonly entries: Array<RecordParams & { createdAt: string }> = [];

  record(params: RecordParams): Promise<void> {
    this.entries.push({
      ...params,
      before: redact(params.before ?? null) ?? undefined,
      after: redact(params.after ?? null) ?? undefined,
      metadata: redact(params.metadata ?? {}) ?? undefined,
      createdAt: new Date().toISOString(),
    });
    return Promise.resolve();
  }
}

export { redact as _redactForTest };
