import type { CollectionConfig } from 'payload';

/**
 * Factory Support Logs — 工廠端維修存取稽核紀錄。
 *
 * 對應 ADR-0100 / goal-11「C 稽核策略」：每次工廠端對客戶站執行維護動作
 * （provision / rotate-password / disable / enable / login / manual-action）
 * 都寫一筆，給月報 + 法律自證使用。
 *
 * 設計：
 * - read：owner / admin / factory-support 可讀
 * - create：只允許 factory-support 透過 HMAC 端點寫入（API route 內 override）
 * - update / delete：所有角色都禁止（不可竄改稽核軌跡）
 * - timestamp 加 index 讓月報查詢快
 *
 * 不可改的契約：slug = 'factory-support-logs'。
 */
export const FactorySupportLogs: CollectionConfig = {
  slug: 'factory-support-logs',
  labels: {
    singular: 'Factory 維修存取紀錄',
    plural: 'Factory 維修存取紀錄',
  },
  admin: {
    useAsTitle: 'payloadSummary',
    defaultColumns: ['action', 'actorEmail', 'payloadSummary', 'timestamp'],
    description:
      '工廠端維修存取的完整稽核紀錄。任何角色都不可修改 / 刪除，只可讀取。詳見 ADR-0100。',
  },
  access: {
    read: ({ req }) => {
      const role = req.user?.role;
      return role === 'owner' || role === 'admin' || role === 'factory-support';
    },
    // create 只允許 HMAC route 內以 overrideAccess: true 寫入；其他途徑全禁
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Provision（建立服務帳號）', value: 'provision' },
        { label: 'Rotate Password（重設密碼）', value: 'rotate-password' },
        { label: 'Disable（客戶請求停用）', value: 'disable' },
        { label: 'Enable（恢復啟用）', value: 'enable' },
        { label: 'Status（查狀態）', value: 'status' },
        { label: 'Login（factory-support 登入）', value: 'login' },
        { label: 'Manual Action（手動維護操作）', value: 'manual-action' },
      ],
    },
    {
      name: 'actorEmail',
      type: 'text',
      required: true,
      admin: { description: 'Factory 端操作者 email（個人，非服務帳號）' },
    },
    {
      name: 'clientIp',
      type: 'text',
      admin: { description: '請求來源 IP（IPv4 保留 /24，IPv6 保留 /48）' },
    },
    {
      name: 'userAgent',
      type: 'text',
    },
    {
      name: 'payloadSummary',
      type: 'textarea',
      required: true,
      admin: { description: '操作摘要，例：「協助修復結帳流程」「重設 admin 密碼」' },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: '操作時間（給月度統計用，建立後不可改）',
      },
    },
    {
      name: 'relatedUserId',
      type: 'relationship',
      relationTo: 'users',
      admin: { description: '受影響的客戶站使用者（若有）' },
    },
  ],
  timestamps: true,
};
