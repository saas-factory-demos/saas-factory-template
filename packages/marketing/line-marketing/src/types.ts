/** LINE 訊息類型。 */
export type LineMessageType = 'text' | 'sticker' | 'image' | 'flex' | 'imagemap';

/** LINE 訊息物件（簡化版，實際 SDK 物件更複雜，這裡只保最低欄位）。 */
export interface LineMessage {
  type: LineMessageType;
  /** 文字內容（type='text'）。 */
  text?: string;
  /** 圖檔 URL（type='image'）。 */
  originalContentUrl?: string;
  previewImageUrl?: string;
  /** 貼圖 packageId / stickerId（type='sticker'）。 */
  packageId?: string;
  stickerId?: string;
  /** Flex/imagemap 原始 JSON（type='flex' | 'imagemap'）。 */
  rawJson?: unknown;
}

/** Push 目標。 */
export type PushTarget =
  | { kind: 'broadcast' }
  | { kind: 'multicast'; userIds: string[] }
  | { kind: 'narrowcast'; segmentId: string };

/** Push 任務狀態。 */
export type PushStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'cancelled';

/** Push 任務。 */
export interface PushJob {
  id: string;
  tenantId: string;
  name: string;
  target: PushTarget;
  messages: LineMessage[];
  scheduledAt: Date;
  status: PushStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  /** 預估訊息數（用於配額預扣）。 */
  estimatedMessages?: number;
  /** 實際送出訊息數。 */
  sentMessages?: number;
  error?: string;
}

/** LINE 月配額（依方案）。 */
export interface QuotaPolicy {
  /** 每月可送訊息數上限。 */
  monthlyLimit: number;
  /** 額度低於此比率時禁止 broadcast。 */
  broadcastFloorRatio: number;
}

/** 月配額使用狀態。 */
export interface QuotaUsage {
  tenantId: string;
  /** 月份字串 YYYY-MM。 */
  yearMonth: string;
  used: number;
}

/** 好友（LINE userId 與顧客綁定）。 */
export interface LineFriend {
  tenantId: string;
  lineUserId: string;
  customerId?: string;
  displayName?: string;
  followedAt: Date;
  unfollowedAt?: Date;
  blocked: boolean;
}

/** Rich menu 設定。 */
export interface RichMenu {
  id: string;
  tenantId: string;
  name: string;
  size: { width: number; height: number };
  selected: boolean;
  chatBarText: string;
  /** 區塊與動作對應，留 unknown 給 LINE SDK 原始格式。 */
  areas: unknown;
  imageUrl?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
}

/** Rich menu 排程（時段切換）。 */
export interface RichMenuSchedule {
  id: string;
  tenantId: string;
  richMenuId: string;
  /** 「全體」或特定 friend。 */
  scope: { kind: 'default' } | { kind: 'user'; lineUserId: string };
  /** 開始時間，含。 */
  from: Date;
  /** 結束時間，不含；undefined = 無限期。 */
  until?: Date;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
}

/** LINE Push handler 注入介面。 */
export interface LinePushHandler {
  /** 真正呼叫 LINE Messaging API。 */
  push(input: {
    target: PushTarget;
    messages: LineMessage[];
  }): Promise<{ ok: true; sentCount: number } | { ok: false; error: string }>;
}

/** 段位解析器（避免硬綁 segments 套件）。 */
export type LineSegmentResolver = (
  tenantId: string,
  segmentId: string,
) => Promise<string[]>;
