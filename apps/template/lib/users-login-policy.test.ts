import { describe, expect, it } from 'vitest';

import { evaluateLoginPolicy, evaluateRoleChangePolicy } from './users-login-policy.js';

const NOW = new Date('2026-06-01T00:00:00Z').getTime();

describe('evaluateLoginPolicy', () => {
  describe('factory-support 通道凍結', () => {
    it('factoryAccessDisabledAt 有值 → 拒絕', () => {
      const r = evaluateLoginPolicy(
        { role: 'factory-support', factoryAccessDisabledAt: '2026-05-30T00:00:00Z' },
        { now: NOW },
      );
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBe('support-disabled');
    });

    it('factoryAccessDisabledAt null → 放行', () => {
      const r = evaluateLoginPolicy(
        { role: 'factory-support', factoryAccessDisabledAt: null },
        { now: NOW },
      );
      expect(r.ok).toBe(true);
    });
  });

  describe('99.4-2FA-2 owner / admin 7 天緩衝', () => {
    it('owner 註冊 3 天未啟用 TOTP → 放行（在緩衝內）', () => {
      const createdAt = new Date(NOW - 3 * 86_400_000).toISOString();
      const r = evaluateLoginPolicy(
        { role: 'owner', totpEnabled: false, createdAt },
        { now: NOW },
      );
      expect(r.ok).toBe(true);
    });

    it('owner 註冊 8 天未啟用 TOTP → 鎖帳', () => {
      const createdAt = new Date(NOW - 8 * 86_400_000).toISOString();
      const r = evaluateLoginPolicy(
        { role: 'owner', totpEnabled: false, createdAt },
        { now: NOW },
      );
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.reason).toBe('totp-grace-expired');
        expect(r.message).toContain('7 天');
      }
    });

    it('admin 註冊 30 天 + 已啟用 TOTP → 放行', () => {
      const createdAt = new Date(NOW - 30 * 86_400_000).toISOString();
      const r = evaluateLoginPolicy(
        { role: 'admin', totpEnabled: true, createdAt },
        { now: NOW },
      );
      expect(r.ok).toBe(true);
    });

    it('editor / viewer 不受 7 天規則 → 即使 30 天未開 TOTP 也放行', () => {
      const createdAt = new Date(NOW - 30 * 86_400_000).toISOString();
      for (const role of ['editor', 'viewer'] as const) {
        const r = evaluateLoginPolicy({ role, totpEnabled: false, createdAt }, { now: NOW });
        expect(r.ok).toBe(true);
      }
    });

    it('factory-support 不受 7 天規則（HMAC rotate）→ 30 天未開 TOTP 仍放行', () => {
      const createdAt = new Date(NOW - 30 * 86_400_000).toISOString();
      const r = evaluateLoginPolicy(
        { role: 'factory-support', totpEnabled: false, createdAt },
        { now: NOW },
      );
      expect(r.ok).toBe(true);
    });

    it('可覆寫 gracePeriodDays（例如測試環境設 1 天）', () => {
      const createdAt = new Date(NOW - 2 * 86_400_000).toISOString();
      const r = evaluateLoginPolicy(
        { role: 'owner', totpEnabled: false, createdAt },
        { now: NOW, gracePeriodDays: 1 },
      );
      expect(r.ok).toBe(false);
    });

    it('createdAt 缺失 → 視為 just-created（放行）', () => {
      const r = evaluateLoginPolicy(
        { role: 'owner', totpEnabled: false },
        { now: NOW },
      );
      expect(r.ok).toBe(true);
    });
  });
});

describe('evaluateRoleChangePolicy（ADR-0100 防禦深化）', () => {
  describe('admin-ui 操作', () => {
    it('客戶想新建 role=factory-support → 拒絕', () => {
      const r = evaluateRoleChangePolicy({
        incomingRole: 'factory-support',
        operationContext: 'admin-ui',
      });
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.reason).toBe('forbidden-factory-support-create');
        expect(r.message).toContain('HMAC');
      }
    });

    it('客戶想把現有 editor 改成 factory-support → 拒絕', () => {
      const r = evaluateRoleChangePolicy({
        incomingRole: 'factory-support',
        existingRole: 'editor',
        operationContext: 'admin-ui',
      });
      expect(r.ok).toBe(false);
    });

    it('客戶想手動勾 isFactoryManaged=true（角色仍是 admin）→ 拒絕', () => {
      const r = evaluateRoleChangePolicy({
        incomingRole: 'admin',
        existingRole: 'admin',
        incomingIsFactoryManaged: true,
        operationContext: 'admin-ui',
      });
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.reason).toBe('forbidden-factory-support-create');
        expect(r.message).toContain('isFactoryManaged');
      }
    });

    it('客戶想把 factory-support 改成 owner（降級偷用）→ 拒絕', () => {
      const r = evaluateRoleChangePolicy({
        incomingRole: 'owner',
        existingRole: 'factory-support',
        operationContext: 'admin-ui',
      });
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.reason).toBe('forbidden-role-escalation');
        expect(r.message).toContain('退場流程');
      }
    });

    it('客戶正常改 editor → admin → 放行', () => {
      const r = evaluateRoleChangePolicy({
        incomingRole: 'admin',
        existingRole: 'editor',
        operationContext: 'admin-ui',
      });
      expect(r.ok).toBe(true);
    });

    it('客戶新建 editor 帳號（無 incomingIsFactoryManaged）→ 放行', () => {
      const r = evaluateRoleChangePolicy({
        incomingRole: 'editor',
        operationContext: 'admin-ui',
      });
      expect(r.ok).toBe(true);
    });
  });

  describe('hmac-override / system 操作', () => {
    it('HMAC 路由 overrideAccess 寫入 factory-support → 放行', () => {
      const r = evaluateRoleChangePolicy({
        incomingRole: 'factory-support',
        incomingIsFactoryManaged: true,
        operationContext: 'hmac-override',
      });
      expect(r.ok).toBe(true);
    });

    it('system migration 寫入 factory-support → 放行', () => {
      const r = evaluateRoleChangePolicy({
        incomingRole: 'factory-support',
        operationContext: 'system',
      });
      expect(r.ok).toBe(true);
    });
  });
});
