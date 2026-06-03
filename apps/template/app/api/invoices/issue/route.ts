/**
 * 電子發票開立 endpoint（B3 scaffolding）。
 *
 * POST /api/invoices/issue
 * body: { orderId, carrier?, buyerEmail?, buyerName?, buyerTaxId?, buyerAddress? }
 *
 * 預設 provider = ezpay（saas-factory-demos / 台灣多數 SaaS 客戶）。
 *
 * 流程：
 *   1. 認證：登入後台
 *   2. 拉 Order（必須 status='paid'）
 *   3. 從 Order.items 組 InvoiceItem[]
 *   4. 呼 EzpayInvoiceProvider.issue
 *   5. 結果寫 Payload invoices collection（InvoiceService 已封裝）
 *   6. audit-log（invoice.issue）
 *
 * 沒設 EZPAY_* env → 503 fail-closed。
 *
 * 注意：本 endpoint 是「手動觸發」版；自動開立（依 invoice mode=auto）由
 * Order.afterChange hook 處理（後續 milestone）。
 */
import { PayloadAuditRecorder } from '@saas-factory/audit-log';
import { EzpayInvoiceProvider } from '@saas-factory/invoice-ezpay';
import { headers as nextHeaders } from 'next/headers';
import { getPayload } from 'payload';

import config from '@/payload.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface IssueBody {
  orderId?: string;
  carrierType?: 'cloud' | 'mobile-barcode' | 'natural-person' | 'paper' | 'company' | 'donation';
  carrierId?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerTaxId?: string;
  buyerAddress?: string;
  donationCode?: string;
}

function ezpayFromEnv(): EzpayInvoiceProvider | null {
  const merchantId = process.env.EZPAY_MERCHANT_ID;
  const hashKey = process.env.EZPAY_HASH_KEY;
  const hashIv = process.env.EZPAY_HASH_IV;
  const env = process.env.EZPAY_ENV === 'production' ? 'production' : 'sandbox';
  if (!merchantId || !hashKey || !hashIv) return null;
  return new EzpayInvoiceProvider({ merchantId, hashKey, hashIv, env });
}

/**
 * 把 IssueBody.carrierType（公開 API 易讀字串）對應到 InvoiceCore.InvoiceCarrier。
 *
 * provider 與 Payload schema 共用同一份 InvoiceCarrier 定義，所以一個 carrier
 * 物件兩邊都通。
 */
function mapCarrier(body: IssueBody): {
  category: 'B2C' | 'B2B';
  carrier: {
    type:
      | 'mobile-barcode'
      | 'natural-person-cert'
      | 'company-tax-id'
      | 'donation'
      | 'member'
      | 'paper';
    value?: string;
    donationCode?: string;
  };
} {
  if (body.carrierType === 'company' && body.buyerTaxId) {
    return {
      category: 'B2B',
      carrier: { type: 'company-tax-id', value: body.buyerTaxId },
    };
  }
  if (body.carrierType === 'mobile-barcode' && body.carrierId) {
    return {
      category: 'B2C',
      carrier: { type: 'mobile-barcode', value: body.carrierId },
    };
  }
  if (body.carrierType === 'natural-person' && body.carrierId) {
    return {
      category: 'B2C',
      carrier: { type: 'natural-person-cert', value: body.carrierId },
    };
  }
  if (body.carrierType === 'donation' && body.donationCode) {
    return {
      category: 'B2C',
      carrier: { type: 'donation', donationCode: body.donationCode },
    };
  }
  if (body.carrierType === 'paper') {
    return {
      category: 'B2C',
      carrier: { type: 'paper' },
    };
  }
  // 預設會員載具（雲端發票）
  return {
    category: 'B2C',
    carrier: { type: 'member' },
  };
}

export async function POST(req: Request): Promise<Response> {
  const provider = ezpayFromEnv();
  if (!provider) {
    return Response.json(
      { error: 'ezPay 發票尚未設定（EZPAY_MERCHANT_ID / HASH_KEY / HASH_IV 未注入）' },
      { status: 503 },
    );
  }

  const payload = await getPayload({ config });
  const h = await nextHeaders();
  const auth = await payload.auth({ headers: h });
  if (!auth.user) {
    return Response.json({ error: '需要登入後台' }, { status: 401 });
  }

  let body: IssueBody;
  try {
    body = (await req.json()) as IssueBody;
  } catch {
    return Response.json({ error: 'JSON body 解析失敗' }, { status: 400 });
  }

  if (!body.orderId) {
    return Response.json({ error: '需 orderId' }, { status: 400 });
  }

  const order = await payload.findByID({
    collection: 'orders',
    id: body.orderId,
    disableErrors: true,
  });
  if (!order) return Response.json({ error: 'order not found' }, { status: 404 });
  const orderAny = order as unknown as Record<string, unknown>;
  if (orderAny.status !== 'paid') {
    return Response.json(
      { error: `Order 狀態為 ${orderAny.status}，僅 paid 可開立發票` },
      { status: 409 },
    );
  }

  const items =
    (orderAny.items as Array<Record<string, unknown>> | undefined) ?? [];
  const total = (orderAny.total as number) ?? 0;
  const tenantId = (orderAny.tenantId as string) ?? 'default';

  const { category, carrier } = mapCarrier(body);

  let result;
  try {
    result = await provider.issue({
      orderId: String(orderAny.orderNumber ?? body.orderId),
      tenantId,
      category,
      carrier,
      buyerName: body.buyerName,
      buyerTaxId: body.buyerTaxId,
      buyerAddress: body.buyerAddress,
      buyerEmail: body.buyerEmail,
      buyerPhone: body.buyerPhone,
      items: items.map((it) => ({
        name: (it.title as string) ?? 'item',
        unitPrice: (it.unitPrice as number) ?? 0,
        quantity: (it.quantity as number) ?? 1,
        amount: ((it.unitPrice as number) ?? 0) * ((it.quantity as number) ?? 1),
        unit: '件',
      })),
      totalAmount: total,
    });
  } catch (err) {
    return Response.json(
      { error: `provider issue 失敗：${err instanceof Error ? err.message : String(err)}` },
      { status: 502 },
    );
  }

  // 寫 invoices collection
  const invoiceDoc = await payload.create({
    collection: 'invoices',
    data: {
      invoiceNumber: result.invoiceNumber,
      tenantId,
      orderId: String(orderAny.orderNumber ?? body.orderId),
      provider: 'ezpay',
      status: result.status,
      category,
      carrier,
      buyer: {
        name: body.buyerName,
        taxId: body.buyerTaxId,
        address: body.buyerAddress,
        email: body.buyerEmail,
        phone: body.buyerPhone,
      },
      totalAmount: total,
      items: items.map((it) => ({
        name: (it.title as string) ?? 'item',
        unitPrice: (it.unitPrice as number) ?? 0,
        quantity: (it.quantity as number) ?? 1,
      })),
      // Payload schema 不含 providerPayload；raw 改寫進 audit-log metadata
      issuedAt: result.issuedAt,
    },
    overrideAccess: true,
  });

  // audit-log
  const auditor = new PayloadAuditRecorder(payload);
  await auditor
    .record({
      userId: String(auth.user.id),
      tenantId,
      action: 'invoice.issue',
      resourceType: 'Invoice',
      resourceId: String(invoiceDoc.id),
      after: {
        invoiceNumber: result.invoiceNumber,
        provider: 'ezpay',
        category,
        totalAmount: total,
      },
      metadata: {
        orderId: String(body.orderId),
        orderNumber: orderAny.orderNumber,
        carrierType: body.carrierType,
      },
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: req.headers.get('user-agent') ?? undefined,
    })
    .catch((err: unknown) => {
      console.warn(
        '[invoice/issue] audit-log 寫入失敗（不阻擋回應）：',
        err instanceof Error ? err.message : String(err),
      );
    });

  return Response.json({
    ok: true,
    invoiceId: invoiceDoc.id,
    invoiceNumber: result.invoiceNumber,
    issuedAt: result.issuedAt,
  });
}
