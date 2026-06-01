import { describe, expect, it } from 'vitest';

import {
  SevenElevenProvider,
  buildLogisticsCheckMacValue,
} from './index.js';

const CFG = {
  merchantId: '2000132',
  hashKey: '5294y06JbISpM5x9',
  hashIv: 'v77hoKGq4kWxNNIS',
  env: 'sandbox' as const,
};

describe('SevenElevenProvider', () => {
  it('createShipment 未授權 → throw', async () => {
    const p = new SevenElevenProvider(CFG);
    await expect(
      p.createShipment({
        tenantId: 't',
        orderId: 'O',
        method: 'cvs-pickup-cod',
        sender: { name: 's', phone: '1' },
        receiver: { name: 'r', phone: '2' },
        pkg: { weightGrams: 500, collectAmount: 100 },
        cvsStoreId: '131386',
      }),
    ).rejects.toThrow(/awaiting credentials/);
  });

  it('parseWebhook 缺 mac → invalid', async () => {
    const p = new SevenElevenProvider(CFG);
    const ev = await p.parseWebhook('MerchantTradeNo=O-1', {});
    expect(ev.signatureValid).toBe(false);
  });

  it('parseWebhook 正確 mac → valid + status 對映', async () => {
    const p = new SevenElevenProvider(CFG);
    const params: Record<string, string> = {
      MerchantTradeNo: 'O-1',
      AllPayLogisticsID: 'L-1',
      RtnCode: '3022',
    };
    const mac = buildLogisticsCheckMacValue(params, CFG.hashKey, CFG.hashIv);
    const body = `MerchantTradeNo=${params.MerchantTradeNo}&AllPayLogisticsID=${params.AllPayLogisticsID}&RtnCode=${params.RtnCode}&CheckMacValue=${mac}`;
    const ev = await p.parseWebhook(body, {});
    expect(ev.signatureValid).toBe(true);
    expect(ev.status).toBe('delivered');
    expect(ev.trackingNumber).toBe('L-1');
  });
});
