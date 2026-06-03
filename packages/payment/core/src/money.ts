import type { CurrencyCode, Money } from './types.js';

/**
 * ISO 4217 各幣別最小單位的小數位數（minor unit exponent）。
 * TWD / JPY 無小數，amount 直接是「元」整數。
 * USD / EUR / GBP / HKD / SGD / CNY 有 2 位小數，amount 是「分」。
 */
export const MINOR_UNIT_EXPONENT: Record<CurrencyCode, number> = {
  TWD: 0,
  JPY: 0,
  USD: 2,
  EUR: 2,
  HKD: 2,
  SGD: 2,
  CNY: 2,
};

/** 將浮點面額（如 99.99 USD）轉成 minor unit（9999）。 */
export function toMinorUnit(amount: number, currency: CurrencyCode): Money {
  const exp = MINOR_UNIT_EXPONENT[currency];
  return { amount: Math.round(amount * 10 ** exp), currency };
}

/** 將 Money 轉成顯示用浮點面額。 */
export function toMajorUnit(money: Money): number {
  const exp = MINOR_UNIT_EXPONENT[money.currency];
  return money.amount / 10 ** exp;
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount - b.amount, currency: a.currency };
}

export function isPositive(m: Money): boolean {
  return m.amount > 0;
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(
      `currency mismatch: ${a.currency} vs ${b.currency}`,
    );
  }
}
