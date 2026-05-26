import { describe, expect, it } from 'vitest';

import { InMemoryAssignmentStore } from './in-memory-store.js';
import { AssignmentService } from './service.js';

import type { Assignment, SubmissionFile } from './types.js';

const TENANT = 't1';

function setup(overrides: Partial<Assignment> = {}) {
  const store = new InMemoryAssignmentStore();
  const svc = new AssignmentService(store);
  const assignment: Assignment = {
    id: 'a1',
    tenantId: TENANT,
    courseId: 'c1',
    title: '作業 1',
    instructions: '請繳交一份 PDF',
    maxFileSizeMB: 10,
    allowedFileTypes: ['application/pdf', '.zip'],
    allowPeerReview: true,
    peerReviewCount: 2,
    maxScore: 100,
    ...overrides,
  };
  return { store, svc, assignment };
}

const pdf: SubmissionFile = {
  filename: 'work.pdf',
  storageKey: 'k1',
  sizeBytes: 1024,
  mimeType: 'application/pdf',
};

describe('AssignmentService.submitWork', () => {
  it('成功繳交 → status = submitted', async () => {
    const { svc, assignment } = setup();
    await svc.upsertAssignment(assignment);
    const sub = await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u1',
      files: [pdf],
    });
    expect(sub.status).toBe('submitted');
    expect(sub.files).toHaveLength(1);
  });

  it('檔案太大 → throw', async () => {
    const { svc, assignment } = setup({ maxFileSizeMB: 1 });
    await svc.upsertAssignment(assignment);
    const big: SubmissionFile = { ...pdf, sizeBytes: 5 * 1024 * 1024 };
    await expect(
      svc.submitWork({ tenantId: TENANT, assignmentId: 'a1', userId: 'u1', files: [big] }),
    ).rejects.toThrow(/超過/);
  });

  it('檔案類型不允許 → throw', async () => {
    const { svc, assignment } = setup();
    await svc.upsertAssignment(assignment);
    const png: SubmissionFile = {
      filename: 'a.png',
      storageKey: 'k',
      sizeBytes: 100,
      mimeType: 'image/png',
    };
    await expect(
      svc.submitWork({ tenantId: TENANT, assignmentId: 'a1', userId: 'u1', files: [png] }),
    ).rejects.toThrow(/類型不允許/);
  });

  it('超過截止時間 → throw', async () => {
    const due = new Date(2026, 4, 14);
    const { svc, assignment } = setup({ dueDate: due });
    await svc.upsertAssignment(assignment);
    await expect(
      svc.submitWork({
        tenantId: TENANT,
        assignmentId: 'a1',
        userId: 'u1',
        files: [pdf],
        now: new Date(2026, 4, 15),
      }),
    ).rejects.toThrow(/截止/);
  });

  it('重交覆蓋同一筆', async () => {
    const { svc, store, assignment } = setup();
    await svc.upsertAssignment(assignment);
    const a = await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u1',
      files: [pdf],
    });
    const b = await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u1',
      files: [{ ...pdf, filename: 'v2.pdf' }],
    });
    expect(a.id).toBe(b.id);
    const all = await store.listSubmissions(TENANT, 'a1');
    expect(all).toHaveLength(1);
  });
});

describe('AssignmentService.gradeSubmission', () => {
  it('正常打分 → status = graded', async () => {
    const { svc, assignment } = setup();
    await svc.upsertAssignment(assignment);
    const sub = await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u1',
      files: [pdf],
    });
    const graded = await svc.gradeSubmission({
      submissionId: sub.id,
      graderId: 'teacher-1',
      score: 85,
      feedback: '不錯',
    });
    expect(graded.status).toBe('graded');
    expect(graded.score).toBe(85);
  });

  it('needsRevision → status = needs-revision', async () => {
    const { svc, assignment } = setup();
    await svc.upsertAssignment(assignment);
    const sub = await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u1',
      files: [pdf],
    });
    const graded = await svc.gradeSubmission({
      submissionId: sub.id,
      graderId: 't',
      score: 40,
      needsRevision: true,
    });
    expect(graded.status).toBe('needs-revision');
  });

  it('分數超出範圍 → throw', async () => {
    const { svc, assignment } = setup({ maxScore: 50 });
    await svc.upsertAssignment(assignment);
    const sub = await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u1',
      files: [pdf],
    });
    await expect(
      svc.gradeSubmission({ submissionId: sub.id, graderId: 't', score: 99 }),
    ).rejects.toThrow(/超出範圍/);
  });

  it('autoPublishOnGraded + showcaseOptIn → 自動上牆', async () => {
    const { svc, assignment } = setup({
      showcase: { autoPublishOnGraded: true, requireOptIn: true },
    });
    await svc.upsertAssignment(assignment);
    const sub = await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u1',
      files: [pdf],
      showcaseOptIn: true,
    });
    const graded = await svc.gradeSubmission({
      submissionId: sub.id,
      graderId: 't',
      score: 95,
    });
    expect(graded.status).toBe('published');
    expect(graded.publishedAt).toBeDefined();
  });
});

describe('AssignmentService peer review', () => {
  it('指派互評：每人 N 份他人作品，不含自己', async () => {
    const { svc, assignment } = setup({ peerReviewCount: 2 });
    await svc.upsertAssignment(assignment);
    for (const u of ['u1', 'u2', 'u3', 'u4']) {
      await svc.submitWork({ tenantId: TENANT, assignmentId: 'a1', userId: u, files: [pdf] });
    }
    const map = await svc.assignPeerReviews({
      tenantId: TENANT,
      assignmentId: 'a1',
      seed: 'fixed',
    });
    expect(map.size).toBe(4);
    for (const targets of map.values()) {
      expect(targets).toHaveLength(2);
    }
  });

  it('提交互評 → 進 peerReviews', async () => {
    const { svc, store, assignment } = setup({ peerReviewCount: 1 });
    await svc.upsertAssignment(assignment);
    const sub1 = await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u1',
      files: [pdf],
    });
    const sub2 = await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u2',
      files: [pdf],
    });
    // 手動指派 u2 → u1（不靠 random seed）
    const u2Sub = (await store.getSubmission(sub2.id))!;
    u2Sub.assignedPeerReviewTargets = [sub1.id];
    await store.upsertSubmission(u2Sub);
    const updated = await svc.submitPeerReview(sub1.id, {
      reviewerId: 'u2',
      score: 80,
      comment: '不錯',
    });
    expect(updated.peerReviews).toHaveLength(1);
    expect(updated.peerReviews[0]?.reviewerId).toBe('u2');
  });

  it('未繳交者不可互評 → throw', async () => {
    const { svc, assignment } = setup();
    await svc.upsertAssignment(assignment);
    const sub = await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u1',
      files: [pdf],
    });
    await expect(
      svc.submitPeerReview(sub.id, { reviewerId: 'stranger', score: 80, comment: 'x' }),
    ).rejects.toThrow(/未繳交/);
  });

  it('未被指派者不可互評 → throw', async () => {
    const { svc, assignment } = setup();
    await svc.upsertAssignment(assignment);
    const sub1 = await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u1',
      files: [pdf],
    });
    // u2 也繳了，但沒被指派評 u1
    await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u2',
      files: [pdf],
    });
    await expect(
      svc.submitPeerReview(sub1.id, { reviewerId: 'u2', score: 80, comment: 'x' }),
    ).rejects.toThrow(/未被指派/);
  });

  it('自評 → throw', async () => {
    const { svc, assignment } = setup();
    await svc.upsertAssignment(assignment);
    const sub = await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u1',
      files: [pdf],
    });
    await expect(
      svc.submitPeerReview(sub.id, { reviewerId: 'u1', comment: 'x' }),
    ).rejects.toThrow(/自評/);
  });
});

describe('AssignmentService showcase', () => {
  it('listShowcase 只回傳 published', async () => {
    const { svc, assignment } = setup();
    await svc.upsertAssignment(assignment);
    const a = await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u1',
      files: [pdf],
    });
    const b = await svc.submitWork({
      tenantId: TENANT,
      assignmentId: 'a1',
      userId: 'u2',
      files: [pdf],
    });
    await svc.publishToShowcase(a.id);
    const showcase = await svc.listShowcase(TENANT, 'a1');
    expect(showcase.map((s) => s.id)).toEqual([a.id]);
    expect(showcase).not.toContainEqual(expect.objectContaining({ id: b.id }));
  });
});
