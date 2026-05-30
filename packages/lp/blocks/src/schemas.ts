import { z } from 'zod';

/** CTA 連結。 */
const CtaSchema = z.object({
  label: z.string().min(1),
  /** 內部錨點（#checkout）或外部 URL。 */
  href: z.string().min(1),
  style: z.enum(['primary', 'secondary', 'ghost']).default('primary'),
});

/** 圖片來源。 */
const ImageSchema = z.object({
  src: z.string().url().or(z.string().startsWith('/')),
  alt: z.string().default(''),
  /** 圓角等級（對應 CLAUDE.md 設計規範）。 */
  radius: z.enum(['sm', 'md', 'lg', 'xl', '2xl', 'full']).default('lg'),
});

/** Hero。 */
export const HeroBlockSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  media: z
    .discriminatedUnion('kind', [
      z.object({ kind: z.literal('image'), image: ImageSchema }),
      z.object({
        kind: z.literal('video'),
        src: z.string(),
        autoplay: z.boolean().default(true),
        muted: z.boolean().default(true),
        loop: z.boolean().default(true),
      }),
    ])
    .optional(),
  cta: CtaSchema.optional(),
});

/** 痛點清單。 */
export const PainPointsBlockSchema = z.object({
  heading: z.string().default('你是不是也有這些煩惱？'),
  items: z.array(z.object({ icon: z.string().optional(), text: z.string().min(1) })).min(1),
});

/** 解決方案。 */
export const SolutionBlockSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
  image: ImageSchema.optional(),
});

/** 功能特色。 */
export const FeaturesBlockSchema = z.object({
  heading: z.string().default('功能特色'),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  items: z
    .array(
      z.object({
        icon: z.string().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
      }),
    )
    .min(1),
});

/** 信任徽章（媒體報導 / 客戶 logo / 保證標章）。 */
export const TrustBadgesBlockSchema = z.object({
  heading: z.string().optional(),
  badges: z.array(ImageSchema).min(1),
});

/** Before / After 對比。 */
export const BeforeAfterBlockSchema = z.object({
  heading: z.string().optional(),
  before: ImageSchema,
  after: ImageSchema,
  labels: z.object({ before: z.string().default('使用前'), after: z.string().default('使用後') }).default({}),
});

/** 學員 / 客戶見證。 */
export const TestimonialsBlockSchema = z.object({
  heading: z.string().default('客戶見證'),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        avatar: ImageSchema.optional(),
        quote: z.string().min(1),
        videoUrl: z.string().url().optional(),
        rating: z.number().min(1).max(5).optional(),
      }),
    )
    .min(1),
});

/** 規格表。 */
export const SpecsBlockSchema = z.object({
  heading: z.string().default('產品規格'),
  rows: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).min(1),
});

/** FAQ。 */
export const FaqBlockSchema = z.object({
  heading: z.string().default('常見問題'),
  items: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).min(1),
});

/** 倒數計時。 */
export const CountdownBlockSchema = z.object({
  /** 真實倒數 = 所有訪客同步到固定 endsAt；動態倒數 = 每訪客個別計時。 */
  mode: z.enum(['real', 'per-visitor']).default('real'),
  endsAt: z.string().datetime().optional(),
  perVisitorMinutes: z.number().positive().optional(),
  /** 結束行為。 */
  onEnd: z.enum(['hide', 'show-message', 'reset']).default('show-message'),
  endMessage: z.string().default('活動已結束'),
});

/** Checkout 表單（具體欄位由 lp/checkout-form 處理，這裡只負責設定）。 */
export const CheckoutFormBlockSchema = z.object({
  /** 三段方案（中間預選）。 */
  plans: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        priceMinor: z.number().int().nonnegative(),
        comparePriceMinor: z.number().int().nonnegative().optional(),
        badge: z.string().optional(),
        recommended: z.boolean().default(false),
      }),
    )
    .min(1)
    .max(5),
  defaultPlanId: z.string().optional(),
  paymentMethods: z.array(z.enum(['credit-card', 'cod', 'line-pay', 'jko-pay'])).default(['credit-card']),
  /** 折疊式發票區塊。 */
  collapsibleInvoice: z.boolean().default(true),
  /** 折疊式優惠碼。 */
  collapsibleCoupon: z.boolean().default(true),
  /** Order Bump 商品 id。 */
  orderBumpProductId: z.string().optional(),
});

/** 保證 / 退費承諾。 */
export const GuaranteeBlockSchema = z.object({
  heading: z.string().default('30 天退費保證'),
  body: z.string().min(1),
  badge: ImageSchema.optional(),
});

/** 聯絡資訊。 */
export const ContactBlockSchema = z.object({
  heading: z.string().default('聯絡我們'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  line: z.string().optional(),
  address: z.string().optional(),
});

/** 影片嵌入。 */
export const VideoBlockSchema = z.object({
  heading: z.string().optional(),
  provider: z.enum(['youtube', 'bunny', 'mux', 'self-hosted']),
  src: z.string().min(1),
  autoplay: z.boolean().default(false),
  muted: z.boolean().default(true),
});

/** 富文本。 */
export const RichTextBlockSchema = z.object({
  /** HTML / Markdown 由前端渲染器解析。 */
  content: z.string().min(1),
  format: z.enum(['markdown', 'html']).default('markdown'),
});

/** 單張圖片。 */
export const ImageBlockSchema = z.object({
  image: ImageSchema,
  caption: z.string().optional(),
});

/** 圖庫 / 走馬燈。 */
export const GalleryBlockSchema = z.object({
  heading: z.string().optional(),
  images: z.array(ImageSchema).min(1),
  layout: z.enum(['grid', 'carousel']).default('grid'),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
});

/** Custom HTML。 */
export const CustomHtmlBlockSchema = z.object({
  html: z.string().min(1),
  /** 是否允許在後台 sanitize 後仍保留 script（預設 false）。 */
  allowScripts: z.boolean().default(false),
});

/** 所有區塊 schema 對應表。 */
export const BLOCK_SCHEMAS = {
  hero: HeroBlockSchema,
  'pain-points': PainPointsBlockSchema,
  solution: SolutionBlockSchema,
  features: FeaturesBlockSchema,
  'trust-badges': TrustBadgesBlockSchema,
  'before-after': BeforeAfterBlockSchema,
  testimonials: TestimonialsBlockSchema,
  specs: SpecsBlockSchema,
  faq: FaqBlockSchema,
  countdown: CountdownBlockSchema,
  'checkout-form': CheckoutFormBlockSchema,
  guarantee: GuaranteeBlockSchema,
  contact: ContactBlockSchema,
  video: VideoBlockSchema,
  'rich-text': RichTextBlockSchema,
  image: ImageBlockSchema,
  gallery: GalleryBlockSchema,
  'custom-html': CustomHtmlBlockSchema,
} as const;

export type BlockType = keyof typeof BLOCK_SCHEMAS;
export type HeroBlockProps = z.infer<typeof HeroBlockSchema>;
export type CheckoutFormBlockProps = z.infer<typeof CheckoutFormBlockSchema>;
export type CountdownBlockProps = z.infer<typeof CountdownBlockSchema>;
