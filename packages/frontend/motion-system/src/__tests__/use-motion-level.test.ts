import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useMotionLevel } from '../use-motion-level.js';

interface MatchMediaMock {
  matches: boolean;
  media: string;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
  onchange: null;
}

function mockMatchMedia(reduce: boolean): void {
  const factory = (query: string): MatchMediaMock => ({
    matches: reduce,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: factory,
  });
}

describe('useMotionLevel', () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('未提供任何 prop / context 時回傳預設 level 3', () => {
    const { result } = renderHook(() => useMotionLevel());
    expect(result.current.level).toBe(3);
    expect(result.current.reducedMotion).toBe(false);
  });

  it('options.level 直接覆寫', () => {
    const { result } = renderHook(() => useMotionLevel({ level: 5 }));
    expect(result.current.level).toBe(5);
  });

  it('prefers-reduced-motion=reduce 時強制降到 1', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMotionLevel({ level: 5 }));
    expect(result.current.reducedMotion).toBe(true);
    expect(result.current.level).toBe(1);
  });

  it('respectReducedMotion=false 時忽略系統偏好', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() =>
      useMotionLevel({ level: 4, respectReducedMotion: false }),
    );
    expect(result.current.reducedMotion).toBe(true);
    expect(result.current.level).toBe(4);
  });
});
