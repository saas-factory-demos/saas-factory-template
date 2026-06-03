/**
 * 折扣引擎型別（goal 03 §5）。
 *
 * Lock：ADR-0011 §03-05 v1。
 */

/**
 * 折扣規則類型。
 */
export type DiscountRuleType =
  | 'percentage_off'
  | 'fixed_off'
  | 'free_shipping'
  | 'buy_x_get_y'
  | 'tiered'
  | 'bundle'
  | 'nth_item_off'
  | 'gift'
  | 'first_purchase'
  | 'subscription_loyalty'
  | 'custom';

/**
 * 折扣條件。
 */
export type DiscountCondition =
  | { type: 'min_amount'; amount: number }
  | { type: 'min_quantity'; quantity: number }
  | { type: 'member_tier'; tiers: string[] }
  | { type: 'first_purchase' }
  | { type: 'birthday_month' }
  | { type: 'specific_items'; variantIds: string[] }
  | { type: 'specific_categories'; categoryIds: string[] }
  | { type: 'date_range'; from: string; to: string }
  | { type: 'day_of_week'; days: number[] }
  | { type: 'time_of_day'; from: string; to: string }
  | { type: 'customer_tag'; tags: string[] }
  | { type: 'site_type'; siteTypes: string[] }
  | { type: 'custom'; key: string; value: unknown };

/**
 * 折扣規則。
 */
export interface DiscountRule {
  id: string;
  tenantId: string;
  name: string;
  type: DiscountRuleType;
  /** 規則具體參數。 */
  params: Record<string, unknown>;
  /** 條件 AND，全 true 才生效。 */
  conditions: DiscountCondition[];
  /** 是否可與其他折扣堆疊。 */
  stackable: boolean;
  /** 優先序，越大越先套用（用於 stackable=false 時擇優）。 */
  priority: number;
  /** 最大使用次數。 */
  maxUses?: number;
  /** 已使用次數。 */
  usedCount: number;
  /** 每客戶最多使用次數。 */
  maxUsesPerUser?: number;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
}

/**
 * 套用 context。
 */
export interface DiscountContext {
  /** 購物車項目。 */
  items: Array<{
    variantId: string;
    productId: string;
    categoryIds?: string[];
    unitPrice: number;
    quantity: number;
  }>;
  /** 小計。 */
  subtotal: number;
  /** 已套用的客戶 tag。 */
  customerTags?: string[];
  /** 會員等級。 */
  memberTier?: string;
  /** 是否為首購。 */
  isFirstPurchase?: boolean;
  /** 客戶生日月份 1-12。 */
  birthdayMonth?: number;
  /**
   * 客戶針對「個別規則」的使用次數，key 為 `DiscountRule.id`。
   *
   * 每條 `maxUsesPerUser` 不同的規則需要分別查紀錄，
   * 共用單一 `customerUsageCount` 會在多個規則同時啟用時誤判（例如 A 已用 3 次、B 0 次卻一起被擋）。
   */
  customerUsageCounts?: Record<string, number>;
  /** 站別。 */
  siteType?: string;
  /** 計算時間（測試可注入）。 */
  now?: Date;
}

/**
 * 套用結果。
 */
export interface DiscountResult {
  ruleId: string;
  ruleName: string;
  /** 折扣金額（運費折扣放 shippingDiscount）。 */
  amount: number;
  /** 運費折扣金額（free_shipping 用）。 */
  shippingDiscount?: number;
  /** 贈品 SKU（gift 用）。 */
  giftVariantId?: string;
  /** 分攤到的 item 索引（部分規則套到特定品）。 */
  allocatedItemIndexes?: number[];
}
