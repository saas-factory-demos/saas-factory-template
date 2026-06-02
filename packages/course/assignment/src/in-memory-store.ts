import type { Assignment, AssignmentStore, Submission } from './types.js';

/** 記憶體版 AssignmentStore。 */
export class InMemoryAssignmentStore implements AssignmentStore {
  private readonly assignments = new Map<string, Assignment>();
  private readonly submissions = new Map<string, Submission>();

  async getAssignment(id: string): Promise<Assignment | undefined> {
    return this.assignments.get(id);
  }
  async upsertAssignment(a: Assignment): Promise<void> {
    this.assignments.set(a.id, a);
  }
  async getSubmission(id: string): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }
  async upsertSubmission(s: Submission): Promise<void> {
    this.submissions.set(s.id, s);
  }
  async listSubmissions(tenantId: string, assignmentId: string): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(
      (s) => s.tenantId === tenantId && s.assignmentId === assignmentId,
    );
  }
  async findSubmissionByUser(
    tenantId: string,
    assignmentId: string,
    userId: string,
  ): Promise<Submission | undefined> {
    return Array.from(this.submissions.values()).find(
      (s) => s.tenantId === tenantId && s.assignmentId === assignmentId && s.userId === userId,
    );
  }
}
