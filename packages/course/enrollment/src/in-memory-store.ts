import type {
  CourseBundle,
  Enrollment,
  EnrollmentStore,
  SubscriptionPlan,
} from './types.js';

/** 記憶體實作。 */
export class InMemoryEnrollmentStore implements EnrollmentStore {
  private readonly enrollments = new Map<string, Enrollment>();
  private readonly bundles = new Map<string, CourseBundle>();
  private readonly plans = new Map<string, SubscriptionPlan>();

  async upsertEnrollment(e: Enrollment): Promise<Enrollment> {
    this.enrollments.set(e.id, e);
    return e;
  }

  async findEnrollment(
    tenantId: string,
    customerId: string,
    courseId: string,
  ): Promise<Enrollment | undefined> {
    for (const e of this.enrollments.values()) {
      if (e.tenantId === tenantId && e.customerId === customerId && e.courseId === courseId) {
        return e;
      }
    }
    return undefined;
  }

  async listByCustomer(tenantId: string, customerId: string): Promise<Enrollment[]> {
    return [...this.enrollments.values()].filter(
      (e) => e.tenantId === tenantId && e.customerId === customerId,
    );
  }

  async listByCourse(tenantId: string, courseId: string): Promise<Enrollment[]> {
    return [...this.enrollments.values()].filter(
      (e) => e.tenantId === tenantId && e.courseId === courseId,
    );
  }

  async listAll(tenantId: string): Promise<Enrollment[]> {
    return [...this.enrollments.values()].filter((e) => e.tenantId === tenantId);
  }

  async upsertBundle(b: CourseBundle): Promise<CourseBundle> {
    this.bundles.set(b.id, b);
    return b;
  }

  async findBundleById(id: string): Promise<CourseBundle | undefined> {
    return this.bundles.get(id);
  }

  async upsertPlan(p: SubscriptionPlan): Promise<SubscriptionPlan> {
    this.plans.set(p.id, p);
    return p;
  }

  async findPlanById(id: string): Promise<SubscriptionPlan | undefined> {
    return this.plans.get(id);
  }
}
