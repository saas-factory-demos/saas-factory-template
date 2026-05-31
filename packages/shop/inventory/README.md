# @saas-factory/shop-inventory

庫存模組（goal 03 §2）。

Lock：ADR-0011 §03-02 v1。

## 內容
- InventoryService：預扣 / 消化 / 釋放 / 過期掃描
- 預設預扣 TTL：900 秒（15 分鐘）
- InMemoryInventoryStore（測試用）
- Payload Collections：`warehouses`／`inventory-items`／`inventory-reservations`／`restock-subscriptions`

## 預扣流程
1. 下單 → `reserve()` 建立 reservation，reserved += quantity
2. 付款成功 → `consume()` onHand -= quantity，reserved -= quantity
3. 付款失敗或取消 → `release()` 釋放 reserved
4. 逾時 → cron 每分鐘 `sweepExpired()` 自動釋放

## 多倉庫
依 `warehouse.priority` 升冪扣，扣完再下一個倉庫。

## 補貨通知
`restock-subscriptions` 表保存訂閱，補貨後查表寄信並設定 `notifiedAt`。
