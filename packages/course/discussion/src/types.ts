/** 討論主題狀態。 */
export type ThreadStatus = 'open' | 'closed' | 'featured' | 'hidden';

/** 一條提問 / 討論主題。 */
export interface Thread {
  id: string;
  tenantId: string;
  courseId: string;
  lessonId?: string;
  authorId: string;
  title: string;
  body: string;
  /** 影片時間戳（秒）：用於「在 12:34 提問」的跳播功能。 */
  timestampSeconds?: number;
  tags: string[];
  status: ThreadStatus;
  upvotes: number;
  replyCount: number;
  /** 是否已有講師回覆（讓學員快速辨認）。 */
  instructorReplied: boolean;
  /** 是否已有被採納的解答（互助常見的「已解決」標記）。 */
  hasAcceptedAnswer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** 一條回覆。 */
export interface Reply {
  id: string;
  tenantId: string;
  threadId: string;
  /** 父回覆 ID：支援「回覆同學的回覆」互助樹。 */
  parentReplyId?: string;
  authorId: string;
  body: string;
  /** 是否為講師回覆（依 instructorIds 判斷）。 */
  isInstructorReply: boolean;
  /** 是否被原作者標記為「採納解答」。 */
  isAcceptedAnswer: boolean;
  upvotes: number;
  createdAt: Date;
}

/** 討論 store 介面。 */
export interface DiscussionStore {
  getThread(id: string): Promise<Thread | undefined>;
  upsertThread(t: Thread): Promise<void>;
  listThreads(filter: ListThreadFilter): Promise<Thread[]>;
  getReply(id: string): Promise<Reply | undefined>;
  upsertReply(r: Reply): Promise<void>;
  listReplies(threadId: string): Promise<Reply[]>;
}

/** 列表查詢條件。 */
export interface ListThreadFilter {
  tenantId: string;
  courseId: string;
  lessonId?: string;
  status?: ThreadStatus;
  /** 是否只回傳精華。 */
  featuredOnly?: boolean;
  tag?: string;
}
