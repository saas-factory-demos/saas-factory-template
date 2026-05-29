# @saas-factory/course-live-class

直播課程：Zoom / Google Meet / Jitsi 三 provider + 排程 + 加入窗 + 錄影歸檔。

## Adapter

| Provider | 雲端錄影 | 結束會議 API | JWT |
|---|---|---|---|
| Zoom | ✅ cloud auto-recording | ✅ | n/a |
| Google Meet | ❌（需自接 Drive） | 透過刪除 Calendar 事件 | n/a |
| Jitsi | ❌（需 Jibri 外掛） | 房間制，無結束 | ✅ JaaS |

## 加入窗

`getJoinUrl()` 預設容許：
- 開始前 30 分鐘可加入
- 結束後 30 分鐘內仍可加入（晚到 / 補錄影）

過早 / 過晚都會 throw。

## 錄影歸檔

1. `endSession()` 拉 provider 錄影 → 寫入 `recordings[]`
2. 外部 worker 把錄影複製到 R2
3. `attachArchivedKey(sessionId, idx, storageKey)` 回填
