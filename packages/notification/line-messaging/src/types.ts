/**
 * LINE Messaging API 訊息型別（v3.x）。
 *
 * 文件：https://developers.line.biz/en/reference/messaging-api/#message-objects
 */

/** Quick reply 按鈕（最多 13 個） */
export interface QuickReplyItem {
  type: 'action';
  imageUrl?: string;
  action:
    | { type: 'message'; label: string; text: string }
    | { type: 'postback'; label: string; data: string; displayText?: string }
    | { type: 'uri'; label: string; uri: string };
}

export interface QuickReply {
  items: QuickReplyItem[];
}

/** Flex Message：商品卡片 / 訂單通知用。 */
export interface FlexMessage {
  type: 'flex';
  altText: string;
  /** Bubble / Carousel 結構（依官方 spec 由 caller 組） */
  contents: Record<string, unknown>;
  quickReply?: QuickReply;
}

export interface TextMessage {
  type: 'text';
  text: string;
  quickReply?: QuickReply;
}

export interface ImageMessage {
  type: 'image';
  originalContentUrl: string;
  previewImageUrl: string;
}

export type LineMessage = TextMessage | ImageMessage | FlexMessage;

/** 模板渲染器：tenant 自訂 templateId → LineMessage[] */
export type LineTemplateRenderer = (
  templateId: string,
  data: Record<string, unknown>,
) => LineMessage[];
