import { describe, expect, it } from 'vitest';

import {
  buildWatermarkText,
  generateFrames,
  getFrameAt,
  maskEmail,
  positionToStyle,
} from './service.js';

describe('maskEmail', () => {
  it('遮罩中段，保留前 2 + 後 1', () => {
    expect(maskEmail('abcdef@example.com')).toBe('ab***f@example.com');
  });
  it('短名稱直接前綴遮罩', () => {
    expect(maskEmail('a@x.com')).toBe('a***@x.com');
  });
  it('無 @ 原樣回傳', () => {
    expect(maskEmail('not-email')).toBe('not-email');
  });
});

describe('buildWatermarkText', () => {
  it('Email 優先於手機', () => {
    const t = buildWatermarkText({
      userId: 'user-1234567',
      displayName: '王小明',
      email: 'foo@bar.com',
      phoneLast4: '5678',
    });
    expect(t).toContain('王小明');
    expect(t).toContain('fo***o@bar.com');
    expect(t).not.toContain('5678');
    expect(t).toContain('user-1');
  });
  it('沒 Email 時使用手機尾 4 碼', () => {
    const t = buildWatermarkText({ userId: 'u1', phoneLast4: '9999' });
    expect(t).toContain('***-9999');
  });
});

describe('generateFrames', () => {
  it('每 5 秒一段，總時長 30 秒 → 6 段', () => {
    const f = generateFrames(
      { userId: 'u1', email: 'a@b.com' },
      { durationSeconds: 30, segmentSeconds: 5 },
    );
    expect(f).toHaveLength(6);
    expect(f[0]?.startSeconds).toBe(0);
    expect(f[0]?.endSeconds).toBe(5);
    expect(f[5]?.endSeconds).toBe(30);
  });
  it('連續兩段位置不重複', () => {
    const f = generateFrames(
      { userId: 'u1' },
      { durationSeconds: 60, segmentSeconds: 5 },
    );
    for (let i = 1; i < f.length; i++) {
      expect(f[i]?.position).not.toBe(f[i - 1]?.position);
    }
  });
  it('同 seed 結果可重現', () => {
    const opts = { durationSeconds: 60, segmentSeconds: 5, seed: 'fixed' };
    const a = generateFrames({ userId: 'u1' }, opts);
    const b = generateFrames({ userId: 'u1' }, opts);
    expect(a.map((x) => x.position)).toEqual(b.map((x) => x.position));
  });
  it('opacity 預設 0.35，可覆寫', () => {
    const f = generateFrames(
      { userId: 'u1' },
      { durationSeconds: 10, segmentSeconds: 5, opacity: 0.8 },
    );
    expect(f[0]?.opacity).toBe(0.8);
  });
  it('零時長回傳空陣列', () => {
    expect(generateFrames({ userId: 'u1' }, { durationSeconds: 0 })).toEqual([]);
  });
  it('最後一段不超過總時長', () => {
    const f = generateFrames(
      { userId: 'u1' },
      { durationSeconds: 12, segmentSeconds: 5 },
    );
    expect(f).toHaveLength(3);
    expect(f.at(-1)?.endSeconds).toBe(12);
  });
});

describe('getFrameAt', () => {
  it('回傳當前秒所屬片段', () => {
    const frames = generateFrames(
      { userId: 'u1' },
      { durationSeconds: 30, segmentSeconds: 5 },
    );
    expect(getFrameAt(frames, 7)?.startSeconds).toBe(5);
    expect(getFrameAt(frames, 0)?.startSeconds).toBe(0);
    expect(getFrameAt(frames, 999)).toBeUndefined();
  });
});

describe('positionToStyle', () => {
  it('top-left → 角落定位', () => {
    const s = positionToStyle('top-left');
    expect(s.top).toBe('6%');
    expect(s.left).toBe('6%');
    expect(s.transform).toBe('translate(0, 0)');
  });
  it('middle-center → 完全置中', () => {
    expect(positionToStyle('middle-center').transform).toBe('translate(-50%, -50%)');
  });
  it('bottom-right → 右下角', () => {
    const s = positionToStyle('bottom-right');
    expect(s.top).toBe('94%');
    expect(s.left).toBe('94%');
    expect(s.transform).toBe('translate(-100%, -100%)');
  });
});
