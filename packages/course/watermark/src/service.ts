import { createHash } from 'node:crypto';

import type {
  WatermarkFrame,
  WatermarkOptions,
  WatermarkPosition,
  WatermarkViewer,
} from './types.js';

const DEFAULT_POSITIONS: WatermarkPosition[] = [
  'top-left',
  'top-right',
  'middle-left',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

/** 將 Email 中段以 `***` 遮罩（避免完整顯示個資）。 */
export function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at < 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length <= 2) return `${local}***${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}${domain}`;
}

/** 將觀眾資訊組成浮水印文字（遮罩過）。 */
export function buildWatermarkText(viewer: WatermarkViewer): string {
  const segments: string[] = [];
  if (viewer.displayName) segments.push(viewer.displayName);
  if (viewer.email) segments.push(maskEmail(viewer.email));
  else if (viewer.phoneLast4) segments.push(`***-${viewer.phoneLast4}`);
  segments.push(viewer.userId.slice(0, 6));
  return segments.join(' · ');
}

/** 將任意字串轉為 0 ~ 2^32 的整數（簡易 hash，序列產生器用）。 */
function seedToInt(seed: string): number {
  const hex = createHash('sha256').update(seed).digest('hex').slice(0, 8);
  return Number.parseInt(hex, 16);
}

/** Mulberry32 PRNG（可重現的偽隨機，給浮水印位置抽樣用）。 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 產生整段影片的浮水印片段。
 *
 * 每 segmentSeconds（預設 5）秒換一次位置；位置由 seed 決定（同觀眾 + 同影片可重現）。
 */
export function generateFrames(viewer: WatermarkViewer, opts: WatermarkOptions): WatermarkFrame[] {
  if (opts.durationSeconds <= 0) return [];
  const segment = Math.max(1, Math.floor(opts.segmentSeconds ?? 5));
  const opacity = clamp(opts.opacity ?? 0.35, 0, 1);
  const positions = (opts.allowedPositions ?? DEFAULT_POSITIONS).slice();
  if (positions.length === 0) throw new Error('allowedPositions 不可為空');
  const seedStr = opts.seed ?? `${viewer.userId}|${opts.durationSeconds}`;
  const rand = mulberry32(seedToInt(seedStr));
  const text = buildWatermarkText(viewer);

  const frames: WatermarkFrame[] = [];
  let last: WatermarkPosition | undefined;
  for (let t = 0; t < opts.durationSeconds; t += segment) {
    const pool = positions.length > 1 ? positions.filter((p) => p !== last) : positions;
    const pick = pool[Math.floor(rand() * pool.length)] ?? positions[0]!;
    frames.push({
      startSeconds: t,
      endSeconds: Math.min(opts.durationSeconds, t + segment),
      position: pick,
      text,
      opacity,
    });
    last = pick;
  }
  return frames;
}

/** 取得指定秒數對應的浮水印片段（播放器即時查詢用）。 */
export function getFrameAt(frames: WatermarkFrame[], seconds: number): WatermarkFrame | undefined {
  return frames.find((f) => seconds >= f.startSeconds && seconds < f.endSeconds);
}

/** 將位置代號轉換為 CSS `top` / `left` / `transform` 樣式片段（播放器 overlay 渲染用）。 */
export function positionToStyle(position: WatermarkPosition): {
  top: string;
  left: string;
  transform: string;
} {
  const [v, h] = position.split('-') as [string, string];
  const top = v === 'top' ? '6%' : v === 'middle' ? '50%' : '94%';
  const left = h === 'left' ? '6%' : h === 'center' ? '50%' : '94%';
  const tx = h === 'left' ? '0' : h === 'center' ? '-50%' : '-100%';
  const ty = v === 'top' ? '0' : v === 'middle' ? '-50%' : '-100%';
  return { top, left, transform: `translate(${tx}, ${ty})` };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
