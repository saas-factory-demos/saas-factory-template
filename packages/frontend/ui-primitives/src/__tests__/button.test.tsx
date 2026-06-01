import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '../button.js';

describe('Button', () => {
  it('能渲染預設 variant 並顯示文字', () => {
    render(<Button>送出</Button>);
    expect(screen.getByRole('button', { name: '送出' })).toBeInTheDocument();
  });

  it('套用 destructive variant 的對應 className', () => {
    render(<Button variant="destructive">刪除</Button>);
    const btn = screen.getByRole('button', { name: '刪除' });
    expect(btn.className).toContain('--color-danger-500');
  });

  it('套用 size=sm 的對應 className', () => {
    render(<Button size="sm">小</Button>);
    const btn = screen.getByRole('button', { name: '小' });
    expect(btn.className).toContain('h-9');
  });
});
