# @saas-factory/course-assignment

課程作業系統：上傳 + 講師批改 + 互評 + 作品牆。

## 功能

- 檔案上傳（大小 / 類型限制，實體存外部物件儲存，這裡只記引用）
- 同學員重交會覆蓋既有繳交（不會堆積）
- 截止時間檢查（過期 throw）
- 講師批改：分數 + 評語 + needs-revision 退回
- 互評：每人 N 份他人作品，random + seed 可重現；自評會 throw
- 作品牆：講師通過後可自動上架（需 showcaseOptIn 同意）
- Payload collections：`course-assignments` + `course-submissions`
