import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs.js';

describe('Tabs', () => {
  it('能渲染多個 tab 並顯示預設啟用內容', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">頁籤甲</TabsTrigger>
          <TabsTrigger value="b">頁籤乙</TabsTrigger>
        </TabsList>
        <TabsContent value="a">內容甲</TabsContent>
        <TabsContent value="b">內容乙</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: '頁籤甲' })).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('內容甲')).toBeInTheDocument();
  });
});
