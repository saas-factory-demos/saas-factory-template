import type {
  PointEntryStore,
  RedemptionStore,
  RewardItemStore,
} from './in-memory-store.js';
import type { PointEntry, Redemption, RewardItem } from './types.js';

export interface RedeemDeps {
  entries: PointEntryStore;
  rewards: RewardItemStore;
  redemptions: RedemptionStore;
  issueReward: (input: {
    tenantId: string;
    customerId: string;
    reward: RewardItem;
  }) => Promise<{ ok: true; issuedCode: string } | { ok: false; error: string }>;
  now: () => Date;
  genId: (prefix: string) => string;
  getBalance: (tenantId: string, customerId: string) => Promise<{ available: number }>;
}

/** 執行兌換流程：驗證 → FIFO 消耗 → 寫 ledger → 呼叫 issueReward → 成敗處理。 */
export async function executeRedeem(
  deps: RedeemDeps,
  input: { tenantId: string; customerId: string; rewardId: string },
): Promise<Redemption> {
  const reward = await deps.rewards.findById(input.rewardId);
  if (!reward) throw new Error(`找不到 reward：${input.rewardId}`);
  if (reward.tenantId !== input.tenantId) throw new Error('reward 與 tenant 不符');
  if (reward.status !== 'active') throw new Error(`reward 狀態錯誤：${reward.status}`);
  if (reward.stock !== undefined && reward.stock <= 0) throw new Error('reward 庫存不足');
  const bal = await deps.getBalance(input.tenantId, input.customerId);
  if (bal.available < reward.costPoints) throw new Error('點數不足');

  // FIFO 消耗
  let toConsume = reward.costPoints;
  const earnList = await deps.entries.listEarnAvailable(input.tenantId, input.customerId);
  for (const e of earnList) {
    if (toConsume <= 0) break;
    const left = e.points - e.consumed;
    const take = Math.min(left, toConsume);
    await deps.entries.update({ ...e, consumed: e.consumed + take });
    toConsume -= take;
  }
  if (toConsume > 0) throw new Error('消耗失敗（餘額不一致）');

  // 寫 redeem ledger 條目
  const ledger: PointEntry = {
    id: deps.genId('pe'),
    tenantId: input.tenantId,
    customerId: input.customerId,
    kind: 'redeem',
    points: -reward.costPoints,
    sourceId: reward.id,
    consumed: 0,
    expired: false,
    createdAt: deps.now(),
  };
  await deps.entries.insert(ledger);

  // 建立 redemption + 呼叫 issueReward
  const redemption: Redemption = {
    id: deps.genId('rd'),
    tenantId: input.tenantId,
    customerId: input.customerId,
    rewardId: reward.id,
    costPoints: reward.costPoints,
    status: 'pending',
    createdAt: deps.now(),
  };
  await deps.redemptions.insert(redemption);

  const result = await deps.issueReward({
    tenantId: input.tenantId,
    customerId: input.customerId,
    reward,
  });
  let finalRedemption: Redemption;
  if (result.ok) {
    finalRedemption = { ...redemption, status: 'issued', issuedCode: result.issuedCode };
    if (reward.stock !== undefined) {
      await deps.rewards.update({ ...reward, stock: reward.stock - 1 });
    }
  } else {
    // 失敗：回退 ledger（補一筆 adjust）
    const refund: PointEntry = {
      id: deps.genId('pe'),
      tenantId: input.tenantId,
      customerId: input.customerId,
      kind: 'adjust',
      points: reward.costPoints,
      sourceId: redemption.id,
      consumed: 0,
      expired: false,
      note: `兌換失敗回補：${result.error}`,
      createdAt: deps.now(),
    };
    await deps.entries.insert(refund);
    finalRedemption = { ...redemption, status: 'cancelled' };
  }
  await deps.redemptions.update(finalRedemption);
  return finalRedemption;
}
