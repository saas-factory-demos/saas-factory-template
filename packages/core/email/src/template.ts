import type { EmailTemplateId, TemplateData, TemplateRenderer } from './types.js';

/**
 * 預設模板渲染器：將 `{{key}}` placeholder 替換為 data 對應值。
 *
 * 真正 React Email 模板由 apps 端註冊（透過 `registerTemplate`）。
 * 此 fallback 確保 package 自身可獨立測試、不阻塞 monorepo 依賴。
 */
export class SimpleTemplateRenderer implements TemplateRenderer {
  private readonly templates = new Map<EmailTemplateId, string>();

  registerTemplate(id: EmailTemplateId, source: string): void {
    this.templates.set(id, source);
  }

  render(id: EmailTemplateId, data: TemplateData): Promise<string> {
    const source = this.templates.get(id);
    if (!source) {
      return Promise.reject(new Error(`template not found: ${id}`));
    }
    const rendered = source.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
      const value = data[key];
      return value === undefined || value === null ? '' : String(value);
    });
    return Promise.resolve(rendered);
  }
}

/**
 * 內建模板列表（對應 goal 01 §2）。
 *
 * 用於 admin 端列出所有可編輯模板的下拉選項。
 */
export const BUILT_IN_TEMPLATES: ReadonlyArray<{
  id: EmailTemplateId;
  label: string;
  category: 'auth' | 'commerce' | 'course' | 'support' | 'security';
}> = [
  { id: 'welcome', label: '註冊歡迎', category: 'auth' },
  { id: 'verify-email', label: 'Email 驗證', category: 'auth' },
  { id: 'reset-password', label: '忘記密碼', category: 'auth' },
  { id: 'order-confirmed', label: '訂單確認', category: 'commerce' },
  { id: 'order-shipped', label: '訂單出貨通知', category: 'commerce' },
  { id: 'order-cancelled', label: '訂單取消', category: 'commerce' },
  { id: 'refund-issued', label: '退款通知', category: 'commerce' },
  { id: 'cart-abandoned-1', label: '棄單回收 1', category: 'commerce' },
  { id: 'cart-abandoned-2', label: '棄單回收 2', category: 'commerce' },
  { id: 'cart-abandoned-3', label: '棄單回收 3', category: 'commerce' },
  { id: 'subscription-created', label: '訂閱建立', category: 'commerce' },
  { id: 'subscription-cancelled', label: '訂閱取消', category: 'commerce' },
  { id: 'course-enrolled', label: '課程報名成功', category: 'course' },
  { id: 'course-completed', label: '課程完課證書', category: 'course' },
  { id: 'support-reply', label: '客服回覆通知', category: 'support' },
  { id: 'login-alert', label: '異常登入警示', category: 'security' },
];
