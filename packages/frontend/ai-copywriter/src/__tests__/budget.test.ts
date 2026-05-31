import { describe, expect, it } from 'vitest';

import {
  BudgetTracker,
  FALLBACK_PRICING,
  MODEL_PRICING,
  estimateCostUsd,
  estimateTokens,
  getModelPricing,
} from '../budget.js';
import { BudgetExceededError } from '../errors.js';

describe('budget', () => {
  it('已知 model 用對應費率，未知 model 用 fallback', () => {
    expect(getModelPricing('claude-opus-4-6')).toEqual(MODEL_PRICING['claude-opus-4-6']);
    expect(getModelPricing('claude-sonnet-4-6')).toEqual(MODEL_PRICING['claude-sonnet-4-6']);
    expect(getModelPricing('unknown-future-model')).toEqual(FALLBACK_PRICING);
  });

  it('estimateCostUsd / estimateTokens 換算正確', () => {
    const pricing = { inputCostPerMTok: 15, outputCostPerMTok: 75 };
    // 1_000_000 input * $15/M = $15
    expect(estimateCostUsd(pricing, 1_000_000, 0)).toBeCloseTo(15, 6);
    // 1_000_000 output * $75/M = $75
    expect(estimateCostUsd(pricing, 0, 1_000_000)).toBeCloseTo(75, 6);
    // 負數視為 0
    expect(estimateCostUsd(pricing, -100, -100)).toBe(0);
    // 字元 / 4 估 input、maxOutput 直接當 output
    expect(estimateTokens(400, 1024)).toEqual({ inputTokens: 100, outputTokens: 1024 });
  });

  it('BudgetTracker：估算超過上限時 throw BudgetExceededError', () => {
    const tracker = new BudgetTracker({ maxUsd: 1 });
    expect(() => tracker.assertWithinBudget(0.5)).not.toThrow();
    tracker.recordActual(0.7);
    expect(() => tracker.assertWithinBudget(0.5)).toThrow(BudgetExceededError);
    expect(tracker.getUsedUsd()).toBeCloseTo(0.7, 6);
  });

  it('BudgetTracker：reset 後累計歸零、maxUsd 保留', () => {
    const tracker = new BudgetTracker({ maxUsd: 2 });
    tracker.recordActual(1.5);
    expect(tracker.getUsedUsd()).toBeCloseTo(1.5, 6);
    tracker.reset();
    expect(tracker.getUsedUsd()).toBe(0);
    expect(tracker.getMaxUsd()).toBe(2);
    // reset 後又可以正常呼叫
    expect(() => tracker.assertWithinBudget(1)).not.toThrow();
  });
});
