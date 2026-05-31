import type { CollectionConfig } from 'payload';

/**
 * WorkflowExecutions collection（Hybrid 持久化策略 template 半邊）。
 *
 * 對應 apps/factory 端 factory_workflows（定義）：本 collection 存
 * **runtime 執行紀錄**——每次 workflow 觸發產一筆，含節點執行軌跡、輸入 context、
 * 錯誤、耗時。資料主權留客戶（template Postgres），符合 B 買斷模型。
 *
 * 為何放 template 不放 factory：
 * - 客戶的 customer / event / order 資料都在 template Postgres，runtime 寫入近資料才有效
 * - factory 看不到也不該看到客戶實際運行資料（隱私 / 隔離）
 * - 客戶自己要做 audit / debug 流程時直接看後台
 *
 * 為何不用關聯 collection：workflowId 指向 factory_workflows.id（**跨 app**），
 * 無法做 Payload relationship；改成 text + 自行維護一致性。
 */
export const WorkflowExecutions: CollectionConfig = {
  slug: 'workflow-executions',
  admin: {
    useAsTitle: 'workflowId',
    description: 'Workflow 執行紀錄。對應 apps/factory 端 factory_workflows 定義。',
    defaultColumns: ['workflowId', 'status', 'startedAt', 'completedAt'],
  },
  access: {
    // 後台 owner / admin 可看，runtime 寫入透過 API token（factory 與 template 共用 secret）
    read: ({ req }) => {
      const role = (req.user as { role?: string } | null)?.role;
      return role === 'owner' || role === 'admin';
    },
    create: () => false, // 僅 API endpoint（用 token）能建，後台不開放
    update: ({ req }) => {
      const role = (req.user as { role?: string } | null)?.role;
      return role === 'owner' || role === 'admin';
    },
    delete: ({ req }) => {
      const role = (req.user as { role?: string } | null)?.role;
      return role === 'owner';
    },
  },
  fields: [
    {
      name: 'workflowId',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'apps/factory 端 factory_workflows.id（跨 app reference）' },
    },
    {
      name: 'projectId',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'apps/factory 端 factory_projects.id' },
    },
    {
      name: 'workflowVersion',
      type: 'text',
      admin: { description: '對應 workflow 版本（factory updatedAt ISO 字串或 hash）' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Queued', value: 'queued' },
        { label: 'Running', value: 'running' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'queued',
    },
    {
      name: 'triggerKind',
      type: 'select',
      options: [
        { label: 'Signup', value: 'signup' },
        { label: 'Tag added', value: 'tag-added' },
        { label: 'Tag removed', value: 'tag-removed' },
        { label: 'Page viewed', value: 'page-viewed' },
        { label: 'Form submitted', value: 'form-submitted' },
        { label: 'Order placed', value: 'order-placed' },
        { label: 'Manual', value: 'manual' },
      ],
      admin: { description: '觸發 workflow 的事件類型' },
    },
    {
      name: 'context',
      type: 'json',
      admin: {
        description: '渲染模板用的變數快照（customer / event / now / tenant 等）',
      },
    },
    {
      name: 'nodeStates',
      type: 'json',
      admin: {
        description:
          '節點執行軌跡：[{ nodeId, status, startedAt, completedAt, output, error }]',
      },
    },
    {
      name: 'currentNodeId',
      type: 'text',
      admin: { description: '當前執行到的節點 id（running 狀態用）' },
    },
    {
      name: 'error',
      type: 'json',
      admin: { description: '失敗時的錯誤詳細（message / stack / nodeId）' },
    },
    {
      name: 'startedAt',
      type: 'date',
      required: true,
      admin: { description: '排入佇列時間' },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: { description: '完成 / 失敗 / 取消時間' },
    },
    {
      name: 'durationMs',
      type: 'number',
      admin: { description: '總執行時長（毫秒），完成時計算寫入' },
    },
  ],
  timestamps: true,
};
