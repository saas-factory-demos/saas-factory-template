import type { Cart, CartStore } from './types.js';

/**
 * 記憶體 CartStore（測試用）。
 */
export class InMemoryCartStore implements CartStore {
  private readonly carts = new Map<string, Cart>();

  async get(cartId: string): Promise<Cart | null> {
    return this.carts.get(cartId) ?? null;
  }

  async getByUserId(userId: string, tenantId: string): Promise<Cart | null> {
    for (const c of this.carts.values()) {
      if (c.userId === userId && c.tenantId === tenantId) return c;
    }
    return null;
  }

  async getBySessionId(sessionId: string, tenantId: string): Promise<Cart | null> {
    for (const c of this.carts.values()) {
      if (c.sessionId === sessionId && c.tenantId === tenantId && !c.userId) return c;
    }
    return null;
  }

  async save(cart: Cart): Promise<void> {
    this.carts.set(cart.id, cart);
  }

  async delete(cartId: string): Promise<void> {
    this.carts.delete(cartId);
  }
}
