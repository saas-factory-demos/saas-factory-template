/**
 * 訂閱建立 endpoint（B2）。
 *
 * POST /api/subscriptions/create
 * body: { productId, recipient: {name, phone, email}, methodId: 'credit', marketingOptIn? }
 *
 * 流程：
 * 1. 拉 Product（必須 status='published' + isSubscription=true）
 * 2. 建 Subscription record（status='pending'）
 * 3. 呼 NewebPay.createSubscription → 拿 redirectUrl + providerSubscriptionId
 * 4. 更新 Subscription.providerSubscriptionId
 * 5. 回 redirectUrl 給前端跳藍新 hosted page
 *
 * 第一期成功扣款後藍新 webhook 會回 subscription.charged，本服務 callback handler
 * 改 status → active 並建第一筆 Payment。
 *
 * 沒設 NEWEBPAY_* env → 503 fail-closed。
 * Product 非 subscription / 非 published → 409。
 */
import { NewebPayProvider } from '@saas-factory/payment-newebpay';
import { generateOrderNumber } from '@saas-factory/shop-orders';
import { getPayload } from 'payload';

import config from '@/payload.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CreateBody {
  productId?: string;
  tenantId?: string;
  recipient?: { name?: string; phone?: string; email?: string };
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

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return Response.json({ error: 'JSON body 解析失敗' }, { status: 400 });
  }

  const productId = body.productId;
  const recipient = body.recipient ?? {};
  const tenantId = body.tenantId ?? 'default';
  if (!productId) return Response.json({ error: '需 productId' }, { status: 400 });
  if (!recipient.name || !recipient.phone || !recipient.email) {
    return Response.json({ error: '需 recipient.name / phone / email' }, { status: 400 });
  }

  const payload = await getPayload({ config });
  const product = await payload.findByID({
    collection: 'products',
    id: productId,
    disableErrors: true,
  });
  if (!product) return Response.json({ error: 'product not found' }, { status: 404 });

  const productAny = product as unknown as Record<string, unknown>;
  if (productAny.status !== 'published') {
    return Response.json(
      { error: `商品狀態 ${productAny.status}，無法訂閱` },
      { status: 409 },
    );
  }
  if (!productAny.isSubscription) {
    return Response.json({ error: '商品非訂閱型，請走 /api/checkout' }, { status: 409 });
  }
  const unitPriceRaw = productAny.unitPrice;
  const unitPrice = typeof unitPriceRaw === 'number' ? unitPriceRaw : 0;
  if (unitPrice <= 0) {
    return Response.json({ error: '商品價格未設定' }, { status: 409 });
  }
  const interval = (productAny.subscriptionInterval as 'day' | 'week' | 'month' | 'year') ?? 'month';
  const intervalCount = (productAny.subscriptionIntervalCount as number) ?? 1;
  const currency = (productAny.currency as string) ?? 'TWD';

  // 建 pending Subscription（先用 orderNumber 暫代 providerSubscriptionId，
  // 藍新回 callback 才更新真實 id）
  const orderNumber = generateOrderNumber(Math.floor(Date.now() / 1000) % 100000);
  const subscription = await payload.create({
    collection: 'subscriptions',
    data: {
      tenantId,
      guestEmail: recipient.email,
      guestPhone: recipient.phone,
      product: Number(productId),
      provider: 'newebpay',
      providerSubscriptionId: orderNumber, // 暫值，callback 收到後更新
      status: 'pending',
      amount: unitPrice,
      currency: currency as 'TWD',
      interval,
      intervalCount,
    },
    overrideAccess: true,
  });

  // 呼藍新 createSubscription
  const origin = new URL(req.url).origin;
  const result = await provider.createSubscription({
    orderId: orderNumber,
    tenantId,
    method: 'credit',
    amount: { amount: unitPrice, currency: currency as 'TWD' },
    interval,
    intervalCount,
    startImmediately: true,
    returnUrl: `${origin}/checkout/success?orderNumber=${orderNumber}&kind=subscription`,
    notifyUrl: `${origin}/api/payments/newebpay/callback`,
    idempotencyKey: `sub-${orderNumber}`,
    buyer: { name: recipient.name, phone: recipient.phone, email: recipient.email },
  });

  // 更新 raw payload（id 等首期 callback 才有）
  await payload.update({
    collection: 'subscriptions',
    id: subscription.id,
    data: { rawPayload: result.raw },
    overrideAccess: true,
  });

  return Response.json({
    ok: true,
    subscriptionId: subscription.id,
    orderNumber,
    redirectUrl: result.redirectUrl,
  });
}
