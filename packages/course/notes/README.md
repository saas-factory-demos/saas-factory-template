# @saas-factory/course-notes

時間戳筆記 + 跨裝置同步 + Markdown 匯出（給 PDF 轉檔用）。

## 功能

- 每則筆記綁定 lessonId + timestampSeconds，可在進度條上標 marker
- 顏色 highlight（yellow / green / blue / red / purple）
- 軟刪（tombstone）以利跨裝置同步
- `sync()`：last-write-wins 合併 + 回傳自 since 後變動的記錄
- `exportMarkdown()`：依單元 / 時間戳整理為 markdown（可餵 puppeteer 印 PDF）
- Payload `course-notes` collection
