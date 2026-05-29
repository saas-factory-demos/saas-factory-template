import type { RichMenuSchedule } from './types.js';

/** 取得 YYYY-MM 字串（UTC 起算）。 */
export function yearMonthOf(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** 計算單筆 rich menu schedule 的下一個狀態（pure）。 */
export function nextScheduleStatus(
  s: RichMenuSchedule,
  now: Date,
): RichMenuSchedule['status'] {
  if (s.status === 'cancelled' || s.status === 'expired') return s.status;
  let next: RichMenuSchedule['status'] = s.status;
  if (s.status === 'pending' && s.from <= now) next = 'active';
  if (next === 'active' && s.until && s.until <= now) next = 'expired';
  return next;
}
