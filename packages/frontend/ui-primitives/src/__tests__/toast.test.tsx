import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '../toast.js';

describe('Toast', () => {
  it('能渲染 ToastProvider 內的 Toast 標題與描述', () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>通知標題</ToastTitle>
          <ToastDescription>通知內容</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );
    expect(screen.getByText('通知標題')).toBeInTheDocument();
    expect(screen.getByText('通知內容')).toBeInTheDocument();
  });
});
