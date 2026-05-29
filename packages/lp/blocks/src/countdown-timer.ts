import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * 倒數計時防偽造。
 *
 * 為何需要：`countdown` block 的 `per-visitor` 模式若僅以 localStorage 紀錄
 * 首次造訪時間，使用者清掉 localStorage 即可無限重置倒數，行銷急迫感失效。
 * 解法：server 端持久化每訪客的 `endsAt`，並用 HMAC 簽章避免前端竄改。
 *
 * `real` 模式（所有人共用同一個 endsAt）由 CMS 後台寫死，不經本模組。
 */

/** 倒數 token，會回到前端。 */
export interface CountdownToken {
  /** ISO datetime；前端據此計算剩餘秒數。 */
  endsAt: string;
  /** HMAC-SHA256(visitorId|blockId|endsAt) hex。 */
  sig: string;
}

/** 每訪客的倒數記錄。 */
export interface CountdownRecord {
  visitorId: string;
  blockId: string;
  endsAt: Date;
}

/** 倒數記錄儲存介面（真實情境用 DB / Redis）。 */
export interface CountdownStore {
  get(visitorId: string, blockId: string): Promise<CountdownRecord | undefined>;
  put(record: CountdownRecord): Promise<void>;
}

/** 預設記憶體 store，正式環境請替換為 Redis / Postgres 實作。 */
export class InMemoryCountdownStore implements CountdownStore {
  private readonly map = new Map<string, CountdownRecord>();
  private key(v: string, b: string): string {
    return `${v}::${b}`;
  }
  async get(visitorId: string, blockId: string): Promise<CountdownRecord | undefined> {
    return this.map.get(this.key(visitorId, blockId));
  }
  async put(record: CountdownRecord): Promise<void> {
    this.map.set(this.key(record.visitorId, record.blockId), record);
  }
}

function hmacSig(secret: string, visitorId: string, blockId: string, endsAtIso: string): string {
  return createHmac('sha256', secret).update(`${visitorId}|${blockId}|${endsAtIso}`).digest('hex');
}

/**
 * 取得或建立指定訪客的倒數 token。
 *
 * 行為：若 store 已有未過期紀錄，沿用；否則以 `now + perVisitorMinutes`
 * 建立新紀錄並寫入 store。回傳含 HMAC 簽章的 token。
 */
export async function issueCountdownToken(input: {
  store: CountdownStore;
  visitorId: string;
  blockId: string;
  perVisitorMinutes: number;
  secret: string;
  now?: () => Date;
}): Promise<CountdownToken> {
  const nowFn = input.now ?? (() => new Date());
  const current = nowFn();
  const existing = await input.store.get(input.visitorId, input.blockId);
  let endsAt: Date;
  if (existing && existing.endsAt.getTime() > current.getTime()) {
    endsAt = existing.endsAt;
  } else {
    endsAt = new Date(current.getTime() + input.perVisitorMinutes * 60_000);
    await input.store.put({ visitorId: input.visitorId, blockId: input.blockId, endsAt });
  }
  const endsAtIso = endsAt.toISOString();
  return { endsAt: endsAtIso, sig: hmacSig(input.secret, input.visitorId, input.blockId, endsAtIso) };
}

/**
 * 驗證前端回傳的 token 是否被竄改。
 *
 * 用於後端接收結帳請求時，比對 token 是否仍合法（例：避免活動已結束的
 * 訪客把 endsAt 改大繼續享受優惠）。
 */
export function verifyCountdownToken(input: {
  visitorId: string;
  blockId: string;
  endsAt: string;
  sig: string;
  secret: string;
}): boolean {
  const expected = hmacSig(input.secret, input.visitorId, input.blockId, input.endsAt);
  if (expected.length !== input.sig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(input.sig, 'hex'));
  } catch {
    return false;
  }
}
