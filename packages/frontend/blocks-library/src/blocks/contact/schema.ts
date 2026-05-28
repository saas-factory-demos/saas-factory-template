import { z } from 'zod';

import { motionConfigSchema } from '../_shared/schema-helpers.js';

export const CONTACT_VARIANTS = [
  'form-only',
  'form-with-info',
  'split-with-map',
  'multi-channel',
  'simple-cta-card',
  'office-grid',
] as const;

export type ContactVariant = (typeof CONTACT_VARIANTS)[number];

const contactChannelSchema = z.object({
  type: z.enum(['email', 'phone', 'line', 'address', 'hours']),
  label: z.string().min(1),
  value: z.string().min(1),
  href: z.string().optional(),
});

const officeSchema = z.object({
  city: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export const contactSchema = z.object({
  variant: z.enum(CONTACT_VARIANTS).default('form-with-info'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(160),
  subheadline: z.string().max(280).optional(),
  channels: z.array(contactChannelSchema).max(8).default([]),
  offices: z.array(officeSchema).max(8).default([]),
  formFields: z
    .array(z.enum(['name', 'email', 'phone', 'subject', 'message']))
    .default(['name', 'email', 'message']),
  submitLabel: z.string().default('送出'),
  motion: motionConfigSchema,
});

export type ContactChannel = z.infer<typeof contactChannelSchema>;
export type ContactOffice = z.infer<typeof officeSchema>;
export type ContactProps = z.infer<typeof contactSchema>;

export const contactDefaults: ContactProps = {
  variant: 'form-with-info',
  eyebrow: '聯絡',
  headline: '與我們聯繫',
  subheadline: '工作日 1 個工作天內回覆。',
  channels: [
    { type: 'email', label: 'Email', value: 'hello@brand.tw', href: 'mailto:hello@brand.tw' },
    { type: 'phone', label: '電話', value: '+886 2 1234 5678', href: 'tel:+886212345678' },
    { type: 'hours', label: '營業時間', value: '週一至週五 09:00-18:00' },
  ],
  offices: [
    { city: '台北', address: '台北市信義區市府路 1 號', phone: '+886 2 1234 5678' },
  ],
  formFields: ['name', 'email', 'message'],
  submitLabel: '送出',
  motion: { variant: 'slideUp', delay: 0 },
};
