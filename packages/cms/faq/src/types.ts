/** FAQ 分類。 */
export interface FaqCategory {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/** FAQ 問答。 */
export interface FaqItem {
  id: string;
  tenantId: string;
  categoryId?: string;
  question: string;
  /** Lexical / 純文字皆可，由前端決定渲染。 */
  answer: unknown;
  /** 用來做搜尋的純文字版本（自動萃取或手動填）。 */
  answerPlain: string;
  /** 同分類內排序。 */
  sortOrder: number;
  /** 累計點擊次數（折疊展開算一次）。 */
  clickCount: number;
  /** 是否上架。 */
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** FAQ 查詢條件。 */
export interface FaqFilter {
  categoryId?: string;
  published?: boolean;
  search?: string;
}

/** FAQ 儲存層介面。 */
export interface FaqStore {
  upsertCategory(c: FaqCategory): Promise<FaqCategory>;
  listCategories(tenantId: string): Promise<FaqCategory[]>;
  findCategoryById(id: string): Promise<FaqCategory | undefined>;

  createItem(item: FaqItem): Promise<FaqItem>;
  updateItem(id: string, patch: Partial<FaqItem>): Promise<FaqItem>;
  findItemById(id: string): Promise<FaqItem | undefined>;
  listItems(tenantId: string, filter?: FaqFilter): Promise<FaqItem[]>;
}

/** 建立 FAQ 輸入。 */
export interface CreateFaqInput {
  tenantId: string;
  categoryId?: string;
  question: string;
  answer: unknown;
  answerPlain?: string;
  sortOrder?: number;
  published?: boolean;
}
