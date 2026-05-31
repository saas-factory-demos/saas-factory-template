import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../card.js';

describe('Card', () => {
  it('能渲染標題與描述', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>標題</CardTitle>
          <CardDescription>說明</CardDescription>
        </CardHeader>
        <CardContent>內容</CardContent>
      </Card>,
    );
    expect(screen.getByText('標題')).toBeInTheDocument();
    expect(screen.getByText('說明')).toBeInTheDocument();
    expect(screen.getByText('內容')).toBeInTheDocument();
  });

  it('outlined variant 套用透明背景樣式', () => {
    const { container } = render(<Card variant="outlined">x</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-transparent');
  });
});
