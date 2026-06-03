import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BlockErrorBoundary } from '../ErrorBoundary.js';

import type { BlockInstance } from '@saas-factory/factory-types';
import type { ReactElement } from 'react';

/**
 * 為了讓 BlockRenderer 測試不依賴 20 個真實 block component（會牽動 primitives / motion-system 渲染樹），
 * 整段把 `@saas-factory/frontend-blocks` 與 `@saas-factory/frontend-motion` mock 成最小測試替身。
 * 替身只保留 BlockRenderer 直接接觸的 API：BLOCK_REGISTRY[type].component 與 MotionLevelProvider。
 */
vi.mock('@saas-factory/frontend-blocks', () => {
  function TestBlockFactory(label: string) {
    return function TestBlock(props: Record<string, unknown>): ReactElement {
      if (props.shouldThrow === true) {
        throw new Error(`boom-${label}`);
      }
      return (
        <div data-test-block={label} data-variant={String(props.variant ?? '')}>
          {label}
        </div>
      );
    };
  }
  return {
    BLOCK_REGISTRY: {
      hero: { component: TestBlockFactory('hero') },
      faq: { component: TestBlockFactory('faq') },
      cta: { component: TestBlockFactory('cta') },
    },
  };
});

vi.mock('@saas-factory/frontend-motion', () => ({
  MotionLevelProvider: ({ children }: { children: ReactElement }) => (
    <div data-test-motion-provider="true">{children}</div>
  ),
}));

// 動態 import 確保上面 mock 先建立。
const { BlockRenderer } = await import('../BlockRenderer.js');

/** factory：產出最小可用的 BlockInstance。 */
function makeBlock(overrides: Partial<BlockInstance>): BlockInstance {
  return {
    id: overrides.id ?? 'b-1',
    type: overrides.type ?? 'hero',
    variant: overrides.variant ?? 'centered',
    config: overrides.config ?? {},
    visible: overrides.visible ?? true,
    order: overrides.order ?? 0,
  } as BlockInstance;
}

describe('BlockRenderer', () => {
  it('渲染 3 個不同 type block（hero / faq / cta）', () => {
    const blocks: BlockInstance[] = [
      makeBlock({ id: 'h', type: 'hero', order: 0 }),
      makeBlock({ id: 'f', type: 'faq', order: 1 }),
      makeBlock({ id: 'c', type: 'cta', order: 2 }),
    ];
    render(<BlockRenderer blocks={blocks} />);
    expect(screen.getAllByTestId === undefined).toBe(false);
    const heroNodes = document.querySelectorAll('[data-test-block="hero"]');
    const faqNodes = document.querySelectorAll('[data-test-block="faq"]');
    const ctaNodes = document.querySelectorAll('[data-test-block="cta"]');
    expect(heroNodes.length).toBe(1);
    expect(faqNodes.length).toBe(1);
    expect(ctaNodes.length).toBe(1);
  });

  it('依 order 排序（亂序輸入仍按 order 升冪渲染）', () => {
    const blocks: BlockInstance[] = [
      makeBlock({ id: 'second', type: 'faq', order: 5 }),
      makeBlock({ id: 'first', type: 'hero', order: 1 }),
      makeBlock({ id: 'third', type: 'cta', order: 9 }),
    ];
    render(<BlockRenderer blocks={blocks} />);
    const labels = Array.from(document.querySelectorAll('[data-test-block]')).map(
      (n) => n.getAttribute('data-test-block'),
    );
    expect(labels).toEqual(['hero', 'faq', 'cta']);
  });

  it('未知 type 跳過並 console.warn（不 throw）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const blocks: BlockInstance[] = [
      makeBlock({ id: 'ok', type: 'hero', order: 0 }),
      // 故意傳入 industry-templates dotted slug（型別合法但 BLOCK_REGISTRY 不認得）。
      makeBlock({
        id: 'bad',
        type: 'profile.candidate',
        order: 1,
      }),
      makeBlock({ id: 'ok2', type: 'cta', order: 2 }),
    ];
    expect(() => render(<BlockRenderer blocks={blocks} />)).not.toThrow();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('未註冊的 block type：profile.candidate'),
    );
    // 已知的 2 個 block 仍渲染。
    expect(document.querySelectorAll('[data-test-block]').length).toBe(2);
    warn.mockRestore();
  });

  it('單 block throw 由 ErrorBoundary 隔離，不影響其他 block', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const blocks: BlockInstance[] = [
      makeBlock({ id: 'ok-1', type: 'hero', order: 0 }),
      makeBlock({ id: 'bomb', type: 'faq', order: 1, config: { shouldThrow: true } }),
      makeBlock({ id: 'ok-2', type: 'cta', order: 2 }),
    ];
    render(<BlockRenderer blocks={blocks} />);
    // 兩個正常 block 仍渲染。
    expect(document.querySelector('[data-test-block="hero"]')).not.toBeNull();
    expect(document.querySelector('[data-test-block="cta"]')).not.toBeNull();
    // 第二個 block 替換為 BlockErrorBoundary 的 fallback。
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText(/此區塊（faq）暫時無法顯示/u)).toBeDefined();
    errorSpy.mockRestore();
  });

  it('空陣列渲染為空 fragment（不報錯也不產生節點）', () => {
    const { container } = render(<BlockRenderer blocks={[]} />);
    expect(container.children.length).toBe(0);
  });

  it('BlockErrorBoundary 接受自訂 fallback', () => {
    function Bomb(): ReactElement {
      throw new Error('boom');
    }
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <BlockErrorBoundary
        blockId="x"
        blockType="hero"
        fallback={<span data-testid="custom-fallback">替代內容</span>}
      >
        <Bomb />
      </BlockErrorBoundary>,
    );
    expect(screen.getByTestId('custom-fallback').textContent).toBe('替代內容');
    errorSpy.mockRestore();
  });
});
