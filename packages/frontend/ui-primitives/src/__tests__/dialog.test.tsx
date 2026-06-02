import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../dialog.js';

describe('Dialog', () => {
  it('預設 open 時能渲染標題、描述與 trigger', () => {
    render(
      <Dialog defaultOpen>
        <DialogTrigger>開啟</DialogTrigger>
        <DialogContent>
          <DialogTitle>對話框標題</DialogTitle>
          <DialogDescription>對話框描述</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText('對話框標題')).toBeInTheDocument();
    expect(screen.getByText('對話框描述')).toBeInTheDocument();
    expect(screen.getByText('開啟')).toBeInTheDocument();
  });
});
