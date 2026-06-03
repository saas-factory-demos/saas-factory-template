/**
 * Upsell 模組型別（goal 03 §11）。
 */

/**
 * Offer 出現位置。
 */
export type OfferPlacement =
  | 'order-bump' // 結帳送出前
  | 'oto' // 訂單完成後 funnel
  | 'cross-sell-pdp' // 商品頁
  | 'cross-sell-cart' // 購物車
  | 'cross-sell-checkout'; // 結帳頁底部

/**
 * Offer 觸發條件。
 */
export type OfferTrigger =
  | { type: 'has_variant'; variantId: string }
  | { type: 'has_category'; categoryId: string }
  | { type: 'min_amount'; amount: number };

/**
 * Offer（每筆對應一個推薦商品 + 折扣）。
 */
export interface Offer {
  id: string;
  tenantId: string;
  name: string;
  placement: OfferPlacement;
  /** 推薦的商品 variant。 */
  variantId: string;
  /** 顯示標題（給前端用）。 */
  headline: string;
  /** 補充描述。 */
  description?: string;
  /** 此 offer 顯示售價（已含折扣，前端不需再算）。 */
  price: number;
  /** 原價（劃線顯示用）。 */
  compareAtPrice?: number;
  /** 觸發條件，AND 邏輯。 */
  triggers: OfferTrigger[];
  /** 排序，數字越大越優先。 */
  priority: number;
  /** OTO funnel 順序（oto 用）。 */
  funnelStep?: number;
  /** 同位置若有多筆 active，依 priority 取最高一筆。 */
  active: boolean;
  startsAt?: string;
  endsAt?: string;
}

/**
 * 評估上下文。
 */
export interface OfferContext {
  tenantId: string;
  /** 目前購物車 / 訂單中的 variant + category。 */
  cart: Array<{ variantId: string; categoryIds?: string[] }>;
  /** 小計（用於 min_amount 條件）。 */
  subtotal: number;
  now?: Date;
}

/**
 * 紀錄一次 offer 互動（用於計算轉換率）。
 */
export interface OfferInteraction {
  id: string;
  tenantId: string;
  offerId: string;
  userId?: string;
  sessionId?: string;
  /** 展示 / 接受 / 拒絕。 */
  event: 'shown' | 'accepted' | 'declined';
  occurredAt: string;
}

/**
 * 統計回傳。
 */
export interface OfferStats {
  offerId: string;
  shown: number;
  accepted: number;
  declined: number;
  /** acceptance rate = accepted / shown。 */
  acceptanceRate: number;
}

/**
 * 儲存層介面。
 */
export interface OfferStore {
  listOffers(tenantId: string, placement: OfferPlacement): Promise<Offer[]>;
  getOffer(id: string): Promise<Offer | null>;
  saveOffer(offer: Offer): Promise<void>;
  recordInteraction(interaction: OfferInteraction): Promise<void>;
  listInteractions(offerId: string): Promise<OfferInteraction[]>;
}
