import type {
  Cart,
  CartItem,
  CartStore,
  FreeShippingProgress,
  FreeShippingThreshold,
  ProductStatusChecker,
} from './types.js';

/**
 * 產生 cart id。
 */
function generateCartId(): string {
  return `cart_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 計算購物車小計（不含折扣 / 運費 / 稅）。
 */
export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

/**
 * 計算滿額免運進度。
 */
export function calcFreeShippingProgress(
  subtotal: number,
  threshold: FreeShippingThreshold,
): FreeShippingProgress {
  if (subtotal >= threshold.amount) {
    return { reached: true, remaining: 0, progress: 1 };
  }
  return {
    reached: false,
    remaining: threshold.amount - subtotal,
    progress: subtotal / threshold.amount,
  };
}

export interface CartServiceConfig {
  store: CartStore;
  statusChecker?: ProductStatusChecker;
  now?: () => number;
}

/**
 * 購物車服務：加減商品 / 跨裝置合併 / 庫存驗證。
 */
export class CartService {
  constructor(private readonly config: CartServiceConfig) {}

  private now(): number {
    return this.config.now?.() ?? Date.now();
  }

  /**
   * 取得或建立購物車（依 user → session 順序）。
   */
  async getOrCreate(opts: {
    tenantId: string;
    userId: string | null;
    sessionId: string;
    currency?: string;
  }): Promise<Cart> {
    if (opts.userId) {
      const existing = await this.config.store.getByUserId(opts.userId, opts.tenantId);
      if (existing) return existing;
    }
    const anon = await this.config.store.getBySessionId(opts.sessionId, opts.tenantId);
    if (anon) return anon;
    const now = this.now();
    const cart: Cart = {
      id: generateCartId(),
      tenantId: opts.tenantId,
      userId: opts.userId,
      sessionId: opts.sessionId,
      items: [],
      createdAt: now,
      updatedAt: now,
      currency: opts.currency ?? 'TWD',
    };
    await this.config.store.save(cart);
    return cart;
  }

  /**
   * 加入或更新商品數量。
   */
  async addItem(cartId: string, item: Omit<CartItem, 'addedAt'>): Promise<Cart> {
    const cart = await this.requireCart(cartId);
    const existing = cart.items.find((i) => i.variantId === item.variantId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.items.push({ ...item, addedAt: this.now() });
    }
    cart.updatedAt = this.now();
    await this.config.store.save(cart);
    return cart;
  }

  /**
   * 更新單品數量。0 視為移除。
   */
  async setQuantity(cartId: string, variantId: string, quantity: number): Promise<Cart> {
    const cart = await this.requireCart(cartId);
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.variantId !== variantId);
    } else {
      const item = cart.items.find((i) => i.variantId === variantId);
      if (item) item.quantity = quantity;
    }
    cart.updatedAt = this.now();
    await this.config.store.save(cart);
    return cart;
  }

  /**
   * 移除商品。
   */
  async removeItem(cartId: string, variantId: string): Promise<Cart> {
    return this.setQuantity(cartId, variantId, 0);
  }

  /**
   * 登入後合併匿名購物車到使用者購物車。匿名 cart 將被刪除。
   */
  async merge(opts: {
    userId: string;
    anonCartId: string;
    tenantId: string;
  }): Promise<Cart> {
    const anon = await this.config.store.get(opts.anonCartId);
    if (!anon) {
      return this.getOrCreate({
        tenantId: opts.tenantId,
        userId: opts.userId,
        sessionId: opts.userId,
      });
    }
    const userCart =
      (await this.config.store.getByUserId(opts.userId, opts.tenantId)) ??
      (await this.getOrCreate({
        tenantId: opts.tenantId,
        userId: opts.userId,
        sessionId: opts.userId,
      }));

    for (const item of anon.items) {
      const existing = userCart.items.find((i) => i.variantId === item.variantId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        userCart.items.push(item);
      }
    }
    userCart.updatedAt = this.now();
    await this.config.store.save(userCart);
    await this.config.store.delete(anon.id);
    return userCart;
  }

  /**
   * 驗證購物車並自動移除下架／缺貨商品。
   */
  async validate(cartId: string): Promise<{
    cart: Cart;
    removed: string[];
    adjusted: Array<{ variantId: string; from: number; to: number }>;
  }> {
    const cart = await this.requireCart(cartId);
    const checker = this.config.statusChecker;
    if (!checker) return { cart, removed: [], adjusted: [] };

    const removed: string[] = [];
    const adjusted: Array<{ variantId: string; from: number; to: number }> = [];
    const keep: CartItem[] = [];
    for (const item of cart.items) {
      const available = await checker.getAvailable(item.variantId);
      if (available <= 0) {
        removed.push(item.variantId);
        continue;
      }
      if (available < item.quantity) {
        adjusted.push({ variantId: item.variantId, from: item.quantity, to: available });
        keep.push({ ...item, quantity: available });
      } else {
        keep.push(item);
      }
    }
    cart.items = keep;
    cart.updatedAt = this.now();
    await this.config.store.save(cart);
    return { cart, removed, adjusted };
  }

  private async requireCart(cartId: string): Promise<Cart> {
    const cart = await this.config.store.get(cartId);
    if (!cart) throw new Error(`cart not found: ${cartId}`);
    return cart;
  }
}
