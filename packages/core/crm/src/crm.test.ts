import { describe, expect, it } from 'vitest';

import {
  InMemoryCommunicationLog,
  matchSegment,
} from './index.js';

import type { CustomerProfile, CustomerSegment } from './index.js';

const vip: CustomerProfile = {
  customerId: 'c1',
  tenantId: 'T-1',
  tags: ['vip', 'high-spend'],
  lifecycleStage: 'active',
};

describe('matchSegment', () => {
  it('requiredTags 全部命中才算', () => {
    const seg: CustomerSegment = {
      id: 's1',
      name: 'VIP',
      requiredTags: ['vip'],
    };
    expect(matchSegment(vip, seg)).toBe(true);
    expect(
      matchSegment(
        { ...vip, tags: ['high-spend'] },
        seg,
      ),
    ).toBe(false);
  });

  it('excludedTags 命中則排除', () => {
    const seg: CustomerSegment = {
      id: 's2',
      name: 'non-vip active',
      lifecycleStages: ['active'],
      excludedTags: ['vip'],
    };
    expect(matchSegment(vip, seg)).toBe(false);
    expect(
      matchSegment({ ...vip, tags: ['high-spend'] }, seg),
    ).toBe(true);
  });

  it('lifecycle 不匹配排除', () => {
    const seg: CustomerSegment = {
      id: 's3',
      name: 'dormant',
      lifecycleStages: ['dormant'],
    };
    expect(matchSegment(vip, seg)).toBe(false);
  });

  it('anyTags 至少命中一個', () => {
    const seg: CustomerSegment = {
      id: 's4',
      name: 'any',
      anyTags: ['vip', 'birthday'],
    };
    expect(matchSegment(vip, seg)).toBe(true);
    expect(
      matchSegment({ ...vip, tags: [] }, seg),
    ).toBe(false);
  });

  it('tenant 不同則排除', () => {
    const seg: CustomerSegment = {
      id: 's5',
      name: 't2',
      tenantId: 'T-2',
    };
    expect(matchSegment(vip, seg)).toBe(false);
  });
});

describe('InMemoryCommunicationLog', () => {
  it('listByCustomer 依時間反向排序', async () => {
    const log = new InMemoryCommunicationLog();
    await log.append({
      id: '1',
      customerId: 'c1',
      channel: 'email',
      subject: 'a',
      direction: 'outbound',
      occurredAt: '2026-05-10T00:00:00Z',
    });
    await log.append({
      id: '2',
      customerId: 'c1',
      channel: 'line',
      subject: 'b',
      direction: 'inbound',
      occurredAt: '2026-05-15T00:00:00Z',
    });
    const rows = await log.listByCustomer('c1');
    expect(rows.map((r) => r.id)).toEqual(['2', '1']);
  });

  it('listByCustomer 可過濾 channel', async () => {
    const log = new InMemoryCommunicationLog();
    await log.append({
      id: '1',
      customerId: 'c1',
      channel: 'email',
      subject: 'a',
      direction: 'outbound',
      occurredAt: '2026-05-10T00:00:00Z',
    });
    await log.append({
      id: '2',
      customerId: 'c1',
      channel: 'order',
      subject: 'b',
      direction: 'outbound',
      occurredAt: '2026-05-15T00:00:00Z',
    });
    const rows = await log.listByCustomer('c1', { channels: ['email'] });
    expect(rows.length).toBe(1);
    expect(rows[0]?.id).toBe('1');
  });
});
