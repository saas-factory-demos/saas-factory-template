import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MotionLevelProvider } from '../motion-level-context.js';
import { MotionWrapper } from '../motion-wrapper.js';

function mockMatchMedia(reduce: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: reduce,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

describe('MotionWrapper', () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  it('渲染 children', () => {
    render(
      <MotionWrapper variant="fadeIn">
        <span>hello</span>
      </MotionWrapper>,
    );
    expect(screen.getByText('hello')).toBeDefined();
  });

  it('在 MotionLevelProvider 下吃 Context 的 level', () => {
    render(
      <MotionLevelProvider level={5}>
        <MotionWrapper variant="slideUp">
          <span>provider-child</span>
        </MotionWrapper>
      </MotionLevelProvider>,
    );
    expect(screen.getByText('provider-child')).toBeDefined();
  });
});
