# @saas-factory/course-device-limit

裝置同時數限制 + 跨地理偵測 + 強制下線。

## 功能

- 同一使用者同時 active session 上限（預設 3 台）；超過時踢最舊
- 同 deviceId 重複註冊不佔名額（只更新時間）
- 跨地理偵測：若上一筆 active session 國家不同且時間差 < 1 小時，回傳 `geoAnomaly: true`（不阻擋登入，前端可顯示警告 / 後台審查）
- Heartbeat 機制：idle 超過 30 分鐘自動 expire
- `revokeAll()` 給密碼變更 / 帳號鎖定流程使用
- InMemoryDeviceSessionStore + Payload `course-device-sessions` collection

## 用法

```ts
import { DeviceLimitService, InMemoryDeviceSessionStore } from '@saas-factory/course-device-limit';

const service = new DeviceLimitService(new InMemoryDeviceSessionStore(), {
  maxConcurrent: 3,
  idleTimeoutSeconds: 30 * 60,
  geoAnomalyWindowSeconds: 3600,
});

const { session, revoked, geoAnomaly } = await service.registerSession({
  tenantId: 't1',
  userId: 'u1',
  deviceId: 'fingerprint-xxx',
  ip: '1.2.3.4',
  geoCountry: 'TW',
});

if (revoked.length) console.log('已踢掉舊裝置：', revoked.map((r) => r.deviceId));
if (geoAnomaly) console.warn('短時間跨國登入，建議要求重新驗證');
```
