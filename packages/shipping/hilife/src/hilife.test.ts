import { buildLogisticsCheckMacValue } from '@saas-factory/shipping-7eleven';
import { describe, expect, it } from 'vitest';

import { HilifeProvider } from './index.js';

const CFG = {
  merchantId: '2000132',
  hashKey: '5294y06JbISpM5x9',
  hashIv: 'v77hoKGq4kWxNNIS',
  env: 'sandbox' as const,
};

describe('HilifeProvider', () => {
  it('createShipment → throw stub', async () => {
    const p = new HilifeProvider(CFG);
    await expect(
      p.createShipment({
        tenantId: 't',
        orderId: 'O',
        method: 'cvs-pickup',
        sender: { name: 's', phone: '1' },
        receiver: { name: 'r', phone: '2' },
        pkg: { weightGrams: 500 },
      }),
    ).rejects.toThrow(/awaiting credentials/);
  });

  it('parseWebhook 正確 mac → valid', async () => {
    const p = new HilifeProvider(CFG);
    const params: Record<string, string> = {
      MerchantTradeNo: 'O-3',
      AllPayLogisticsID: 'L-3',
      RtnCode: '2067',
    };
    const mac = buildLogisticsCheckMacValue(params, CFG.hashKey, CFG.hashIv);
    const body = `MerchantTradeNo=O-3&AllPayLogisticsID=L-3&RtnCode=2067&CheckMacValue=${mac}`;
    const ev = await p.parseWebhook(body, {});
    expect(ev.signatureValid).toBe(true);
    expect(ev.status).toBe('arrived');
  });
});
