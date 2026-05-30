/** 表單欄位類型。 */
export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'consent';

/** 條件邏輯運算子。 */
export type ConditionOperator = 'equals' | 'not-equals' | 'in' | 'not-in' | 'truthy' | 'falsy';

/** 單一條件規則。 */
export interface ConditionRule {
  /** 觀察的欄位 key。 */
  fieldKey: string;
  operator: ConditionOperator;
  /** equals / not-equals 用單值；in / not-in 用陣列；truthy / falsy 不需要。 */
  value?: string | number | boolean | Array<string | number>;
}

/** 條件邏輯：滿足 rules（all/any）時顯示這個欄位。 */
export interface ConditionalLogic {
  action: 'show' | 'hide';
  match: 'all' | 'any';
  rules: ConditionRule[];
}

/** 表單欄位定義。 */
export interface FormField {
  key: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  /** select / radio / checkbox 用。 */
  options?: Array<{ label: string; value: string }>;
  /** 字串長度 / 數字範圍 / 檔案大小限制。 */
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  /** file 欄位允許的 mime。 */
  acceptMime?: string[];
  /** 條件邏輯（依其他欄位的值決定是否顯示）。 */
  conditional?: ConditionalLogic;
}

/** 表單提交後動作類型。 */
export type FormActionType = 'notify-admin' | 'auto-reply' | 'webhook' | 'marketing-trigger';

/** 提交後動作設定。 */
export interface FormAction {
  type: FormActionType;
  /** notify-admin：管理員 email 列表。 */
  to?: string[];
  /** auto-reply：用哪個欄位 key 當收件人 email。 */
  replyToFieldKey?: string;
  /** notify-admin / auto-reply 用的標題與內文（可含 {{fieldKey}}）。 */
  subject?: string;
  body?: string;
  /** webhook 用。 */
  url?: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  /** marketing-trigger 用：觸發的事件 id（給 goal-07 行銷自動化）。 */
  eventId?: string;
}

/** 表單定義。 */
export interface FormDefinition {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  fields: FormField[];
  actions: FormAction[];
  /** 是否啟用 reCAPTCHA / hCaptcha。 */
  captchaEnabled?: boolean;
  /** 成功訊息。 */
  successMessage?: string;
  /** 是否上架。 */
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** 表單提交資料。 */
export interface FormSubmission {
  id: string;
  tenantId: string;
  formId: string;
  /** 欄位 key → 使用者輸入值。 */
  values: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  /** 動作執行結果摘要（每個動作一筆）。 */
  actionResults: Array<{ type: FormActionType; ok: boolean; error?: string }>;
  /** 是否被判定為垃圾。 */
  isSpam: boolean;
  spamReasons?: string[];
  createdAt: Date;
}

/** 表單儲存層介面。 */
export interface FormStore {
  upsertForm(form: FormDefinition): Promise<FormDefinition>;
  findFormById(id: string): Promise<FormDefinition | undefined>;
  findFormBySlug(tenantId: string, slug: string): Promise<FormDefinition | undefined>;
  listForms(tenantId: string): Promise<FormDefinition[]>;

  createSubmission(sub: FormSubmission): Promise<FormSubmission>;
  listSubmissions(tenantId: string, formId?: string): Promise<FormSubmission[]>;
}

/** 提交表單輸入。 */
export interface SubmitFormInput {
  tenantId: string;
  formId: string;
  values: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  honeypot?: string;
  captchaToken?: string;
}

/** Email 寄送函式介面。 */
export type EmailSender = (msg: {
  to: string[];
  subject: string;
  html: string;
}) => Promise<void>;

/** Webhook 推送函式介面。 */
export type WebhookSender = (req: {
  url: string;
  method: 'POST' | 'PUT';
  headers: Record<string, string>;
  body: unknown;
}) => Promise<void>;

/** 行銷事件觸發介面（goal-07）。 */
export type MarketingTrigger = (event: {
  tenantId: string;
  eventId: string;
  payload: Record<string, unknown>;
}) => Promise<void>;

/** Captcha 驗證函式介面。 */
export type CaptchaVerifier = (token: string) => Promise<boolean>;

/** FormService 設定。 */
export interface FormServiceOptions {
  emailSender?: EmailSender;
  webhookSender?: WebhookSender;
  marketingTrigger?: MarketingTrigger;
  verifyCaptcha?: CaptchaVerifier;
}
