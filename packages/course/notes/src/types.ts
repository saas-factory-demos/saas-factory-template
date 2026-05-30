/** 筆記顏色（前端 highlight 用，預設 yellow）。 */
export type NoteColor = 'yellow' | 'green' | 'blue' | 'red' | 'purple';

/** 一則時間戳筆記。 */
export interface Note {
  id: string;
  tenantId: string;
  userId: string;
  courseId: string;
  lessonId: string;
  /** 影片時間戳（秒）。 */
  timestampSeconds: number;
  /** 內容（markdown）。 */
  content: string;
  color: NoteColor;
  /** 寫筆記時所在裝置（指紋）；同步衝突時可顯示。 */
  deviceId?: string;
  createdAt: Date;
  updatedAt: Date;
  /** 是否已刪除（軟刪，跨裝置同步用 tombstone）。 */
  deleted: boolean;
}

/** 筆記 store 介面。 */
export interface NoteStore {
  get(id: string): Promise<Note | undefined>;
  upsert(n: Note): Promise<void>;
  listByLesson(tenantId: string, userId: string, courseId: string, lessonId: string): Promise<Note[]>;
  listByCourse(tenantId: string, userId: string, courseId: string): Promise<Note[]>;
  /** 取得自指定時間後變動的筆記（含 deleted tombstone），給跨裝置同步用。 */
  listChangedSince(
    tenantId: string,
    userId: string,
    since: Date,
  ): Promise<Note[]>;
}
