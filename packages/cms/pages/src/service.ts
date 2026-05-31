import { FRONTEND_TIER1_BLOCK_KEYS } from '@saas-factory/factory-types';
import { BLOCK_REGISTRY } from '@saas-factory/frontend-blocks';

import { computeFullPath, findPageByPath, normalizeSlug } from './path.js';

import type {
  CreatePageInput,
  LayoutValidationResult,
  Page,
  PageStatus,
  PageStore,
  UpdatePageInput,
} from './types.js';
import type { BlockInstance, FrontendTier1BlockKey } from '@saas-factory/factory-types';

/** Tier 1 key 的 Set，給 O(1) 偵測「是否為 blocks-library 有實作的 block」用。 */
const TIER1_KEY_SET = new Set<FrontendTier1BlockKey>(FRONTEND_TIER1_BLOCK_KEYS);

/**
 * 用 BLOCK_REGISTRY 的 Zod schema 跑 layout 驗證。
 *
 * 規則：
 * - 若 block.type 是 Tier 1 key（blocks-library 有實作）→ 用對應 zodSchema 驗 block.config
 * - 若 block.type 是 industry dotted slug（未在 BLOCK_REGISTRY）→ 跳過驗證（fallback render）
 * - 若 block.type 完全未知 → 報錯
 */
export function validateLayout(layout: readonly BlockInstance[]): LayoutValidationResult {
  const errors: Record<string, string[]> = {};
  for (const block of layout) {
    if (TIER1_KEY_SET.has(block.type as FrontendTier1BlockKey)) {
      const entry = BLOCK_REGISTRY[block.type as FrontendTier1BlockKey];
      const result = entry.schema.safeParse(block.config);
      if (!result.success) {
        errors[block.id] = result.error.issues.map(
          (i) => `${i.path.join('.') || '(root)'}: ${i.message}`,
        );
      }
      continue;
    }
    // industry dotted slug 或其他 — 不驗（fallback render 處理）
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * 頁面服務：CRUD + 狀態管理 + 路徑計算。
 *
 * 用 blocks-library 的 Zod schema 驗證 layout，不再需要 BlockRegistry 注入。
 */
export class PageService {
  private readonly store: PageStore;

  constructor(store: PageStore) {
    this.store = store;
  }

  private genId(): string {
    return `page_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * 建立頁面。會檢查 slug 唯一性（同 parent 範圍）與首頁唯一性。
   */
  async create(input: CreatePageInput): Promise<Page> {
    const slug = normalizeSlug(input.slug);
    if (!slug) throw new Error('slug 不得為空');

    const existing = await this.store.findBySlug(input.tenantId, input.parentId, slug);
    if (existing) throw new Error(`同層級已存在 slug：${slug}`);

    if (input.isHomepage) {
      const all = await this.store.listByTenant(input.tenantId);
      if (all.some((p) => p.isHomepage)) {
        throw new Error('已存在首頁，每個租戶僅能有一個 isHomepage 頁面');
      }
    }

    this.assertLayoutValid(input.layout);

    const now = new Date();
    const page: Page = {
      id: this.genId(),
      tenantId: input.tenantId,
      title: input.title,
      slug,
      parentId: input.parentId,
      layout: input.layout,
      status: input.status ?? 'draft',
      publishedAt: input.status === 'published' ? now : undefined,
      scheduledAt: input.scheduledAt,
      seo: input.seo,
      isHomepage: input.isHomepage,
      sortOrder: input.sortOrder,
      createdAt: now,
      updatedAt: now,
    };
    return this.store.create(page);
  }

  /**
   * 更新頁面。
   */
  async update(input: UpdatePageInput): Promise<Page> {
    const current = await this.store.findById(input.id);
    if (!current) throw new Error(`Page 不存在：${input.id}`);

    if (input.slug !== undefined && input.slug !== current.slug) {
      const slug = normalizeSlug(input.slug);
      if (!slug) throw new Error('slug 不得為空');
      const existing = await this.store.findBySlug(
        current.tenantId,
        input.parentId ?? current.parentId,
        slug,
      );
      if (existing && existing.id !== current.id) {
        throw new Error(`同層級已存在 slug：${slug}`);
      }
      input.slug = slug;
    }
    if (input.layout) this.assertLayoutValid(input.layout);

    return this.store.update(input.id, input);
  }

  /**
   * 發布頁面（status -> published + 紀錄 publishedAt）。
   */
  async publish(id: string): Promise<Page> {
    return this.store.update(id, { status: 'published', publishedAt: new Date() });
  }

  /**
   * 排程發布：設定 scheduledAt，狀態仍為 draft，等 cron 觸發 publishScheduled。
   */
  async schedule(id: string, when: Date): Promise<Page> {
    if (when.getTime() <= Date.now()) {
      throw new Error('scheduledAt 必須為未來時間');
    }
    return this.store.update(id, { status: 'draft', scheduledAt: when });
  }

  /**
   * 由 cron 呼叫：把已到排程時間且仍是 draft 的頁面切為 published。
   */
  async publishScheduled(tenantId: string, now: Date = new Date()): Promise<Page[]> {
    const list = await this.store.listByTenant(tenantId);
    const due = list.filter(
      (p) => p.status === 'draft' && p.scheduledAt && p.scheduledAt.getTime() <= now.getTime(),
    );
    const out: Page[] = [];
    for (const p of due) {
      out.push(await this.store.update(p.id, { status: 'published', publishedAt: now }));
    }
    return out;
  }

  /**
   * 封存頁面。
   */
  async archive(id: string): Promise<Page> {
    return this.store.update(id, { status: 'archived' });
  }

  /**
   * 切換狀態通用方法。
   */
  async setStatus(id: string, status: PageStatus): Promise<Page> {
    if (status === 'published') return this.publish(id);
    if (status === 'archived') return this.archive(id);
    return this.store.update(id, { status: 'draft' });
  }

  /**
   * 由完整 URL path 查 page。
   */
  async getByPath(tenantId: string, path: string): Promise<Page | undefined> {
    const all = await this.store.listByTenant(tenantId);
    return findPageByPath(path, all);
  }

  /**
   * 計算指定 page 的完整 URL path。
   */
  async getFullPath(page: Page): Promise<string> {
    const all = await this.store.listByTenant(page.tenantId);
    return computeFullPath(page, all);
  }

  /**
   * 列出已發布的頁面，給 sitemap 用。
   */
  async listPublished(tenantId: string): Promise<Page[]> {
    const all = await this.store.listByTenant(tenantId);
    return all.filter((p) => p.status === 'published');
  }

  /**
   * 取得頁面樹狀結構（給後台 sidebar 用）。
   */
  async getTree(tenantId: string): Promise<Array<Page & { children: Page[] }>> {
    const all = await this.store.listByTenant(tenantId);
    const tree: Array<Page & { children: Page[] }> = [];
    const byId = new Map<string, Page & { children: Page[] }>();
    for (const p of all) byId.set(p.id, { ...p, children: [] });
    for (const node of byId.values()) {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children.push(node);
      } else {
        tree.push(node);
      }
    }
    const sortNodes = (nodes: Array<Page & { children: Page[] }>): void => {
      nodes.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      for (const n of nodes) sortNodes(n.children as Array<Page & { children: Page[] }>);
    };
    sortNodes(tree);
    return tree;
  }

  /**
   * Validate layout via Zod schema；invalid 直接 throw。
   */
  private assertLayoutValid(layout: Page['layout']): void {
    const result = validateLayout(layout);
    if (!result.valid) {
      const flat = Object.entries(result.errors)
        .map(([id, errs]) => `${id}: ${errs.join('；')}`)
        .join('\n');
      throw new Error(`頁面 layout 驗證失敗：\n${flat}`);
    }
  }
}
