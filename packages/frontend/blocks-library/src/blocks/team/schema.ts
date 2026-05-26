import { z } from 'zod';

import {
  imageAssetSchema,
  linkItemSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

export const TEAM_VARIANTS = [
  'grid-cards',
  'circle-avatars',
  'detailed-bio',
  'leadership-spotlight',
  'departments-tabs',
  'photo-wall',
] as const;

export type TeamVariant = (typeof TEAM_VARIANTS)[number];

const memberSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  bio: z.string().max(400).optional(),
  photo: imageAssetSchema.optional(),
  socialLinks: z.array(linkItemSchema).max(5).default([]),
  department: z.string().optional(),
});

export const teamSchema = z.object({
  variant: z.enum(TEAM_VARIANTS).default('grid-cards'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().max(160).optional(),
  subheadline: z.string().max(280).optional(),
  members: z.array(memberSchema).min(1).max(24),
  motion: motionConfigSchema,
});

export type TeamMember = z.infer<typeof memberSchema>;
export type TeamProps = z.infer<typeof teamSchema>;

export const teamDefaults: TeamProps = {
  variant: 'grid-cards',
  eyebrow: '團隊',
  headline: '一流的人，做一流的事',
  subheadline: '由經驗豐富的設計師與工程師組成。',
  members: [
    { name: '李執行長', title: '創辦人 / CEO', bio: '十五年產品經驗，前任職於某知名 SaaS 公司。', socialLinks: [], department: 'Leadership' },
    { name: '王設計師', title: '設計總監', bio: '專注於建立可規模化的設計系統。', socialLinks: [], department: 'Design' },
    { name: '陳工程師', title: '技術長', bio: '對開源社群活躍貢獻。', socialLinks: [], department: 'Engineering' },
  ],
  motion: { variant: 'slideUp', delay: 0 },
};
