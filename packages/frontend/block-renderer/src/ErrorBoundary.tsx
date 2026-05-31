'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * BlockErrorBoundary props。
 *
 * - `blockId`：用於錯誤訊息標識，方便客戶後台看出是哪個 block 噴錯。
 * - `fallback`：自訂 fallback JSX；未提供時走預設 placeholder。
 */
export interface BlockErrorBoundaryProps {
  blockId: string;
  blockType: string;
  fallback?: ReactNode;
  children: ReactNode;
}

interface BlockErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * 單一 block 錯誤隔離邊界。
 *
 * 設計鐵則：任一 block 拋例外只影響自己，不會讓整頁壞掉。
 * 預設 fallback 為簡單的占位提示（繁中），客戶可在後台看到「此區塊渲染失敗」。
 */
export class BlockErrorBoundary extends Component<
  BlockErrorBoundaryProps,
  BlockErrorBoundaryState
> {
  constructor(props: BlockErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): BlockErrorBoundaryState {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // 用 console.error 保留 stack；後續可換成 namespaced logger / Sentry。
    console.error(
      `[BlockRenderer] block 渲染失敗（type=${this.props.blockType} id=${this.props.blockId}）`,
      error,
      info.componentStack,
    );
  }

  override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }
    if (this.props.fallback !== undefined) {
      return this.props.fallback;
    }
    return (
      <div
        role="alert"
        data-block-error="true"
        data-block-id={this.props.blockId}
        data-block-type={this.props.blockType}
        className="my-4 rounded-xl border border-black/10 bg-white/60 p-6 text-sm opacity-70"
      >
        <p>此區塊（{this.props.blockType}）暫時無法顯示。</p>
      </div>
    );
  }
}
