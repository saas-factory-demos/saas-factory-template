/**
 * @saas-factory/notification-push-web
 *
 * Web Push channel dispatcher（PWA，goal 02 §11）。
 */

export { WebPushDispatcher } from './dispatcher.js';
export type { WebPushConfig } from './dispatcher.js';
export { InMemorySubscriptionStore } from './in-memory-store.js';
export type {
  SubscriptionStore,
  WebPushPayload,
  WebPushSender,
  WebPushSubscription,
  WebPushTemplateRenderer,
} from './types.js';
