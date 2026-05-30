import type { Note, NoteStore } from './types.js';

/** 記憶體版 NoteStore。 */
export class InMemoryNoteStore implements NoteStore {
  private readonly data = new Map<string, Note>();

  async get(id: string): Promise<Note | undefined> {
    return this.data.get(id);
  }
  async upsert(n: Note): Promise<void> {
    this.data.set(n.id, n);
  }
  async listByLesson(
    tenantId: string,
    userId: string,
    courseId: string,
    lessonId: string,
  ): Promise<Note[]> {
    return Array.from(this.data.values()).filter(
      (n) =>
        n.tenantId === tenantId &&
        n.userId === userId &&
        n.courseId === courseId &&
        n.lessonId === lessonId,
    );
  }
  async listByCourse(tenantId: string, userId: string, courseId: string): Promise<Note[]> {
    return Array.from(this.data.values()).filter(
      (n) => n.tenantId === tenantId && n.userId === userId && n.courseId === courseId,
    );
  }
  async listChangedSince(tenantId: string, userId: string, since: Date): Promise<Note[]> {
    return Array.from(this.data.values()).filter(
      (n) =>
        n.tenantId === tenantId &&
        n.userId === userId &&
        n.updatedAt.getTime() > since.getTime(),
    );
  }
}
