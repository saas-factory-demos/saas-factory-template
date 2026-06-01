import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  buildScriptSrc,
  generateCspNonce,
  isStrictDynamicReportingEnabled,
} from './csp-nonce.js';

describe('generateCspNonce', () => {
  it('產出 base64url 字串（無 = / + 字元）', () => {
    const nonce = generateCspNonce();
    expect(nonce).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(nonce).not.toContain('=');
    expect(nonce).not.toContain('+');
    expect(nonce).not.toContain('/');
  });

  it('長度足夠（>= 16 字元，對應 128 bit 熵）', () => {
    const nonce = generateCspNonce();
    expect(nonce.length).toBeGreaterThanOrEqual(16);
  });

  it('連續產 100 個全部不同（熵足夠）', () => {
    const set = new Set<string>();
    for (let i = 0; i < 100; i += 1) set.add(generateCspNonce());
    expect(set.size).toBe(100);
  });
});

describe('isStrictDynamicReportingEnabled', () => {
  const originalValue = process.env.CSP_STRICT_DYNAMIC_REPORT_ONLY;
  beforeEach(() => {
    delete process.env.CSP_STRICT_DYNAMIC_REPORT_ONLY;
  });
  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.CSP_STRICT_DYNAMIC_REPORT_ONLY;
    } else {
      process.env.CSP_STRICT_DYNAMIC_REPORT_ONLY = originalValue;
    }
  });

  it('預設 → false', () => {
    expect(isStrictDynamicReportingEnabled()).toBe(false);
  });

  it('CSP_STRICT_DYNAMIC_REPORT_ONLY=true → true', () => {
    process.env.CSP_STRICT_DYNAMIC_REPORT_ONLY = 'true';
    expect(isStrictDynamicReportingEnabled()).toBe(true);
  });

  it('其他字串值（"yes" / "1"）→ false（嚴格只認 "true"）', () => {
    process.env.CSP_STRICT_DYNAMIC_REPORT_ONLY = 'yes';
    expect(isStrictDynamicReportingEnabled()).toBe(false);
    process.env.CSP_STRICT_DYNAMIC_REPORT_ONLY = '1';
    expect(isStrictDynamicReportingEnabled()).toBe(false);
  });
});

describe('buildScriptSrc', () => {
  const originalValue = process.env.CSP_STRICT_DYNAMIC_REPORT_ONLY;
  beforeEach(() => {
    delete process.env.CSP_STRICT_DYNAMIC_REPORT_ONLY;
  });
  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.CSP_STRICT_DYNAMIC_REPORT_ONLY;
    } else {
      process.env.CSP_STRICT_DYNAMIC_REPORT_ONLY = originalValue;
    }
  });

  const HOSTS = ['https://www.googletagmanager.com', 'https://connect.facebook.net'];

  it('CSP-1 預設 → unsafe-inline + unsafe-eval + hosts', () => {
    const src = buildScriptSrc({ hosts: HOSTS });
    expect(src).toEqual([
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://www.googletagmanager.com',
      'https://connect.facebook.net',
    ]);
  });

  it('沒設 strict-dynamic env 即使傳 nonce → 仍走 CSP-1', () => {
    const src = buildScriptSrc({ hosts: HOSTS, nonce: 'abc123' });
    expect(src).toContain("'unsafe-eval'");
    expect(src.join(' ')).not.toContain('strict-dynamic');
  });

  it('啟用 strict-dynamic + nonce → strict-dynamic + nonce + unsafe-inline + hosts，去掉 unsafe-eval', () => {
    process.env.CSP_STRICT_DYNAMIC_REPORT_ONLY = 'true';
    const src = buildScriptSrc({ hosts: HOSTS, nonce: 'abc123' });
    expect(src).toContain("'strict-dynamic'");
    expect(src).toContain("'nonce-abc123'");
    expect(src).toContain("'unsafe-inline'"); // 舊瀏覽器 fallback
    expect(src).not.toContain("'unsafe-eval'"); // 收緊
    expect(src).toContain('https://www.googletagmanager.com');
  });

  it('啟用 strict-dynamic 但沒給 nonce → 仍走 CSP-1（nonce 不存在無意義）', () => {
    process.env.CSP_STRICT_DYNAMIC_REPORT_ONLY = 'true';
    const src = buildScriptSrc({ hosts: HOSTS });
    expect(src.join(' ')).not.toContain('strict-dynamic');
    expect(src).toContain("'unsafe-eval'");
  });
});
