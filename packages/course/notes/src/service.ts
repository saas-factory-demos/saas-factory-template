import { randomUUID } from 'node:crypto';

import type { Note, NoteColor, NoteStore } from './types.js';

export interface CreateNoteInput {
  tenantId: string;
  userId: string;
  courseId: string;
  lessonId: string;
  timestampSeconds: number;
  content: string;
  color?: NoteColor;
  deviceId?: string;
  now?: Date;
}

export interface UpdateNoteInput {
  id: string;
  content?: string;
  color?: NoteColor;
  timestampSeconds?: number;
  deviceId?: string;
  now?: Date;
}

/** 筆記 service：建立 / 更新 / 跨裝置同步 / 匯出 markdown。 */
export class NotesService {
  constructor(private readonly store: NoteStore) {}

  async create(input: CreateNoteInput): Promise<Note> {
    const now = input.now ?? new Date();
    const note: Note = {
      id: randomUUID(),
      tenantId: input.tenantId,
      userId: input.userId,
      courseId: input.courseId,
      lessonId: input.lessonId,
      timestampSeconds: input.timestampSeconds,
      content: input.content,
      color: input.color ?? 'yellow',
      deviceId: input.deviceId,
      createdAt: now,
      updatedAt: now,
      deleted: false,
    };
    await this.store.upsert(note);
    return note;
  }

  async update(input: UpdateNoteInput): Promise<Note> {
    const existing = await this.store.get(input.id);
    if (!existing) throw new Error(`找不到筆記：${input.id}`);
    const updated: Note = {
      ...existing,
      content: input.content ?? existing.content,
      color: input.color ?? existing.color,
      timestampSeconds: input.timestampSeconds ?? existing.timestampSeconds,
      deviceId: input.deviceId ?? existing.deviceId,
      updatedAt: input.now ?? new Date(),
    };
    await this.store.upsert(updated);
    return updated;
  }

  async remove(id: string, now: Date = new Date()): Promise<void> {
    const existing = await this.store.get(id);
    if (!existing) return;
    await this.store.upsert({ ...existing, deleted: true, updatedAt: now });
  }

  async listByLesson(
    tenantId: string,
    userId: string,
    courseId: string,
    lessonId: string,
  ): Promise<Note[]> {
    const all = await this.store.listByLesson(tenantId, userId, courseId, lessonId);
    return all
      .filter((n) => !n.deleted)
      .sort((a, b) => a.timestampSeconds - b.timestampSeconds);
  }

  async listByCourse(tenantId: string, userId: string, courseId: string): Promise<Note[]> {
    const all = await this.store.listByCourse(tenantId, userId, courseId);
    return all.filter((n) => !n.deleted);
  }

  /**
   * 跨裝置同步：客戶端送來自己的快取，伺服器以 last-write-wins 合併並回傳所有自 since 後變動的記錄。
   */
  async sync(input: {
    tenantId: string;
    userId: string;
    since: Date;
    incoming: Note[];
  }): Promise<{ updated: Note[] }> {
    for (const n of input.incoming) {
      if (n.tenantId !== input.tenantId || n.userId !== input.userId) continue;
      const existing = await this.store.get(n.id);
      if (!existing || n.updatedAt.getTime() > existing.updatedAt.getTime()) {
        await this.store.upsert(n);
      }
    }
    const changed = await this.store.listChangedSince(input.tenantId, input.userId, input.since);
    return { updated: changed };
  }

  /** 匯出整門課筆記為 markdown（後續再用 puppeteer 之類轉 PDF）。 */
  async exportMarkdown(input: {
    tenantId: string;
    userId: string;
    courseId: string;
    courseTitle: string;
    /** 提供 lessonId → 標題的對應表以美化輸出。 */
    lessonTitles?: Map<string, string>;
  }): Promise<string> {
    const all = await this.listByCourse(input.tenantId, input.userId, input.courseId);
    const byLesson = new Map<string, Note[]>();
    for (const n of all) {
      const arr = byLesson.get(n.lessonId) ?? [];
      arr.push(n);
      byLesson.set(n.lessonId, arr);
    }
    const lines: string[] = [`# ${input.courseTitle} 筆記`, ''];
    for (const [lessonId, notes] of byLesson) {
      const title = input.lessonTitles?.get(lessonId) ?? lessonId;
      lines.push(`## ${title}`, '');
      const sorted = notes.slice().sort((a, b) => a.timestampSeconds - b.timestampSeconds);
      for (const n of sorted) {
        lines.push(`- **${formatTimestamp(n.timestampSeconds)}** — ${n.content}`);
      }
      lines.push('');
    }
    return lines.join('\n');
  }
}

/** 將秒數轉成 HH:MM:SS / MM:SS。 */
export function formatTimestamp(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`;
  return `${pad(m)}:${pad(sec)}`;
}
