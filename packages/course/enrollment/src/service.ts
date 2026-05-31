import type {
  CourseBundle,
  Enrollment,
  EnrollmentSource,
  EnrollmentStatus,
  EnrollmentStore,
  SubscriptionPlan,
} from './types.js';

/** 用來判斷課程是否屬於指定分類（外部注入，避免硬綁 course/content）。 */
export type CourseCategoryResolver = (
  tenantId: string,
  courseId: string,
) => Promise<string[]>;

export interface EnrollmentServiceOptions {
  /** 注入：解析課程的 categoryIds（給訂閱方案 includedCategoryIds 比對用）。 */
  resolveCourseCategories?: CourseCategoryResolver;
}

/** 報名服務：訂單付款 → 建立 enrollment、贈送、套裝、訂閱解鎖、權限檢查。 */
export class EnrollmentService {
  private readonly store: EnrollmentStore;
  private readonly opts: EnrollmentServiceOptions;

  constructor(store: EnrollmentStore, options: EnrollmentServiceOptions = {}) {
    this.store = store;
    this.opts = options;
  }

  private genId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /** 建立報名（若已存在則更新狀態為 active；訂單再次扣款也視為續活）。 */
  async enroll(input: {
    tenantId: string;
    customerId: string;
    courseId: string;
    source: EnrollmentSource;
    orderId?: string;
    giftFrom?: string;
    bundleId?: string;
    expiresAt?: Date;
  }): Promise<Enrollment> {
    const now = new Date();
    const existing = await this.store.findEnrollment(
      input.tenantId,
      input.customerId,
      input.courseId,
    );
    const e: Enrollment = existing
      ? {
          ...existing,
          status: 'active',
          source: input.source,
          orderId: input.orderId ?? existing.orderId,
          giftFrom: input.giftFrom ?? existing.giftFrom,
          bundleId: input.bundleId ?? existing.bundleId,
          expiresAt: input.expiresAt ?? existing.expiresAt,
          updatedAt: now,
        }
      : {
          id: this.genId('enr'),
          tenantId: input.tenantId,
          customerId: input.customerId,
          courseId: input.courseId,
          enrolledAt: now,
          expiresAt: input.expiresAt,
          source: input.source,
          orderId: input.orderId,
          giftFrom: input.giftFrom,
          bundleId: input.bundleId,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };
    return this.store.upsertEnrollment(e);
  }

  /** 套裝一次解鎖多堂。 */
  async enrollBundle(input: {
    tenantId: string;
    customerId: string;
    bundleId: string;
    orderId?: string;
  }): Promise<Enrollment[]> {
    const bundle = await this.store.findBundleById(input.bundleId);
    if (!bundle) throw new Error(`套裝不存在：${input.bundleId}`);
    if (!bundle.enabled) throw new Error('套裝未啟用');
    const out: Enrollment[] = [];
    for (const cid of bundle.courseIds) {
      out.push(
        await this.enroll({
          tenantId: input.tenantId,
          customerId: input.customerId,
          courseId: cid,
          source: 'bundle',
          orderId: input.orderId,
          bundleId: input.bundleId,
        }),
      );
    }
    return out;
  }

  /** 贈送（其他客戶送這位）。 */
  async giftEnroll(input: {
    tenantId: string;
    fromCustomerId: string;
    toCustomerId: string;
    courseId: string;
    orderId?: string;
  }): Promise<Enrollment> {
    return this.enroll({
      tenantId: input.tenantId,
      customerId: input.toCustomerId,
      courseId: input.courseId,
      source: 'gift',
      orderId: input.orderId,
      giftFrom: input.fromCustomerId,
    });
  }

  /** 訂閱期間自動解鎖（每次計費後呼叫，expiresAt=次帳期）。 */
  async unlockBySubscription(input: {
    tenantId: string;
    customerId: string;
    planId: string;
    courseId: string;
    expiresAt: Date;
  }): Promise<Enrollment> {
    const plan = await this.store.findPlanById(input.planId);
    if (!plan) throw new Error(`訂閱方案不存在：${input.planId}`);
    if (!plan.enabled) throw new Error('訂閱方案未啟用');

    const includedDirectly = plan.includedCourseIds.length === 0 || plan.includedCourseIds.includes(input.courseId);
    let allowed = includedDirectly;
    if (!allowed && plan.includedCategoryIds.length > 0 && this.opts.resolveCourseCategories) {
      const cats = await this.opts.resolveCourseCategories(input.tenantId, input.courseId);
      allowed = cats.some((c) => plan.includedCategoryIds.includes(c));
    }
    if (!allowed) {
      throw new Error(`課程不在訂閱方案範圍：${input.courseId}`);
    }
    return this.enroll({
      tenantId: input.tenantId,
      customerId: input.customerId,
      courseId: input.courseId,
      source: 'subscription',
      expiresAt: input.expiresAt,
    });
  }

  /** 撤銷報名（退款 / 違規）。 */
  async revoke(input: {
    tenantId: string;
    customerId: string;
    courseId: string;
  }): Promise<Enrollment | undefined> {
    const e = await this.store.findEnrollment(
      input.tenantId,
      input.customerId,
      input.courseId,
    );
    if (!e) return undefined;
    e.status = 'revoked';
    e.updatedAt = new Date();
    return this.store.upsertEnrollment(e);
  }

  /** 檢查是否有效報名（active 且未過期）。 */
  async hasAccess(
    tenantId: string,
    customerId: string,
    courseId: string,
    now: Date = new Date(),
  ): Promise<boolean> {
    const e = await this.store.findEnrollment(tenantId, customerId, courseId);
    if (!e) return false;
    if (e.status !== 'active') return false;
    if (e.expiresAt && now.getTime() >= e.expiresAt.getTime()) return false;
    return true;
  }

  /** 取出客戶有效課程清單（自動排除過期 / revoked）。 */
  async listActiveCourses(
    tenantId: string,
    customerId: string,
    now: Date = new Date(),
  ): Promise<string[]> {
    const all = await this.store.listByCustomer(tenantId, customerId);
    return all
      .filter((e) => e.status === 'active')
      .filter((e) => !e.expiresAt || e.expiresAt.getTime() > now.getTime())
      .map((e) => e.courseId);
  }

  /** 套裝 / 訂閱方案 CRUD。 */
  async upsertBundle(input: Omit<CourseBundle, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<CourseBundle> {
    const now = new Date();
    const existing = input.id ? await this.store.findBundleById(input.id) : undefined;
    const b: CourseBundle = {
      id: existing?.id ?? this.genId('bnd'),
      tenantId: input.tenantId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      courseIds: input.courseIds,
      price: input.price,
      enabled: input.enabled,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    return this.store.upsertBundle(b);
  }

  async upsertPlan(input: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<SubscriptionPlan> {
    const now = new Date();
    const existing = input.id ? await this.store.findPlanById(input.id) : undefined;
    const p: SubscriptionPlan = {
      id: existing?.id ?? this.genId('pln'),
      tenantId: input.tenantId,
      name: input.name,
      slug: input.slug,
      monthlyPrice: input.monthlyPrice,
      includedCourseIds: input.includedCourseIds,
      includedCategoryIds: input.includedCategoryIds,
      enabled: input.enabled,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    return this.store.upsertPlan(p);
  }

  /** 標記過期（cron 用：掃過期 active → expired）。 */
  async sweepExpired(tenantId: string, now: Date = new Date()): Promise<number> {
    let n = 0;
    const all = await this.store.listAll(tenantId);
    for (const e of all) {
      if (e.status === 'active' && e.expiresAt && e.expiresAt.getTime() <= now.getTime()) {
        e.status = 'expired';
        e.updatedAt = now;
        await this.store.upsertEnrollment(e);
        n += 1;
      }
    }
    return n;
  }

  /** 取目前狀態（給 UI 用）。 */
  describeStatus(e: Enrollment, now: Date = new Date()): EnrollmentStatus {
    if (e.status === 'revoked') return 'revoked';
    if (e.expiresAt && now.getTime() >= e.expiresAt.getTime()) return 'expired';
    return e.status;
  }
}
