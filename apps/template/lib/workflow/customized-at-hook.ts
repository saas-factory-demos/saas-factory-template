/**
 * workflow-registry beforeChange hook：自動標記 customizedAt。
 *
 * 抽出來純函數方便單測。
 *
 * 行為：
 * - factory HMAC push 帶 req.context.fromFactoryPush=true → 不動 data（seed 不算 customize）
 * - 後台 admin/owner update → 寫入 customizedAt = 現在時間
 * - create operation 不動（factory seed 或客戶自建都允許）
 */
export function markCustomizedAtBeforeChange(input: {
  data: Record<string, unknown> | undefined;
  operation: 'create' | 'update';
  fromFactoryPush: boolean;
  now?: () => Date;
}): Record<string, unknown> | undefined {
  const { data, operation, fromFactoryPush } = input;
  if (fromFactoryPush) return data;
  if (operation !== 'update' || !data) return data;
  const now = (input.now ?? (() => new Date()))();
  return { ...data, customizedAt: now.toISOString() };
}
