/**
 * @saas-factory/notification-line-messaging
 *
 * LINE Messaging API channel dispatcher（goal 02 §11）。
 */

export { LineMessagingDispatcher } from './dispatcher.js';
export type { LineMessagingConfig } from './dispatcher.js';
export { orderUpdateFlex, productCardFlex } from './flex-templates.js';
export type {
  FlexMessage,
  ImageMessage,
  LineMessage,
  LineTemplateRenderer,
  QuickReply,
  QuickReplyItem,
  TextMessage,
} from './types.js';
