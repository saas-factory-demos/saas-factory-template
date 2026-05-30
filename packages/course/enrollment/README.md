# @saas-factory/course-enrollment

課程報名與權限模組。

## 功能

- 報名建立（訂單付款後 / 贈送 / 套裝 / 訂閱解鎖 / 企業 / 手動）
- 權限檢查（hasAccess + active 狀態 + 過期判定）
- 套裝一次解鎖多堂課程
- 贈送（記錄 giftFrom）
- 訂閱解鎖（依 includedCourseIds + includedCategoryIds + resolveCourseCategories callback）
- 撤銷（退款 / 違規）
- 列出客戶有效課程
- 過期掃描（sweepExpired）

## 用法

```ts
import { EnrollmentService, InMemoryEnrollmentStore } from '@saas-factory/course-enrollment';

const svc = new EnrollmentService(new InMemoryEnrollmentStore(), {
  resolveCourseCategories: async (tenantId, courseId) => {
    // 接 course/content 取 categoryIds
    return ['design', 'ai'];
  },
});

await svc.enroll({ tenantId: 't1', customerId: 'c1', courseId: 'cr1', source: 'purchase', orderId: 'o1' });
const ok = await svc.hasAccess('t1', 'c1', 'cr1');
```
