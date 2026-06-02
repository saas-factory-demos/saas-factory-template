/**
 * @saas-factory/shipping-core
 *
 * 物流模組抽象層。
 */

export type {
  Address,
  CalculateFeeParams,
  CreateShipmentParams,
  PackageInfo,
  ShipmentResult,
  ShipmentStatus,
  ShippingMethod,
  ShippingProvider,
  ShippingProviderName,
  ShippingWebhookEvent,
  TrackingInfo,
} from './types.js';

export { ShippingRouter } from './router.js';
export type { ShippingMethodRouting } from './router.js';
