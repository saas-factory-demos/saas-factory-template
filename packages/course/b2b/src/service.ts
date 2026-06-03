import { randomUUID } from 'node:crypto';

import type {
  B2BAccount,
  B2BLearner,
  B2BStore,
  CsvImportResult,
  CsvLearnerRow,
} from './types.js';

export interface ImportCsvInput {
  tenantId: string;
  b2bAccountId: string;
  rows: CsvLearnerRow[];
  now?: Date;
}

export interface SsoLoginClaims {
  /** SSO 回傳的 email（必填）。 */
  email: string;
  name?: string;
  employeeId?: string;
  department?: string;
}

/** 企業包班 service：席次 / CSV / SSO JIT / HR 報表。 */
export class B2BService {
  constructor(private readonly store: B2BStore) {}

  upsertAccount(account: B2BAccount): Promise<void> {
    return this.store.upsertAccount(account);
  }

  /** 從 CSV 匯入學員（驗 email 格式 + 網域 + 席次 + 去重）。 */
  async importLearnersFromCsv(input: ImportCsvInput): Promise<CsvImportResult> {
    const account = await this.store.getAccount(input.b2bAccountId);
    if (!account) throw new Error('找不到企業帳號');
    if (account.status !== 'active') throw new Error('企業帳號未啟用');
    const now = input.now ?? new Date();
    const result: CsvImportResult = {
      imported: 0,
      skipped: 0,
      skippedReasons: [],
      reachedSeatLimit: false,
    };
    for (const row of input.rows) {
      if (account.seatsUsed >= account.seatsTotal) {
        result.reachedSeatLimit = true;
        result.skipped++;
        result.skippedReasons.push({ email: row.email, reason: '席次已滿' });
        continue;
      }
      const email = row.email.trim().toLowerCase();
      if (!isValidEmail(email)) {
        result.skipped++;
        result.skippedReasons.push({ email, reason: 'email 格式錯誤' });
        continue;
      }
      const domain = email.split('@')[1] ?? '';
      if (!account.domains.includes(domain)) {
        result.skipped++;
        result.skippedReasons.push({ email, reason: `網域不允許（${domain}）` });
        continue;
      }
      const existing = await this.store.findLearnerByEmail(account.id, email);
      if (existing) {
        result.skipped++;
        result.skippedReasons.push({ email, reason: '已存在' });
        continue;
      }
      const learner: B2BLearner = {
        id: randomUUID(),
        tenantId: input.tenantId,
        b2bAccountId: account.id,
        email,
        name: row.name,
        employeeId: row.employeeId,
        department: row.department,
        status: 'active',
        invitedAt: now,
        provisioningSource: 'csv-import',
      };
      await this.store.upsertLearner(learner);
      account.seatsUsed++;
      result.imported++;
    }
    await this.store.upsertAccount(account);
    return result;
  }

  /**
   * SSO Just-In-Time provisioning：SSO 登入回來後若帳號不在 B2BLearner 表內，自動建立。
   *
   * 回傳 (learner, account)。需先用 domain 找出 account。
   */
  async resolveSsoLogin(
    tenantId: string,
    claims: SsoLoginClaims,
    now: Date = new Date(),
  ): Promise<{ learner: B2BLearner; account: B2BAccount }> {
    const email = claims.email.trim().toLowerCase();
    if (!isValidEmail(email)) throw new Error('SSO 回傳 email 格式錯誤');
    const domain = email.split('@')[1] ?? '';
    const account = await this.store.findAccountByDomain(tenantId, domain);
    if (!account) throw new Error(`找不到對應的企業帳號（網域 ${domain}）`);
    if (account.status !== 'active') throw new Error('企業帳號未啟用');
    const existing = await this.store.findLearnerByEmail(account.id, email);
    if (existing) {
      if (existing.status !== 'active') {
        existing.status = 'active';
      }
      if (!existing.activatedAt) existing.activatedAt = now;
      await this.store.upsertLearner(existing);
      return { learner: existing, account };
    }
    if (account.seatsUsed >= account.seatsTotal) {
      throw new Error('企業席次已滿，請聯絡管理員');
    }
    const learner: B2BLearner = {
      id: randomUUID(),
      tenantId,
      b2bAccountId: account.id,
      email,
      name: claims.name,
      employeeId: claims.employeeId,
      department: claims.department,
      status: 'active',
      invitedAt: now,
      activatedAt: now,
      provisioningSource: 'sso-jit',
    };
    account.seatsUsed++;
    await this.store.upsertLearner(learner);
    await this.store.upsertAccount(account);
    return { learner, account };
  }

  /** 學員離職（席次釋出）。 */
  async deactivateLearner(b2bAccountId: string, email: string): Promise<void> {
    const learner = await this.store.findLearnerByEmail(b2bAccountId, email);
    if (!learner) return;
    if (learner.status === 'departed') return;
    learner.status = 'departed';
    await this.store.upsertLearner(learner);
    const account = await this.store.getAccount(b2bAccountId);
    if (account) {
      account.seatsUsed = Math.max(0, account.seatsUsed - 1);
      await this.store.upsertAccount(account);
    }
  }

  /** 列出每位學員的 userId（供外部 enrollment 模組批量 enroll）。 */
  async listLearnerUserIds(b2bAccountId: string): Promise<string[]> {
    const learners = await this.store.listLearners(b2bAccountId);
    return learners
      .filter((l) => l.status === 'active' && l.userId)
      .map((l) => l.userId as string);
  }

  /**
   * HR 報表：依部門統計。
   *
   * progressLookup 由呼叫端注入（讀 course-progress），每位學員 → 完成課數 + 平均完成率（0~100）。
   */
  async generateHrReport(
    b2bAccountId: string,
    progressLookup: (userId: string) => Promise<{ completedCourses: number; avgProgress: number }>,
  ): Promise<{
    totalLearners: number;
    activeLearners: number;
    seatsRemaining: number;
    byDepartment: Array<{
      department: string;
      total: number;
      active: number;
      completedCourses: number;
      avgProgress: number;
    }>;
  }> {
    const account = await this.store.getAccount(b2bAccountId);
    if (!account) throw new Error('找不到企業帳號');
    const learners = await this.store.listLearners(b2bAccountId);
    const buckets = new Map<
      string,
      { total: number; active: number; completedCourses: number; sumProgress: number }
    >();
    for (const l of learners) {
      const dept = l.department ?? '未分類';
      const b = buckets.get(dept) ?? { total: 0, active: 0, completedCourses: 0, sumProgress: 0 };
      b.total++;
      if (l.status === 'active') b.active++;
      if (l.userId) {
        const p = await progressLookup(l.userId);
        b.completedCourses += p.completedCourses;
        b.sumProgress += p.avgProgress;
      }
      buckets.set(dept, b);
    }
    const byDepartment = Array.from(buckets.entries()).map(([department, v]) => ({
      department,
      total: v.total,
      active: v.active,
      completedCourses: v.completedCourses,
      avgProgress: v.total > 0 ? v.sumProgress / v.total : 0,
    }));
    return {
      totalLearners: learners.length,
      activeLearners: learners.filter((l) => l.status === 'active').length,
      seatsRemaining: Math.max(0, account.seatsTotal - account.seatsUsed),
      byDepartment,
    };
  }
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
