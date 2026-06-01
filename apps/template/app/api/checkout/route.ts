/**
 * 結帳 endpoint（goal-14 scaffolding MVP）。
 *
 * POST /api/checkout
 * body: { productId, quantity, recipient: {name, phone, email, address?}, methodId, marketingOptIn, tenantId? }
 *
 * 流程：
 * 1. 從 Payload 撈 product（驗 productId 存在）
 * 2. 計算金額（unit price × quantity，目前無運費/稅）
 * 3. 建 Order（status='pending-payment'）
 * 4. 呼叫 NewebPayProvider.charge → 拿 redirectUrl
 * 5. 回 200 { redirectUrl }（前端 window.location 跳轉）
 *
 * 範圍說明（scaffolding）：
 * - 不接 Cart / Inventory / Discount 引擎（後續 milestone）
 * - 不算運費 / 稅（運費 = 0，稅 = 0；後續接 shop-shipping / tax 模組）
 * - 不簽 idempotencyKey 持久化（用 orderNumber 暫代；多次提交會建多單）
 * - 訪客結帳（userId = null）；登入會員之後做
 * - 只支援信用卡（credit）；其他付款方式之後做
 *
 * 沒 NEWEBPAY_* env → 503 fail-closed。
 */
import { NewebPayProvider } from '@saas-factory/payment-newebpay';
import { generateOrderNumber } from '@saas-factory/shop-orders';
import { getPayload } from 'payload';

import config from '@/payload.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CheckoutBody {
  productId?: string;
  quantity?: number;
  tenantId?: string;
  recipient?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  methodId?: 'credit';
  marketingOptIn?: boolean;
}

function newebpayFromEnv(): NewebPayProvider | null {
  const merchantId = process.env.NEWEBPAY_MERCHANT_ID;
  const hashKey = process.env.NEWEBPAY_HASH_KEY;
  const hashIv = process.env.NEWEBPAY_HASH_IV;
  const env = process.env.NEWEBPAY_ENV === 'production' ? 'production' : 'sandbox';
  if (!merchantId || !hashKey || !hashIv) return null;
  return new NewebPayProvider({ merchantId, hashKey, hashIv, env });
}

export async function POST(req: Request): Promise<Response> {
  const provider = newebpayFromEnv();
  if (!provider) {
    return Response.json(
      { error: '藍新尚未設定（NEWEBPAY_MERCHANT_ID / HASH_KEY / HASH_IV 未注入）' },
      { status: 503 },
    );
  }

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return Response.json({ error: 'JSON body 解析失敗' }, { status: 400 });
  }

  const productId = body.productId;
  const quantity = body.quantity ?? 1;
  const tenantId = body.tenantId ?? 'default';
  const recipient = body.recipient ?? {};
  if (!productId) return Response.json({ error: '需 productId' }, { status: 400 });
  if (!recipient.name || !recipient.phone || !recipient.email) {
    return Response.json({ error: '需 recipient.name / phone / email' }, { status: 400 });
  }
  if (quantity < 1 || !Number.isInteger(quantity)) {
    return Response.json({ error: 'quantity 必須 >= 1 整數' }, { status: 400 });
  }

  const payload = await getPayload({ config });

  const product = await payload.findByID({
    collection: 'products',
    id: productId,
    disableErrors: true,
  });
  if (!product) return Response.json({ error: 'product not found' }, { status: 404 });

  // scaffolding：products collection 是 stub 沒 price 欄位；金額暫用 fallback 100 TWD
  const productAny = product as unknown as Record<string, unknown>;
  const unitPriceRaw = productAny.price ?? productAny.unitPrice ?? 100;
  const unitPrice = typeof unitPriceRaw === 'number' ? unitPriceRaw : 100;
  const subtotal = unitPrice * quantity;
  const total = subtotal; // 運費 / 稅暫 0

  // 暫用秒級時間戳當 dailySeq，scaffolding 階段「沒接 OrderNumberProvider」；
  // 後續 milestone 換成 atomic counter（Payload `order-counters` collection）。
  const dailySeq = Math.floor(Date.now() / 1000) % 100000;
  const orderNumber = generateOrderNumber(dailySeq);
  const order = await payload.create({
    collection: 'orders',
    data: {
      orderNumber,
      tenantId,
      guestEmail: recipient.email,
      guestPhone: recipient.phone,
      status: 'pending-payment',
      items: [
        {
          productId,
          sku: (productAny.slug as string) ?? productId,
          title: (productAny.title as string) ?? '商品',
          unitPrice,
          quantity,
        },
      ] as unknown as { value: unknown },
      currency: 'TWD',
      subtotal,
      discountTotal: 0,
      shippingFee: 0,
      taxAmount: 0,
      total,
      paymentMethod: body.methodId ?? 'credit',
      paymentProvider: 'newebpay',
      marketingOptIn: Boolean(body.marketingOptIn),
    },
    overrideAccess: true,
  });

  // 算 returnUrl / notifyUrl（用 request origin，避免 hardcoded domain）
  const origin = new URL(req.url).origin;
  const charge = await provider.charge({
    orderId: orderNumber, // 給藍新 MerchantOrderNo
    tenantId,
    method: 'credit',
    amount: { amount: total, currency: 'TWD' },
    description: `${(productAny.title as string) ?? '商品'} × ${quantity}`,
    returnUrl: `${origin}/checkout/success?orderNumber=${orderNumber}`,
    cancelUrl: `${origin}/checkout/cancel?orderNumber=${orderNumber}`,
    notifyUrl: `${origin}/api/payments/newebpay/callback`,
    idempotencyKey: `order-${orderNumber}`,
    buyer: { name: recipient.name, phone: recipient.phone, email: recipient.email },
  });

  return Response.json({
    ok: true,
    orderId: order.id,
    orderNumber,
    redirectUrl: charge.redirectUrl,
    paymentInstructions: charge.paymentInstructions,
  });
}
