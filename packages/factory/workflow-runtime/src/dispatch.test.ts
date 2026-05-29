/**
 * dispatchAction 行為測試（無外部依賴）。
 *
 * 不打真實 Resend / 真實 HTTP；email 注入假 sender、webhook 注入假 fetch。
 */

import { describe, expect, it, vi } from 'vitest';

import { createDispatchAction, type EmailSender } from './dispatch.js';

const silentLogger = { info: () => {}, warn: () => {} };

function makeEmailSender(): EmailSender & { _sent: Array<Parameters<EmailSender['send']>[0]> } {
  const sent: Array<Parameters<EmailSender['send']>[0]> = [];
  return {
    _sent: sent,
    async send(input) {
      sent.push(input);
      return { ok: true as const };
    },
  };
}

describe('createDispatchAction', () => {
  it('send-email：成功 → ok + 寄出', async () => {
    const email = makeEmailSender();
    const dispatch = createDispatchAction({ email, logger: silentLogger });
    const res = await dispatch({
      actionType: 'send-email',
      params: { to: 'a@b.c', subject: 'hi', text: 'hello' },
      context: {},
    });
    expect(res).toEqual({ ok: true });
    expect(email._sent).toHaveLength(1);
    expect(email._sent[0]!.to).toBe('a@b.c');
    expect(email._sent[0]!.subject).toBe('hi');
  });

  it('send-email：無 sender → ok:false', async () => {
    const dispatch = createDispatchAction({ logger: silentLogger });
    const res = await dispatch({
      actionType: 'send-email',
      params: { to: 'a@b.c', subject: 'x' },
      context: {},
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('email sender');
  });

  it('send-email：缺 to → ok:false', async () => {
    const dispatch = createDispatchAction({ email: makeEmailSender(), logger: silentLogger });
    const res = await dispatch({
      actionType: 'send-email',
      params: { subject: 'x' },
      context: {},
    });
    expect(res.ok).toBe(false);
  });

  it('notify-admin：寄到 adminEmail', async () => {
    const email = makeEmailSender();
    const dispatch = createDispatchAction({
      email,
      adminEmail: 'admin@factory.local',
      logger: silentLogger,
    });
    const res = await dispatch({
      actionType: 'notify-admin',
      params: { subject: 'alert', message: 'fire' },
      context: {},
    });
    expect(res.ok).toBe(true);
    expect(email._sent[0]!.to).toBe('admin@factory.local');
  });

  it('notify-admin：無 adminEmail → ok:false', async () => {
    const dispatch = createDispatchAction({ email: makeEmailSender(), logger: silentLogger });
    const res = await dispatch({
      actionType: 'notify-admin',
      params: { subject: 'x', message: 'y' },
      context: {},
    });
    expect(res.ok).toBe(false);
  });

  it('webhook：POST 成功 → ok', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response('', { status: 200 }));
    const dispatch = createDispatchAction({ fetchImpl, logger: silentLogger });
    const res = await dispatch({
      actionType: 'webhook',
      params: { url: 'https://hook.example/x', body: '{"a":1}' },
      context: {},
    });
    expect(res.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledOnce();
    const call = fetchImpl.mock.calls[0]!;
    expect(call[0]).toBe('https://hook.example/x');
    expect((call[1] as RequestInit).method).toBe('POST');
  });

  it('webhook：非 http(s) protocol → reject', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response('', { status: 200 }));
    const dispatch = createDispatchAction({ fetchImpl, logger: silentLogger });
    const res = await dispatch({
      actionType: 'webhook',
      params: { url: 'file:///etc/passwd' },
      context: {},
    });
    expect(res.ok).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('webhook：5xx → ok:false', async () => {
    const fetchImpl = vi.fn<typeof fetch>(
      async () => new Response('boom', { status: 500, statusText: 'Internal Server Error' }),
    );
    const dispatch = createDispatchAction({ fetchImpl, logger: silentLogger });
    const res = await dispatch({
      actionType: 'webhook',
      params: { url: 'https://hook.example/x' },
      context: {},
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('500');
  });

  it('webhook：缺 url → ok:false', async () => {
    const dispatch = createDispatchAction({ logger: silentLogger });
    const res = await dispatch({
      actionType: 'webhook',
      params: {},
      context: {},
    });
    expect(res.ok).toBe(false);
  });

  it('webhook：壞 url 格式 → ok:false', async () => {
    const dispatch = createDispatchAction({ logger: silentLogger });
    const res = await dispatch({
      actionType: 'webhook',
      params: { url: 'not a url' },
      context: {},
    });
    expect(res.ok).toBe(false);
  });

  it('add-tag / remove-tag / create-task：log + ok（尚未接客戶站）', async () => {
    const dispatch = createDispatchAction({ logger: silentLogger });
    for (const actionType of ['add-tag', 'remove-tag', 'create-task'] as const) {
      const res = await dispatch({ actionType, params: { x: 1 }, context: {} });
      expect(res).toEqual({ ok: true });
    }
  });
});
