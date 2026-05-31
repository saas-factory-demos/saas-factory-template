/** 報名來源。 */
export type EnrollmentSource =
  | 'purchase'
  | 'gift'
  | 'subscription'
  | 'enterprise'
  | 'manual'
  | 'bundle';

/** 報名狀態。 */
export type EnrollmentStatus = 'active' | 'expired' | 'revoked';

/** 課程報名。 */
export interface Enrollment {
  id: string;
  tenantId: string;
  customerId: string;
  courseId: string;
  enrolledAt: Date;
  expiresAt?: Date;
  source: EnrollmentSource;
  orderId?: string;
  /** 贈送來源（gift / source=gift 時使用）。 */
  giftFrom?: string;
  /** 套裝 id（source=bundle）。 */
  bundleId?: string;
  status: EnrollmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** 課程套裝（一張訂單解多堂）。 */
export interface CourseBundle {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  courseIds: string[];
  price: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** 訂閱方案（吃到飽）。 */
export interface SubscriptionPlan {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  /** 月費。 */
  monthlyPrice: number;
  /** 包含的課程 ids（空陣列 = 全站）。 */
  includedCourseIds: string[];
  /** 課程分類 ids（額外篩選）。 */
  includedCategoryIds: string[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrollmentStore {
  upsertEnrollment(e: Enrollment): Promise<Enrollment>;
  findEnrollment(tenantId: string, customerId: string, courseId: string): Promise<Enrollment | undefined>;
  listByCustomer(tenantId: string, customerId: string): Promise<Enrollment[]>;
  listByCourse(tenantId: string, courseId: string): Promise<Enrollment[]>;
  listAll(tenantId: string): Promise<Enrollment[]>;

  upsertBundle(b: CourseBundle): Promise<CourseBundle>;
  findBundleById(id: string): Promise<CourseBundle | undefined>;

  upsertPlan(p: SubscriptionPlan): Promise<SubscriptionPlan>;
  findPlanById(id: string): Promise<SubscriptionPlan | undefined>;
}
