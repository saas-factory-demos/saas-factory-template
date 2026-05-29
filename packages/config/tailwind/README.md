# @saas-factory/tailwind-config

Tailwind 4 共用 preset，封裝圓角設計 tokens（依 CLAUDE.md §4）。

## 使用

於 app 的 `globals.css`：

```css
@import "tailwindcss";
@import "@saas-factory/tailwind-config/preset.css";
```

## 圓角 token 對照

| Token         | 值        | 用途           |
| ------------- | --------- | -------------- |
| `rounded-sm`  | 8px       | 按鈕           |
| `rounded-md`  | 12px      | 小圖、縮圖     |
| `rounded-lg`  | 14px      | 卡片、內容區塊 |
| `rounded-xl`  | 16px      | 大區塊         |
| `rounded-2xl` | 20px      | hero 主視覺    |
| `rounded-3xl` | 24px      | 特大區塊       |
