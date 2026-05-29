import type { Post } from './types.js';

/**
 * 計算指定 post 的相關文章（評分排序）。
 * 規則：
 * - 共用 tag 每個 +2
 * - 同 category +3
 * - 同 series +5
 * - 30 天內發布 +1
 * 排除自己 / 非已發布。
 * 回傳前 `limit` 個（預設 5）。
 */
export function suggestRelated(
  target: Post,
  pool: Post[],
  options: { limit?: number; now?: Date } = {},
): Post[] {
  const limit = options.limit ?? 5;
  const now = options.now ?? new Date();
  const targetTags = new Set(target.tagIds);
  const scored: Array<{ post: Post; score: number }> = [];
  for (const p of pool) {
    if (p.id === target.id) continue;
    if (p.status !== 'published') continue;
    let score = 0;
    let matched = false;
    for (const tag of p.tagIds) {
      if (targetTags.has(tag)) {
        score += 2;
        matched = true;
      }
    }
    if (target.categoryId && p.categoryId === target.categoryId) {
      score += 3;
      matched = true;
    }
    if (target.seriesId && p.seriesId === target.seriesId) {
      score += 5;
      matched = true;
    }
    if (!matched) continue;
    if (p.publishedAt && now.getTime() - p.publishedAt.getTime() < 30 * 86_400_000) score += 1;
    scored.push({ post: p, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.post);
}
