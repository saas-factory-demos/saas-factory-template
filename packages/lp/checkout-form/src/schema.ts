import { z } from 'zod';

/** 提交表單 Zod schema。前端可直接拿來驗證、後端二次驗證防偽。 */
export const LpFormPayloadSchema = z.object({
  tenantId: z.string().min(1),
  pageId: z.string().min(1),
  planId: z.string().min(1),
  paymentMethod: z.enum(['credit-card', 'cod', 'line-pay', 'jko-pay']),
  customer: z.object({
    name: z.string().min(1, '請填寫姓名'),
    phone: z
      .string()
      .regex(/^09\d{8}$/u, '請填寫正確的手機號碼'),
    email: z.string().email().optional(),
  }),
  shipping: z
    .object({
      zip: z.string().min(3),
      city: z.string().min(1),
      district: z.string().min(1),
      street: z.string().min(1),
    })
    .optional(),
  invoice: z
    .object({
      type: z.enum(['individual', 'donation', 'company']),
      code: z.string().optional(),
      title: z.string().optional(),
    })
    .optional(),
  orderBumpAccepted: z.boolean().optional(),
  couponCode: z.string().optional(),
  otpCode: z.string().regex(/^\d{6}$/u).optional(),
});

export type LpFormPayloadInput = z.infer<typeof LpFormPayloadSchema>;
