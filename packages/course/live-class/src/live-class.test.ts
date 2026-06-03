import { describe, expect, it, vi } from 'vitest';

import { GoogleMeetAdapter, type GoogleMeetHttpClient } from './google-meet-adapter.js';
import { InMemoryLiveSessionStore } from './in-memory-store.js';
import { JitsiAdapter } from './jitsi-adapter.js';
import { LiveClassService } from './service.js';
import { ZoomAdapter, type ZoomHttpClient } from './zoom-adapter.js';

import type { LiveClassProvider } from './types.js';

const TENANT = 't1';
const COURSE = 'c1';
const HOST = 'teacher@x.com';

describe('ZoomAdapter', () => {
  it('createMeeting → 帶上 auto_recording cloud', async () => {
    const calls: Array<{ method: string; path: string; body?: unknown }> = [];
    const request = vi.fn(
      async <T = unknown>(input: { method: string; path: string; body?: unknown }): Promise<T> => {
        calls.push(input);
        return { id: 12345, join_url: 'https://zoom/j', start_url: 'https://zoom/s' } as T;
      },
    );
    const http: ZoomHttpClient = { request: request as unknown as ZoomHttpClient['request'] };
    const adapter = new ZoomAdapter({ http });
    const r = await adapter.createMeeting({
      title: '導論',
      scheduledAt: new Date('2026-05-20T10:00:00Z'),
      durationMinutes: 60,
      hostUserId: HOST,
      enableRecording: true,
    });
    expect(r.externalId).toBe('12345');
    expect(r.joinUrl).toBe('https://zoom/j');
    expect(calls[0]?.path).toContain('/users/');
    const body = calls[0]?.body as { settings: { auto_recording: string } };
    expect(body.settings.auto_recording).toBe('cloud');
  });

  it('fetchRecordings 解析 MP4', async () => {
    const request = vi.fn(
      async <T = unknown>(_input: { method: string; path: string; body?: unknown }): Promise<T> => {
        return {
          recording_files: [
            {
              file_type: 'MP4',
              download_url: 'https://r/v.mp4',
              recording_start: '2026-05-20T10:00:00Z',
              recording_end: '2026-05-20T11:00:00Z',
            },
            { file_type: 'CHAT' },
          ],
        } as T;
      },
    );
    const adapter = new ZoomAdapter({
      http: { request: request as unknown as ZoomHttpClient['request'] },
    });
    const recs = await adapter.fetchRecordings('m1');
    expect(recs).toHaveLength(1);
    expect(recs[0]?.durationSeconds).toBe(3600);
  });
});

describe('GoogleMeetAdapter', () => {
  it('createMeeting → 取 hangoutLink', async () => {
    const request = vi.fn(
      async <T = unknown>(_input: { method: string; path: string; body?: unknown }): Promise<T> => {
        return { id: 'evt-1', hangoutLink: 'https://meet.google.com/abc-def-ghi' } as T;
      },
    );
    const adapter = new GoogleMeetAdapter({
      http: { request: request as unknown as GoogleMeetHttpClient['request'] },
    });
    const r = await adapter.createMeeting({
      title: 'X',
      scheduledAt: new Date('2026-05-20T10:00:00Z'),
      durationMinutes: 30,
      hostUserId: HOST,
    });
    expect(r.externalId).toBe('evt-1');
    expect(r.joinUrl).toContain('meet.google.com');
  });
});

describe('JitsiAdapter', () => {
  it('回傳房間 URL（無 JWT 模式）', async () => {
    const adapter = new JitsiAdapter({ baseUrl: 'https://meet.jit.si' });
    const r = await adapter.createMeeting({
      title: 'X',
      scheduledAt: new Date(),
      durationMinutes: 30,
      hostUserId: HOST,
    });
    expect(r.joinUrl).toContain('meet.jit.si/course-');
    expect(r.externalId).toMatch(/^course-/);
  });

  it('appId + appSecret → 帶 JWT', async () => {
    const adapter = new JitsiAdapter({
      baseUrl: 'https://8x8.vc',
      appId: 'vpaas-magic-cookie-xxx',
      appSecret: 'secret',
    });
    const r = await adapter.createMeeting({
      title: 'X',
      scheduledAt: new Date('2026-05-20T10:00:00Z'),
      durationMinutes: 30,
      hostUserId: HOST,
    });
    expect(r.joinUrl).toContain('jwt=');
  });
});

describe('LiveClassService', () => {
  function fakeProvider(): LiveClassProvider {
    let counter = 0;
    return {
      providerType: 'zoom',
      async createMeeting() {
        counter++;
        return { externalId: `m${counter}`, joinUrl: `https://x/join/${counter}` };
      },
      async endMeeting() {},
      async fetchRecordings() {
        return [
          {
            url: 'https://r/1.mp4',
            durationSeconds: 1800,
            recordedAt: new Date('2026-05-20T11:00:00Z'),
          },
        ];
      },
    };
  }

  it('scheduleSession 寫入 store', async () => {
    const store = new InMemoryLiveSessionStore();
    const svc = new LiveClassService(store, fakeProvider());
    const s = await svc.scheduleSession({
      tenantId: TENANT,
      courseId: COURSE,
      hostUserId: HOST,
      title: '導論',
      scheduledAt: new Date('2026-05-20T10:00:00Z'),
      durationMinutes: 60,
    });
    expect(s.status).toBe('scheduled');
    expect(s.externalId).toBe('m1');
  });

  it('getJoinUrl 開場前太早 → throw', async () => {
    const svc = new LiveClassService(new InMemoryLiveSessionStore(), fakeProvider());
    const s = await svc.scheduleSession({
      tenantId: TENANT,
      courseId: COURSE,
      hostUserId: HOST,
      title: 'X',
      scheduledAt: new Date('2026-05-20T10:00:00Z'),
      durationMinutes: 60,
    });
    await expect(
      svc.getJoinUrl(s.id, HOST, new Date('2026-05-20T08:00:00Z')),
    ).rejects.toThrow(/尚未開放/);
  });

  it('getJoinUrl 結束後過久 → throw', async () => {
    const svc = new LiveClassService(new InMemoryLiveSessionStore(), fakeProvider());
    const s = await svc.scheduleSession({
      tenantId: TENANT,
      courseId: COURSE,
      hostUserId: HOST,
      title: 'X',
      scheduledAt: new Date('2026-05-20T10:00:00Z'),
      durationMinutes: 60,
    });
    await expect(
      svc.getJoinUrl(s.id, HOST, new Date('2026-05-20T12:00:00Z')),
    ).rejects.toThrow(/已過/);
  });

  it('getJoinUrl 非註冊學員 → throw', async () => {
    const checker = {
      isEnrolled: vi.fn(async ({ userId }: { userId: string }) => userId === 'enrolled-user'),
    };
    const svc = new LiveClassService(new InMemoryLiveSessionStore(), fakeProvider(), checker);
    const s = await svc.scheduleSession({
      tenantId: TENANT,
      courseId: COURSE,
      hostUserId: HOST,
      title: 'X',
      scheduledAt: new Date('2026-05-20T10:00:00Z'),
      durationMinutes: 60,
    });
    await expect(
      svc.getJoinUrl(s.id, 'random-stranger', new Date('2026-05-20T10:00:00Z')),
    ).rejects.toThrow(/未註冊/);
    const url = await svc.getJoinUrl(
      s.id,
      'enrolled-user',
      new Date('2026-05-20T10:00:00Z'),
    );
    expect(url).toContain('https://x/join/');
  });

  it('getJoinUrl 沒注入 checker + 非 host → throw', async () => {
    const svc = new LiveClassService(new InMemoryLiveSessionStore(), fakeProvider());
    const s = await svc.scheduleSession({
      tenantId: TENANT,
      courseId: COURSE,
      hostUserId: HOST,
      title: 'X',
      scheduledAt: new Date('2026-05-20T10:00:00Z'),
      durationMinutes: 60,
    });
    await expect(
      svc.getJoinUrl(s.id, 'anyone-else', new Date('2026-05-20T10:00:00Z')),
    ).rejects.toThrow(/enrollment/);
  });

  it('endSession 拉錄影並更新 status', async () => {
    const svc = new LiveClassService(new InMemoryLiveSessionStore(), fakeProvider());
    const s = await svc.scheduleSession({
      tenantId: TENANT,
      courseId: COURSE,
      hostUserId: HOST,
      title: 'X',
      scheduledAt: new Date('2026-05-20T10:00:00Z'),
      durationMinutes: 60,
    });
    const ended = await svc.endSession(s.id);
    expect(ended.status).toBe('ended');
    expect(ended.recordings).toHaveLength(1);
  });

  it('listUpcoming 只回未來且 scheduled', async () => {
    const svc = new LiveClassService(new InMemoryLiveSessionStore(), fakeProvider());
    const past = await svc.scheduleSession({
      tenantId: TENANT,
      courseId: COURSE,
      hostUserId: HOST,
      title: 'past',
      scheduledAt: new Date('2026-04-01T10:00:00Z'),
      durationMinutes: 60,
    });
    const future = await svc.scheduleSession({
      tenantId: TENANT,
      courseId: COURSE,
      hostUserId: HOST,
      title: 'future',
      scheduledAt: new Date('2026-06-01T10:00:00Z'),
      durationMinutes: 60,
    });
    const list = await svc.listUpcoming(TENANT, COURSE, new Date('2026-05-15T00:00:00Z'));
    expect(list.map((s) => s.id)).toEqual([future.id]);
    expect(past).toBeDefined();
  });

  it('attachArchivedKey 回填', async () => {
    const svc = new LiveClassService(new InMemoryLiveSessionStore(), fakeProvider());
    const s = await svc.scheduleSession({
      tenantId: TENANT,
      courseId: COURSE,
      hostUserId: HOST,
      title: 'X',
      scheduledAt: new Date('2026-05-20T10:00:00Z'),
      durationMinutes: 60,
    });
    await svc.endSession(s.id);
    const updated = await svc.attachArchivedKey(s.id, 0, 'r2://archive/1.mp4');
    expect(updated.recordings[0]?.archivedStorageKey).toBe('r2://archive/1.mp4');
  });
});
