import type { CollectionConfig } from 'payload';

/**
 * `AuditLogs` collection 設定。
 *
 * 設計重點：
 * - append-only：所有人（含 owner）都不可 update / delete
 * - admin UI 提供查詢介面（read 全開給 owner / admin）
 * - 全域 collection（不 tenant-scoped），但 `tenantId` 仍寫入便於過濾
 */
export const AuditLogsCollection: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'action',
    defaultColumns: [
      'action',
      'resourceType',
      'resourceId',
      'userId',
      'tenantId',
      'crossTenant',
      'createdAt',
    ],
    description:
      'Append-only 操作審計紀錄。任何敏感操作（退款、跨 tenant、權限變更）一律寫入此 collection。',
  },
  access: {
    read: ({ req }) => {
      const role = (req.user?.role as string | undefined) ?? '';
      return role === 'owner' || role === 'admin';
    },
    create: () => true,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'userId',
      type: 'text',
      index: true,
      admin: { description: '操作者；系統觸發時為空' },
    },
    {
      name: 'tenantId',
      type: 'text',
      index: true,
      admin: { description: '操作所屬 tenant；全域操作為空' },
    },
    { name: 'action', type: 'text', required: true, index: true },
    { name: 'resourceType', type: 'text', required: true, index: true },
    { name: 'resourceId', type: 'text', required: true, index: true },
    { name: 'before', type: 'json' },
    { name: 'after', type: 'json' },
    { name: 'metadata', type: 'json' },
    {
      name: 'crossTenant',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { description: '跨 tenant 操作（bypassTenant: true）' },
    },
    { name: 'ip', type: 'text' },
    { name: 'userAgent', type: 'text' },
  ],
  timestamps: true,
};
