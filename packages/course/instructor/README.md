# @saas-factory/course-instructor

講師後台：流失分析 4 維度 + 收益儀表板 + 提領 + 私訊 + 課程內容版本管理。

## 模組分工

本 package 聚焦講師端核心邏輯。重複功能由其他 package 提供：

- 批量上傳影片 / 轉檔監控 → `@saas-factory/course-video-providers`
- 排課表（直播） → `@saas-factory/course-live-class`
- 學員提問熱區 → `@saas-factory/course-discussion`

## 流失分析 4 維度

`analyzeEngagement()` 對 `WatchEvent` 做每秒 bucket 化後算 z-score：

| 維度 | 訊號 |
|---|---|
| 精華（highlights） | `play - seekOut` 高於門檻 |
| 流失（dropOffs） | `pause + seekOut` 高於門檻 |
| 重看（replays） | `replay` 高於門檻 |
| 完課率分布 | `completed` event 數 / unique viewer |

預設 bucket=10 秒、threshold=1.0σ。

## 內容版本管理

- `publishContentVersion()`：每次重拍發布新版，version 單調遞增
- `lockEnrollmentToLatest()`：學員報名時鎖到當下最新版
- `optInLatestVersion()`：學員自願切到最新版（`followLatest=true`）
- `resolveVersionForEnrollment()`：播放器取該學員當前版本

重拍某單元 **預設不影響** 已購學員，避免「我買的東西怎麼換了」客訴。

## 收益儀表板

`computeRevenue(instructorId, from, to)` 回傳：

```ts
{ grossMinor, refundMinor, netMinor, platformFeeMinor, payoutMinor, byCourse: [...] }
```

金額用 minor unit（分 / cents）避免浮點誤差。
