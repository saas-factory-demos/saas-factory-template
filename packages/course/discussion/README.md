# @saas-factory/course-discussion

課程討論區：時間戳提問 + 講師回覆 + 同學互助樹 + 採納解答 + 精華區。

## 功能

- 時間戳提問（`timestampSeconds`）：可在進度條 marker 上顯示提問點
- 講師回覆自動標記 `isInstructorReply`（依 `instructorIds` 判斷）
- 採納解答：只有原作者可採納；採納新解答會清掉舊標記
- 回覆樹：`parentReplyId` 支援「同學回覆同學」的互助結構
- 精華 / 關閉 / 隱藏狀態：講師可管控內容品質
- `listLessonQuestions()` 依時間戳排序回傳，自動隱藏 hidden 主題
- Payload `course-threads` + `course-thread-replies` collections
