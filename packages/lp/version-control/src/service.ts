import type { LpVersionStore, PreviewLinkStore } from './in-memory-store.js';
import type { LpSnapshot, LpVersion, PreviewLink } from './types.js';

/** 密碼雜湊 hook（外層接 bcrypt / argon2）。 */
export type PasswordHasher = (plain: string) => Promise<string>;
/** 密碼比對 hook。 */
export type PasswordVerifier = (plain: string, hash: string) => Promise<boolean>;

/** LP 版本控制服務。 */
export class LpVersionControlService {
  constructor(
    private readonly versions: LpVersionStore,
    private readonly previews: PreviewLinkStore,
    private readonly options: {
      now?: () => Date;
      genId?: () => string;
      genToken?: () => string;
      passwordHasher?: PasswordHasher;
      passwordVerifier?: PasswordVerifier;
    } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(): string {
    return this.options.genId ? this.options.genId() : `ver_${Math.random().toString(36).slice(2, 10)}`;
  }

  private genToken(): string {
    return this.options.genToken ? this.options.genToken() : Math.random().toString(36).slice(2, 14);
  }

  /** 建立新版本（每次儲存呼叫）；自動算下一個 version 序號。 */
  async createVersion(input: {
    tenantId: string;
    pageId: string;
    snapshot: LpSnapshot;
    createdBy: string;
    name?: string;
    note?: string;
  }): Promise<LpVersion> {
    const existing = await this.versions.listByPage(input.tenantId, input.pageId);
    const nextVersion = (existing[0]?.version ?? 0) + 1;
    const v: LpVersion = {
      id: this.genId(),
      tenantId: input.tenantId,
      pageId: input.pageId,
      version: nextVersion,
      name: input.name,
      note: input.note,
      snapshot: input.snapshot,
      createdBy: input.createdBy,
      createdAt: this.now(),
      isProduction: false,
    };
    await this.versions.insert(v);
    return v;
  }

  /** 還原舊版：把舊 snapshot 複製成新版本。 */
  async restore(versionId: string, createdBy: string): Promise<LpVersion> {
    const old = await this.versions.findById(versionId);
    if (!old) throw new Error(`找不到版本：${versionId}`);
    return this.createVersion({
      tenantId: old.tenantId,
      pageId: old.pageId,
      snapshot: old.snapshot,
      createdBy,
      name: `還原自 v${old.version}`,
      note: old.name ? `來源：${old.name}` : undefined,
    });
  }

  /** 將某版本立即上線（其他版本自動 isProduction=false）。 */
  async promoteToProduction(versionId: string): Promise<LpVersion> {
    const v = await this.versions.findById(versionId);
    if (!v) throw new Error(`找不到版本：${versionId}`);
    const list = await this.versions.listByPage(v.tenantId, v.pageId);
    for (const candidate of list) {
      if (candidate.id === v.id) continue;
      if (candidate.isProduction) {
        await this.versions.update({ ...candidate, isProduction: false });
      }
    }
    const updated: LpVersion = { ...v, isProduction: true, scheduledFor: undefined };
    await this.versions.update(updated);
    return updated;
  }

  /** 排程上線：scheduledFor 未到時不切換 production。 */
  async schedule(versionId: string, scheduledFor: Date): Promise<LpVersion> {
    if (scheduledFor.getTime() <= this.now().getTime()) {
      throw new Error('排程時間必須大於現在');
    }
    const v = await this.versions.findById(versionId);
    if (!v) throw new Error(`找不到版本：${versionId}`);
    const updated: LpVersion = { ...v, scheduledFor };
    await this.versions.update(updated);
    return updated;
  }

  /** 在指定 page 範圍內 promote 已到期版本（給 worker 用）。 */
  async runScheduledPromotion(
    tenantId: string,
    pageId: string,
    now: Date = this.now(),
  ): Promise<LpVersion[]> {
    const list = await this.versions.listByPage(tenantId, pageId);
    const due = list.filter((v) => v.scheduledFor && v.scheduledFor.getTime() <= now.getTime());
    const out: LpVersion[] = [];
    for (const v of due) {
      const promoted = await this.promoteToProduction(v.id);
      out.push(promoted);
    }
    return out;
  }

  /** 產生預覽連結（可選密碼 / 過期）。 */
  async createPreviewLink(input: {
    versionId: string;
    password?: string;
    expiresAt?: Date;
  }): Promise<PreviewLink> {
    const v = await this.versions.findById(input.versionId);
    if (!v) throw new Error(`找不到版本：${input.versionId}`);
    let passwordHash: string | undefined;
    if (input.password) {
      if (!this.options.passwordHasher) throw new Error('未注入 passwordHasher');
      passwordHash = await this.options.passwordHasher(input.password);
    }
    const link: PreviewLink = {
      id: this.genId(),
      versionId: input.versionId,
      token: this.genToken(),
      passwordHash,
      expiresAt: input.expiresAt,
      createdAt: this.now(),
    };
    await this.previews.insert(link);
    return link;
  }

  /** 解析預覽連結。expired / 密碼錯都會回 undefined。 */
  async resolvePreview(token: string, password?: string): Promise<LpVersion | undefined> {
    const link = await this.previews.findByToken(token);
    if (!link) return undefined;
    if (link.expiresAt && link.expiresAt.getTime() < this.now().getTime()) return undefined;
    if (link.passwordHash) {
      if (!password) return undefined;
      if (!this.options.passwordVerifier) throw new Error('未注入 passwordVerifier');
      const ok = await this.options.passwordVerifier(password, link.passwordHash);
      if (!ok) return undefined;
    }
    return this.versions.findById(link.versionId);
  }

  /** 取得 production 版本（前台渲染用）。 */
  async getProduction(tenantId: string, pageId: string): Promise<LpVersion | undefined> {
    return this.versions.findProduction(tenantId, pageId);
  }
}
