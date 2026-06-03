import { randomUUID } from 'node:crypto';

import type {
  Assignment,
  AssignmentStore,
  PeerReview,
  Submission,
  SubmissionFile,
} from './types.js';

export interface SubmitWorkInput {
  tenantId: string;
  assignmentId: string;
  userId: string;
  files: SubmissionFile[];
  textContent?: string;
  showcaseOptIn?: boolean;
  now?: Date;
}

export interface GradeSubmissionInput {
  submissionId: string;
  graderId: string;
  score: number;
  feedback?: string;
  /** 是否要求修改重交。 */
  needsRevision?: boolean;
  now?: Date;
}

export interface AssignPeerReviewInput {
  tenantId: string;
  assignmentId: string;
  /** 額外指定的審稿池（預設用全部 submitted 的 submissions）。 */
  reviewerPool?: string[];
  /** 隨機 seed。 */
  seed?: string;
}

/** 作業 / 繳交 / 互評 / 作品牆 service。 */
export class AssignmentService {
  constructor(private readonly store: AssignmentStore) {}

  upsertAssignment(a: Assignment): Promise<void> {
    return this.store.upsertAssignment(a);
  }

  /** 學員繳交作業（同一人重交會覆蓋前一份）。 */
  async submitWork(input: SubmitWorkInput): Promise<Submission> {
    const assignment = await this.store.getAssignment(input.assignmentId);
    if (!assignment) throw new Error(`找不到作業：${input.assignmentId}`);
    const now = input.now ?? new Date();
    if (assignment.dueDate && now > assignment.dueDate) {
      throw new Error('已超過截止時間');
    }
    this.validateFiles(input.files, assignment);
    const existing = await this.store.findSubmissionByUser(
      input.tenantId,
      input.assignmentId,
      input.userId,
    );
    const sub: Submission = {
      id: existing?.id ?? randomUUID(),
      tenantId: input.tenantId,
      assignmentId: input.assignmentId,
      userId: input.userId,
      status: 'submitted',
      files: input.files,
      textContent: input.textContent,
      submittedAt: now,
      peerReviews: existing?.peerReviews ?? [],
      assignedPeerReviewTargets: existing?.assignedPeerReviewTargets,
      showcaseOptIn: input.showcaseOptIn ?? existing?.showcaseOptIn ?? false,
    };
    await this.store.upsertSubmission(sub);
    return sub;
  }

  /** 講師批改。 */
  async gradeSubmission(input: GradeSubmissionInput): Promise<Submission> {
    const sub = await this.store.getSubmission(input.submissionId);
    if (!sub) throw new Error(`找不到繳交：${input.submissionId}`);
    const assignment = await this.store.getAssignment(sub.assignmentId);
    if (!assignment) throw new Error('找不到對應作業');
    const max = assignment.maxScore ?? 100;
    if (input.score < 0 || input.score > max) {
      throw new Error(`分數超出範圍 0 ~ ${max}`);
    }
    const updated: Submission = {
      ...sub,
      score: input.score,
      feedback: input.feedback,
      graderId: input.graderId,
      gradedAt: input.now ?? new Date(),
      status: input.needsRevision ? 'needs-revision' : 'graded',
    };
    if (
      !input.needsRevision &&
      assignment.showcase?.autoPublishOnGraded &&
      (!assignment.showcase.requireOptIn || sub.showcaseOptIn)
    ) {
      updated.status = 'published';
      updated.publishedAt = input.now ?? new Date();
    }
    await this.store.upsertSubmission(updated);
    return updated;
  }

  /** 指派互評：每人配 N 份他人作品（避開自己 + 平均分配）。 */
  async assignPeerReviews(input: AssignPeerReviewInput): Promise<Map<string, string[]>> {
    const assignment = await this.store.getAssignment(input.assignmentId);
    if (!assignment) throw new Error(`找不到作業：${input.assignmentId}`);
    if (!assignment.allowPeerReview) {
      throw new Error('此作業未啟用互評');
    }
    const n = assignment.peerReviewCount ?? 2;
    const all = await this.store.listSubmissions(input.tenantId, input.assignmentId);
    const reviewers = (input.reviewerPool ?? all.map((s) => s.userId)).slice();
    if (reviewers.length < 2) {
      throw new Error('互評需要至少 2 位學員');
    }
    const rand = makeRand(input.seed);
    const assignments = new Map<string, string[]>();
    for (const sub of all) {
      const candidates = all.filter((x) => x.userId !== sub.userId).slice();
      shuffle(candidates, rand);
      const targets = candidates.slice(0, Math.min(n, candidates.length)).map((x) => x.id);
      sub.assignedPeerReviewTargets = targets;
      await this.store.upsertSubmission(sub);
      assignments.set(sub.userId, targets);
    }
    return assignments;
  }

  /**
   * 學員提交一筆互評。
   *
   * 必須先經由 `assignPeerReviews` 被指派到此 submission 才能評；
   * 任意人帶 submissionId + reviewerId 是不允許的（防灌票 / 防外人寫評語）。
   */
  async submitPeerReview(
    submissionId: string,
    review: Omit<PeerReview, 'submittedAt'> & { now?: Date },
  ): Promise<Submission> {
    const sub = await this.store.getSubmission(submissionId);
    if (!sub) throw new Error('找不到繳交');
    if (review.reviewerId === sub.userId) throw new Error('不可自評');
    // 核對：reviewer 自己的 submission 必須含此 submissionId 為指派目標
    const reviewerSubmission = await this.store.findSubmissionByUser(
      sub.tenantId,
      sub.assignmentId,
      review.reviewerId,
    );
    if (!reviewerSubmission) {
      throw new Error('reviewer 尚未繳交本作業，不可互評');
    }
    if (!reviewerSubmission.assignedPeerReviewTargets?.includes(submissionId)) {
      throw new Error('reviewer 未被指派評此份繳交');
    }
    const now = review.now ?? new Date();
    const existing = sub.peerReviews.findIndex((r) => r.reviewerId === review.reviewerId);
    const entry: PeerReview = {
      reviewerId: review.reviewerId,
      score: review.score,
      comment: review.comment,
      submittedAt: now,
    };
    if (existing >= 0) sub.peerReviews[existing] = entry;
    else sub.peerReviews.push(entry);
    await this.store.upsertSubmission(sub);
    return sub;
  }

  /** 上架到作品牆（學員主動 opt-in 或講師強制公開）。 */
  async publishToShowcase(submissionId: string, now: Date = new Date()): Promise<Submission> {
    const sub = await this.store.getSubmission(submissionId);
    if (!sub) throw new Error('找不到繳交');
    sub.status = 'published';
    sub.publishedAt = now;
    sub.showcaseOptIn = true;
    await this.store.upsertSubmission(sub);
    return sub;
  }

  /** 取得作品牆（已 published 的繳交）。 */
  async listShowcase(tenantId: string, assignmentId: string): Promise<Submission[]> {
    const all = await this.store.listSubmissions(tenantId, assignmentId);
    return all
      .filter((s) => s.status === 'published')
      .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  }

  private validateFiles(files: SubmissionFile[], assignment: Assignment): void {
    const maxBytes = (assignment.maxFileSizeMB ?? 50) * 1024 * 1024;
    for (const f of files) {
      if (f.sizeBytes > maxBytes) {
        throw new Error(`檔案 ${f.filename} 超過 ${assignment.maxFileSizeMB ?? 50} MB`);
      }
      if (assignment.allowedFileTypes && assignment.allowedFileTypes.length > 0) {
        const ok = assignment.allowedFileTypes.some(
          (t) => f.mimeType.startsWith(t) || f.filename.toLowerCase().endsWith(t.toLowerCase()),
        );
        if (!ok) throw new Error(`檔案 ${f.filename} 類型不允許`);
      }
    }
  }
}

function shuffle<T>(arr: T[], rand: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const ai = arr[i] as T;
    const aj = arr[j] as T;
    arr[i] = aj;
    arr[j] = ai;
  }
}

function makeRand(seed?: string): () => number {
  if (!seed) return Math.random;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
}
