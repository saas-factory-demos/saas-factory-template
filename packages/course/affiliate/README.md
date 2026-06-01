# @saas-factory/course-affiliate

課程分潤：平台 vs 講師 vs L1/L2 推薦人，14 天 hold（鑑賞期）後釋放可提領，月結。

## 分潤模型

每筆訂單成立 → `recordOrderSplit()` 自動寫 ledger entry：

| Payee | Rate（範例） |
|---|---|
| 平台 | 30% |
| 講師 | 60% |
| L1 推薦人 | 10%（若有帶 `?ref=xxx`） |
| L2 推薦人 | 0%（預設關閉） |

最後一筆 entry 拿尾數，確保總和 = 訂單金額（避免四捨五入流失分）。

## ⚠️ 多層分潤（L2）法規警告

L2（推薦人的推薦人）預設關閉。開啟前請確認：

- **台灣**：多層次傳銷管理法第 18 條，若「主要報酬源於介紹他人」可能觸法
- 建議：L2 比例 ≤ L1 / 2，且整體推廣分潤 ≤ 銷售分潤

## 14 天 hold

訂單 → ledger entry `status='held'` + `releasesAt = orderedAt + holdDays`。
過了 hold 才能 `settleHold()` 改為 `available`，避免退款後還要追回佣金。

- 退款 → `reverseOrder(orderId)` 整單 entry 改 `reversed`

## 月結

`generateMonthlyPayout(payeeId, year, month)` 取該月所有 `available` 的 ledger entry 匯總，產生 payout summary，交給 `course-instructor` 的 `requestPayout()` 提領流程。
