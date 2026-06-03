/**
 * 結帳 endpoint（Phase 9 多商品擴充 — cart-based）。
 *
 * 取代過去單品直購：現在從 Cart 拉所有 items、套折扣、拆 bundle、建 Order、呼藍新。
 *
 * POST /api/checkout
 * body: { recipient: {name, phone, email, address?}, marketingOptIn?, cartId? }
 *
 * 流程：
 * 1. 讀 cart cookie cart-id（或 body 帶）
 * 2. quoteCheckoutFromCart 算金額 + 折扣 + 拆 bundle
 * 3. commitCheckout 建 Order + reserve inventory + cart status='converted'
 * 4. 呼 NewebPay charge → 拿 redirectUrl
 * 5. 回 { redirectUrl, orderNumber, total }
 *
 * 沒設 NEWEBPAY_* env → 503。
 * Cart 空 / cart 不存在 → 409。
 *
 * 向後相容：保留 productId / quantity query 風格走「臨時 cart」（不建 Cart 直接結帳，
 * 用 generateOrderNumber 暫存）；但本 endpoint 已不接 productId，呼叫端應走 /api/cart
 * 流程。後續可在 GET /checkout?productId=X 頁面內自動 add to cart 再 redirect /cart。
 */
import { NewebPayProvider } from '@saas-factory/payment-newebpay';
import { getPayload } from 'payload';

import { commitCheckout } from '@/lib/cart/checkout-from-cart';
import config from '@/payload.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CheckoutBody {
  cartId?: string;
  tenantId?: string;
  recipient?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
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

function readCookie(req: Request, key: string): string | null {
  const raw = req.headers.get('cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === key) return rest.join('=');
  }
  return null;
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

  const cartId = body.cartId ?? readCookie(req, 'cart-id');
  if (!cartId) {
    return Response.json({ error: '無 cartId（cookie 或 body 都沒帶）' }, { status: 400 });
  }
  const recipient = body.recipient ?? {};
  if (!recipient.name || !recipient.phone || !recipient.email) {
    return Response.json({ error: '需 recipient.name / phone / email' }, { status: 400 });
  }

  const payload = await getPayload({ config });

  const cartRes = await payload.find({
    collection: 'carts',
    where: {
      and: [{ cartId: { equals: cartId } }, { status: { equals: 'active' } }],
    },
    limit: 1,
  });
  const cart = cartRes.docs[0];
  if (!cart) {
    return Response.json({ error: 'cart not found 或非 active 狀態' }, { status: 409 });
  }
  const cartAny = cart as unknown as Record<string, unknown>;
  if (((cartAny.items as unknown[]) ?? []).length === 0) {
    return Response.json({ error: '購物車是空的' }, { status: 409 });
  }

  let commitResult;
  try {
    commitResult = await commitCheckout(
      payload,
      cartAny as unknown as Parameters<typeof commitCheckout>[1],
      {
        cartId,
        recipient: {
          name: recipient.name,
          phone: recipient.phone,
          email: recipient.email,
          address: recipient.address,
        },
        marketingOptIn: body.marketingOptIn,
      },
    );
  } catch (err) {
    return Response.json(
      { error: `commit failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }

  // 呼藍新 charge
  const origin = new URL(req.url).origin;
  const charge = await provider.charge({
    orderId: commitResult.orderNumber,
    tenantId: String(cartAny.tenantId ?? 'default'),
    method: 'credit',
    amount: { amount: commitResult.total, currency: commitResult.currency as 'TWD' },
    description: `訂單 ${commitResult.orderNumber}（${commitResult.items.length} 項）`,
    returnUrl: `${origin}/checkout/success?orderNumber=${commitResult.orderNumber}`,
    cancelUrl: `${origin}/checkout/cancel?orderNumber=${commitResult.orderNumber}`,
    notifyUrl: `${origin}/api/payments/newebpay/callback`,
    idempotencyKey: `order-${commitResult.orderNumber}`,
    buyer: { name: recipient.name, phone: recipient.phone, email: recipient.email },
  });

  return Response.json({
    ok: true,
    orderId: commitResult.orderId,
    orderNumber: commitResult.orderNumber,
    total: commitResult.total,
    currency: commitResult.currency,
    itemCount: commitResult.items.length,
    redirectUrl: charge.redirectUrl,
  });
}
