# @saas-factory/ui-checkout

結帳頁元件雛形（goal-02 §12）。

Lock：ADR-0011 §02-12 v1。

## 元件

- `<PaymentMethodSelector />`：依 config 自動顯示可用付款方式 + 圖示。
- `<InstallmentSelector />`：分期期數選擇。
- `<ShippingMethodSelector />`：物流方式 + 運費試算。
- `<CvsStorePicker />`：7-11／全家／萊爾富門市選擇。
- `<InvoiceForm />`：發票資訊（折疊式不展開）。

## 設計規範

- Tailwind 4
- 卡片圓角：`rounded-[14px]`
- 按鈕圓角：`rounded-lg`
- 陰影：`shadow-sm` + hover `shadow-md`
- 邊框：`border-black/10`
- 過渡：`transition-all duration-200 ease-out`
