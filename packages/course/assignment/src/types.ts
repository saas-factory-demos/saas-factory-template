/** 上傳檔案 metadata（檔案實體存 R2 之類的，這裡只記引用）。 */
export interface SubmissionFile {
  /** 顯示檔名。 */
  filename: string;
  /** 物件儲存的 key 或 URL。 */
  storageKey: string;
  /** Bytes。 */
  sizeBytes: number;
  /** MIME。 */
  mimeType: string;
}

/** 作業設定。 */
export interface Assignment {
  id: string;
  tenantId: string;
  courseId: string;
  lessonId?: string;
  title: string;
  /** 作業說明（markdown）。 */
  instructions: string;
  /** 截止時間（undefined = 無截止）。 */
  dueDate?: Date;
  /** 單檔大小上限 MB（預設 50）。 */
  maxFileSizeMB?: number;
  /** 允許的 mime 前綴或副檔名（例：image/、application/pdf、.zip）。 */
  allowedFileTypes?: string[];
  /** 是否啟用互評。 */
  allowPeerReview?: boolean;
  /** 每位學員需互評幾份他人作品（預設 2）。 */
  peerReviewCount?: number;
  /** 公開到作品牆需要的條件。 */
  showcase?: {
    /** 講師通過後是否自動上牆。 */
    autoPublishOnGraded?: boolean;
    /** 需學員同意（預設 true，避免未授權公開）。 */
    requireOptIn?: boolean;
  };
  /** 滿分（預設 100）。 */
  maxScore?: number;
  /** 配分制：百分比（預設）或 letter A/B/C。 */
  gradingScheme?: 'percentage' | 'letter';
}

/** 作業作答狀態。 */
export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'grading'
  | 'graded'
  | 'needs-revision'
  | 'published';

/** 一份學員互評。 */
export interface PeerReview {
  reviewerId: string;
  score?: number;
  comment: string;
  submittedAt: Date;
}

/** 一份學員作業繳交。 */
export interface Submission {
  id: string;
  tenantId: string;
  assignmentId: string;
  userId: string;
  status: SubmissionStatus;
  files: SubmissionFile[];
  /** 文字說明 / 連結。 */
  textContent?: string;
  submittedAt?: Date;
  /** 講師評分。 */
  score?: number;
  /** 講師評語。 */
  feedback?: string;
  graderId?: string;
  gradedAt?: Date;
  /** 互評紀錄。 */
  peerReviews: PeerReview[];
  /** 學員指派要互評的對象（submissionId 清單）。 */
  assignedPeerReviewTargets?: string[];
  /** 是否同意公開到作品牆。 */
  showcaseOptIn?: boolean;
  publishedAt?: Date;
}

/** 作業 / 繳交 store。 */
export interface AssignmentStore {
  getAssignment(id: string): Promise<Assignment | undefined>;
  upsertAssignment(a: Assignment): Promise<void>;
  getSubmission(id: string): Promise<Submission | undefined>;
  upsertSubmission(s: Submission): Promise<void>;
  listSubmissions(tenantId: string, assignmentId: string): Promise<Submission[]>;
  findSubmissionByUser(
    tenantId: string,
    assignmentId: string,
    userId: string,
  ): Promise<Submission | undefined>;
}
