/**
 * ShippingRouter：依 ShippingMethod 路由到對應 provider。
 *
 * goal 02 §10：「訂單流向決策 v1 = 建立訂單就建物流單（在 shipment 觸發時）」。
 * Router 純路由，不負責決策；caller 決定何時呼叫 createShipment。
 */

import type {
  CalculateFeeParams,
  CreateShipmentParams,
  ShipmentResult,
  ShippingMethod,
  ShippingProvider,
  ShippingProviderName,
  TrackingInfo,
} from './types.js';

export interface ShippingMethodRouting {
  /** ShippingMethod → 預設 provider */
  defaults: Partial<Record<ShippingMethod, ShippingProviderName>>;
  /** 覆寫表：tenantId.method → provider（特定客戶用特定家） */
  overrides?: Record<string, Partial<Record<ShippingMethod, ShippingProviderName>>>;
}

export class ShippingRouter {
  private readonly providers = new Map<ShippingProviderName, ShippingProvider>();

  constructor(
    providers: readonly ShippingProvider[],
    private readonly routing: ShippingMethodRouting,
  ) {
    for (const p of providers) this.providers.set(p.name, p);
  }

  /** 選 provider：先看 tenant overrides，再 fallback 到 defaults。 */
  resolve(
    tenantId: string,
    method: ShippingMethod,
  ): ShippingProvider {
    const override = this.routing.overrides?.[tenantId]?.[method];
    const target = override ?? this.routing.defaults[method];
    if (!target) {
      throw new Error(`No shipping provider routed for method=${method}`);
    }
    const provider = this.providers.get(target);
    if (!provider) {
      throw new Error(`Shipping provider not registered: ${target}`);
    }
    return provider;
  }

  /** 透傳：calculateFee。 */
  calculateFee(params: CalculateFeeParams): Promise<number> {
    return this.resolve(params.tenantId, params.method).calculateFee(params);
  }

  /** 透傳：createShipment。 */
  createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    return this.resolve(params.tenantId, params.method).createShipment(params);
  }

  /** 透傳：trackShipment（從 provider 名稱查詢，需 caller 提供）。 */
  trackShipment(
    providerName: ShippingProviderName,
    trackingNumber: string,
  ): Promise<TrackingInfo> {
    const provider = this.providers.get(providerName);
    if (!provider) throw new Error(`Shipping provider not registered: ${providerName}`);
    return provider.trackShipment(trackingNumber);
  }
}
