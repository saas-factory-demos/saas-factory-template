import { markCustomizedAtBeforeChange } from '../lib/workflow/customized-at-hook.js';

import type { CollectionConfig } from 'payload';

/**
 * WorkflowRegistry collection — workflow 定義主表（template 客戶站擁有）。
 *
 * 演進歷史：
 * - 早期模型：factory 端設計 → HMAC push 到此 collection（client read-only）
 * - 現行模型（plan C / B 買斷）：factory 只在 project generate 時 seed 一次；
 *   之後客戶在 template 後台自主編 workflow。factory 不再 ongoing push。
 *
 * 為何保留 collection slug：避免 Payload 重命名要的資料 migration + 對外 endpoint
 * 路徑改動。語義改變但骨架不動。
 *
 * 為何 nodes/edges 用 json 不 normalize：執行端拿到後丟給 scheduler 即用，
 * normalize 進 row 反而兩端 schema 漂移風險。
 *
 * 為何 (workflowId, version) 不做唯一鍵：保留多版本共存能力；當前生效版本由
 * activeVersion 標記。客戶自行編輯時通常只動 activeVersion=true 那筆。
 *
 * customizedAt 鎖：客戶在後台改過後 customizedAt 被寫入，後續 factory push 會
 * skip 不覆蓋（seed-only 保護），避免客戶心血被 factory 自動同步刷掉。
 */
export const WorkflowRegistry: CollectionConfig = {
  slug: 'workflow-registry',
  admin: {
    useAsTitle: 'workflowId',
    description: 'Workflow 定義主表。Factory generate 時 seed 初始版本，之後客戶自行編輯。',
    defaultColumns: ['workflowId', 'version', 'activeVersion', 'customizedAt', 'updatedAt'],
  },
  access: {
    // 後台 owner / admin 可看 + CRUD（plan C：客戶自主編輯）
    // Factory HMAC push 走 /api/workflows/registry，內部用 overrideAccess: true 繞過
    read: ({ req }) => {
      const role = (req.user as { role?: string } | null)?.role;
      return role === 'owner' || role === 'admin';
    },
    create: ({ req }) => {
      const role = (req.user as { role?: string } | null)?.role;
      return role === 'owner' || role === 'admin';
    },
    update: ({ req }) => {
      const role = (req.user as { role?: string } | null)?.role;
      return role === 'owner' || role === 'admin';
    },
    delete: ({ req }) => {
      const role = (req.user as { role?: string } | null)?.role;
      return role === 'owner';
    },
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        const ctx = (req as { context?: { fromFactoryPush?: boolean } }).context;
        return markCustomizedAtBeforeChange({
          data: data as Record<string, unknown> | undefined,
          operation,
          fromFactoryPush: ctx?.fromFactoryPush === true,
        });
      },
    ],
  },
  fields: [
    {
      name: 'workflowId',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'apps/factory 端 factory_workflows.id' },
    },
    {
      name: 'projectId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'version',
      type: 'text',
      required: true,
      admin: { description: '版本識別（ISO timestamp 或 hash）' },
    },
    {
      name: 'activeVersion',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: '是否為當前生效版本（同 workflowId 應僅一筆為 true）' },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Archived', value: 'archived' },
      ],
      required: true,
    },
    {
      name: 'nodes',
      type: 'json',
      required: true,
    },
    {
      name: 'edges',
      type: 'json',
      required: true,
    },
    {
      name: 'pushedAt',
      type: 'date',
      required: true,
      admin: { description: '本筆從 factory 推來的時間（factory updatedAt）' },
    },
    {
      name: 'customizedAt',
      type: 'date',
      admin: {
        description:
          '客戶在後台改過的時間。一旦寫入，factory push 會 skip 此 workflowId 不覆蓋（seed-only 保護）。',
      },
    },
  ],
  timestamps: true,
};
