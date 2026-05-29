# @saas-factory/payment-linepay-official

LINE Pay 官方 v3 API。

ADR-0011 §02-01 lock：v1 為 stub（藍新已含 LINE Pay 入口），有客戶自簽 LINE Pay 合約時才會啟用。

## 已實作

- 簽章演算法 + verify
- `signRequest()`：產出 HTTP headers 給 apps 端直接打官方 API
- `parseWebhook()`：完整驗簽 + 解析

## 未實作（等 credentials）

- `charge()` / `refund()`：throw `awaiting credentials`
