import { describe, expect, it } from 'vitest';

import {
  signWorkflowRuntimeBody,
  verifyWorkflowRuntimeSignature,
} from './workflow-runtime-hmac';

const SECRET = 'test-runtime-secret';

describe('workflow runtime HMAC', () => {
  it('sign + verify round-trip', () => {
    const body = '{"hello":"world"}';
    const sig = signWorkflowRuntimeBody(SECRET, body);
    expect(verifyWorkflowRuntimeSignature(SECRET, body, sig)).toBe(true);
  });

  it('sign 缺 secret 直接 throw（fail-closed）', () => {
    expect(() => signWorkflowRuntimeBody('', '{}')).toThrow();
  });

  it('verify 缺 secret 回 false', () => {
    expect(verifyWorkflowRuntimeSignature('', '{}', 'abcd')).toBe(false);
  });

  it('body 被竄改 → 拒絕', () => {
    const body = '{"hello":"world"}';
    const sig = signWorkflowRuntimeBody(SECRET, body);
    expect(verifyWorkflowRuntimeSignature(SECRET, '{"hello":"evil"}', sig)).toBe(false);
  });

  it('簽章被竄改 → 拒絕', () => {
    const body = '{"hello":"world"}';
    expect(verifyWorkflowRuntimeSignature(SECRET, body, 'deadbeef'.repeat(8))).toBe(false);
  });

  it('非 hex 字串 → 拒絕（防 base64 等格式注入）', () => {
    expect(verifyWorkflowRuntimeSignature(SECRET, '{}', 'not-hex-!!!')).toBe(false);
  });

  it('簽章大小寫不影響（hex case-insensitive）', () => {
    const body = '{"a":1}';
    const sig = signWorkflowRuntimeBody(SECRET, body);
    expect(verifyWorkflowRuntimeSignature(SECRET, body, sig.toUpperCase())).toBe(true);
  });

  it('簽章長度錯誤（非 64）→ 拒絕', () => {
    expect(verifyWorkflowRuntimeSignature(SECRET, '{}', 'abc')).toBe(false);
  });
});
