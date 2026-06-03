import { buildLogisticsCheckMacValue } from '@saas-factory/shipping-7eleven';
import { describe, expect, it } from 'vitest';

import { FamilyMartProvider } from './index.js';

const CFG = {
  merchantId: '2000132',
  hashKey: '5294y06JbISpM5x9',
  hashIv: 'v77hoKGq4kWxNNIS',
  env: 'sandbox' as const,
};

describe('FamilyMartProvider', () => {
  it('未授權 createShipment → throw', async () => {
    const p = new FamilyMartProvider(CFG);
    await expect(
      p.createShipment({
        tenantId: 't',
        orderId: 'O',
        method: 'cvs-pickup',
        sender: { name: 's', phone: '1' },
        receiver: { name: 'r', phone: '2' },
        pkg: { weightGrams: 500 },
        cvsStoreId: 'F-123',
      }),
    ).rejects.toThrow(/awaiting credentials/);
  });

  it('parseWebhook 正確 mac → valid', async () => {
    const p = new FamilyMartProvider(CFG);
    const params: Record<string, string> = {
      MerchantTradeNo: 'O-2',
      AllPayLogisticsID: 'L-2',
      RtnCode: '3022',
    };
    const mac = buildLogisticsCheckMacValue(params, CFG.hashKey, CFG.hashIv);
    const body = `MerchantTradeNo=O-2&AllPayLogisticsID=L-2&RtnCode=3022&CheckMacValue=${mac}`;
    const ev = await p.parseWebhook(body, {});
    expect(ev.signatureValid).toBe(true);
    expect(ev.status).toBe('delivered');
  });
});
