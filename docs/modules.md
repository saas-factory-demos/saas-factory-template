# 模組規格

每個 package 的職責、介面、相依關係。

## 抽象層介面（必須先做）

### PaymentProvider

```typescript
export interface PaymentProvider {
  readonly name: string;
  readonly supportedMethods: PaymentMethod[];
  readonly capabilities: {
    refund: boolean;
    partialRefund: boolean;
    subscription: boolean;
    installment: boolean;
  };
  
  charge(params: ChargeParams): Promise<ChargeResult>;
  refund(params: RefundParams): Promise<RefundResult>;
  partialRefund(params: PartialRefundParams): Promise<RefundResult>;
  subscribe?(params: SubscribeParams): Promise<SubscribeResult>;
  cancelSubscription?(id: string): Promise<void>;
  query(orderId: string): Promise<PaymentStatus>;
  handleCallback(req: Request): Promise<CallbackResult>;
  generatePaymentForm?(params: FormParams): { html: string; redirectUrl?: string };
}
```

### ShippingProvider

```typescript
export interface ShippingProvider {
  readonly name: string;
  readonly supportsCOD: boolean;
  readonly supportsTracking: boolean;
  
  calculateFee(params: FeeParams): Promise<number>;
  createShipment(params: CreateShipmentParams): Promise<ShipmentResult>;
  cancelShipment(trackingNumber: string): Promise<void>;
  trackShipment(trackingNumber: string): Promise<TrackingInfo>;
  generateLabel?(shipmentId: string): Promise<Buffer>;  // 列印標籤
}
```

### InvoiceProvider

```typescript
export interface InvoiceProvider {
  readonly name: string;
  readonly supportsB2B: boolean;
  
  issue(params: IssueParams): Promise<InvoiceResult>;
  void(invoiceNumber: string): Promise<void>;
  allowance(params: AllowanceParams): Promise<AllowanceResult>;  // 折讓
  query(invoiceNumber: string): Promise<InvoiceStatus>;
}
```

### NotificationChannel

```typescript
export interface NotificationChannel {
  readonly name: string;
  readonly type: 'email' | 'sms' | 'line' | 'push';
  
  send(params: SendParams): Promise<SendResult>;
  sendBatch(params: BatchSendParams): Promise<BatchSendResult>;
  renderTemplate(templateId: string, data: any): Promise<RenderedContent>;
}
```

### VideoProvider

```typescript
export interface VideoProvider {
  readonly name: string;
  
  upload(file: File): Promise<{ videoId: string; uploadUrl?: string }>;
  getPlaybackUrl(videoId: string, params: PlaybackParams): Promise<string>;  // 含 signed URL
  getThumbnail(videoId: string): Promise<string>;
  delete(videoId: string): Promise<void>;
  generateWatermark?(params: WatermarkParams): Promise<string>;
}
```

## 折扣引擎（DiscountEngine）

統一服務電商、課程、LP、訂閱的折扣計算。

```typescript
export type DiscountRule =
  | { type: 'percentage_off'; value: number }
  | { type: 'fixed_off'; value: number }
  | { type: 'free_shipping' }
  | { type: 'buy_x_get_y'; buyQty: number; getFreeQty: number; sameItem?: boolean }
  | { type: 'tiered'; tiers: Array<{ minAmount: number; offAmount: number }> }
  | { type: 'bundle'; itemIds: string[]; bundlePrice: number }
  | { type: 'nth_item_off'; nth: number; offPercentage: number }
  | { type: 'gift'; giftItemId: string; giftQty: number }
  | { type: 'first_purchase'; offPercentage: number }
  | { type: 'subscription_loyalty'; minMonths: number; offPercentage: number }
  | { type: 'custom'; handler: string; params?: any };

export type DiscountCondition =
  | { type: 'min_amount'; value: number }
  | { type: 'min_quantity'; value: number }
  | { type: 'member_tier'; tiers: string[] }
  | { type: 'first_purchase' }
  | { type: 'birthday_month' }
  | { type: 'specific_items'; ids: string[] }
  | { type: 'specific_categories'; ids: string[] }
  | { type: 'date_range'; start: Date; end: Date }
  | { type: 'day_of_week'; days: number[] }
  | { type: 'time_of_day'; start: string; end: string }
  | { type: 'customer_tag'; includes?: string[]; excludes?: string[] }
  | { type: 'site_type'; types: SiteType[] }
  | { type: 'custom'; handler: string; params?: any };

export interface Discount {
  id: string;
  name: string;
  code?: string;
  description?: string;
  conditions: DiscountCondition[];   // AND 邏輯
  rules: DiscountRule[];
  stackable: boolean;
  priority: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  active: boolean;
  startsAt?: Date;
  endsAt?: Date;
}

export interface DiscountContext {
  items: Array<{
    id: string;
    type: 'product' | 'course' | 'lp-plan' | 'subscription';
    categoryIds: string[];
    quantity: number;
    unitPrice: number;
  }>;
  customer?: {
    id: string;
    tier?: string;
    tags: string[];
    firstPurchase: boolean;
    birthdayMonth?: number;
  };
  appliedCodes: string[];
  siteType: SiteType;
}

export interface DiscountEngine {
  evaluate(context: DiscountContext): Promise<DiscountResult>;
  validateCode(code: string, context: DiscountContext): Promise<ValidationResult>;
  registerCustomRule(handler: string, fn: CustomRuleFn): void;
  registerCustomCondition(handler: string, fn: CustomConditionFn): void;
}
```

## 行銷自動化引擎（AutomationEngine）

跨所有網站類型通用的「觸發 → 條件 → 動作」引擎。

```typescript
export interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  delay?: { value: number; unit: 'minutes' | 'hours' | 'days' };
  actions: AutomationAction[];
  metadata?: Record<string, any>;
}

export type AutomationAction =
  | { type: 'send_email'; templateId: string; from?: string }
  | { type: 'send_line'; templateId: string }
  | { type: 'send_sms'; templateId: string }
  | { type: 'send_push'; title: string; body: string; url?: string }
  | { type: 'add_customer_tag'; tag: string }
  | { type: 'remove_customer_tag'; tag: string }
  | { type: 'create_task'; assigneeRole: UserRole; description: string }
  | { type: 'add_to_segment'; segmentId: string }
  | { type: 'apply_discount'; discountId: string; expiresIn?: number }
  | { type: 'webhook'; url: string; payload?: any }
  | { type: 'wait'; duration: number }
  | { type: 'split'; branches: Array<{ condition: AutomationCondition; actions: AutomationAction[] }> }
  | { type: 'custom'; handler: string; params?: any };

export interface AutomationEngine {
  register(automation: Automation): void;
  trigger(event: TriggerEvent): Promise<void>;
  scheduleAction(action: ScheduledAction): Promise<void>;
  getStats(automationId: string): Promise<AutomationStats>;
}
```

## LP Block 系統

```typescript
export type LPBlock =
  | { type: 'hero'; props: HeroProps }
  | { type: 'pain-points'; props: PainPointsProps }
  | { type: 'solution'; props: SolutionProps }
  | { type: 'features'; props: FeaturesProps }
  | { type: 'trust-badges'; props: TrustBadgesProps }
  | { type: 'before-after'; props: BeforeAfterProps }
  | { type: 'testimonials'; props: TestimonialsProps }
  | { type: 'specs'; props: SpecsProps }
  | { type: 'faq'; props: FAQProps }
  | { type: 'countdown'; props: CountdownProps }
  | { type: 'checkout-form'; props: CheckoutFormProps }   // 核心
  | { type: 'guarantee'; props: GuaranteeProps }
  | { type: 'contact'; props: ContactProps }
  | { type: 'video'; props: VideoProps }
  | { type: 'rich-text'; props: RichTextProps }
  | { type: 'image'; props: ImageProps }
  | { type: 'gallery'; props: GalleryProps }
  | { type: 'custom-html'; props: { html: string } };

export interface LPPage {
  id: string;
  slug: string;
  title: string;
  customDomain?: string;
  blocks: LPBlock[];
  versions: LPPageVersion[];
  pricingPlans: PricingPlan[];
  pixelEvents: PixelEventConfig;
  exitIntent?: ExitIntentConfig;
  countdown?: CountdownConfig;
  abTest?: ABTestConfig;
  publishStatus: 'draft' | 'scheduled' | 'published' | 'archived';
  publishAt?: Date;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;       // 原價（顯示劃線）
  highlight?: boolean;         // 預設選中 / 最推薦
  badge?: string;              // "最划算" / "推薦" 等標籤
  inventory?: number;          // 此方案限量
  productSku?: string;
}
```

## Payload Collections（核心 schema）

### Users
```
{
  email, password, name, phone,
  role: 'owner' | 'admin' | 'marketing' | 'cs_lead' | 'cs' 
      | 'accounting' | 'editor' | 'shipper' | 'instructor',
  tenantIds: string[],         // 多店家
  twoFactorEnabled: boolean,
  twoFactorSecret: string,     // encrypted
  lastLoginAt, lastLoginIp,
}
```

### Customers
```
{
  email, phone, name,
  addresses: Address[],
  tags: string[],              // CRM 標籤
  tier: string,
  points: number,
  storedValue: number,
  totalSpent, orderCount, lastOrderAt,
  firstPurchaseAt,
  birthDate,
  acceptsMarketing: boolean,
  acceptsLine: boolean,
  acceptsSms: boolean,
  customFields: jsonb,
  tenantId: string,
}
```

### Products
```
{
  title, slug, description, descriptionHtml,
  type: 'simple' | 'variant' | 'digital' | 'subscription',
  status: 'draft' | 'active' | 'archived' | 'pre-order',
  categories, tags,
  images: Media[], videos: Media[],
  variants: ProductVariant[],
  basePrice, compareAtPrice, costPrice,
  trackInventory: boolean,
  inventory, safetyStock, allowBackorder,
  seo: SEOFields,
  attributes: jsonb,           // 自訂規格
  externalId,                  // ERP 整合預留
  vendor, brand,
  publishedAt,
  tenantId: string,
}
```

### Orders
```
{
  orderNumber,
  customerId, guestEmail, guestPhone,
  items: OrderItem[],
  status: OrderStatus,
  paymentStatus: PaymentStatus,
  fulfillmentStatus: FulfillmentStatus,
  subtotal, discountTotal, shippingTotal, taxTotal, total,
  appliedDiscounts: AppliedDiscount[],
  paymentProvider, paymentMethod, paymentTransactionId,
  shippingProvider, shippingMethod, shippingAddress, trackingNumber,
  invoiceProvider, invoiceNumber, invoiceIssuedAt,
  notes, internalNotes,         // 內部備註不給客戶看
  source: 'web' | 'lp' | 'admin' | 'phone' | 'pos',
  sourceLpId,                   // 哪支 LP 來的
  utm: UTMFields,
  cancelledAt, cancelReason,
  refundedAmount,
  tenantId: string,
}
```

### Courses
```
{
  title, slug, description, type,
  instructorIds: string[],
  chapters: Chapter[],          // → Lessons
  pricing: CoursePricing,
  status: 'draft' | 'crowdfunding' | 'presale' | 'live' | 'archived',
  crowdfunding: { goal, current, deadline },
  preview: { videoId, summaryText },
  outcomes: string[],
  suitableFor: string[],
  faq: FAQ[],
  certificateTemplate: string,
  completionCriteria: { watchPercentage, quizPassRate },
  tenantId: string,
}
```

### LPPages
（見上面 LP Block 系統）

### Discounts
（見上面折扣引擎）

### Automations
（見上面行銷自動化）

### AuditLogs
```
{
  userId, action, resourceType, resourceId,
  before: jsonb, after: jsonb,
  ip, userAgent,
  timestamp,
  tenantId: string,
}
```

## 模組相依圖

```
core (auth/email/upload/i18n)
   ↓
provider 抽象層 (payment/shipping/invoice/notification/video)
   ↓                                    ↓
discount-engine                  automation-engine
   ↓                                    ↓
   ├─→ shop ───┐                       │
   ├─→ course ─┼─→ marketing ←─────────┘
   └─→ lp ─────┘
       │
       └─→ cms / blog
              ↓
           themes + ui
              ↓
        apps/template
              ↓
        apps/factory
```
