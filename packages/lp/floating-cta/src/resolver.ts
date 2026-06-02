import type {
  CtaLabelMap,
  DeviceVariant,
  FloatingCtaConfig,
  ResolvedCta,
  VisibilityInput,
} from './types.js';

/** 從 labels + locale 解析顯示字串。沒有對應 locale 用 fallback 邏輯。 */
export function pickLabel(
  labels: CtaLabelMap,
  locale: string,
  fallbackLocale = 'zh-TW',
): string {
  if (labels[locale]) return labels[locale]!;
  if (labels[fallbackLocale]) return labels[fallbackLocale]!;
  const first = Object.values(labels)[0];
  if (first) return first;
  return '立即購買';
}

/** 解析 CTA 是否該顯示，並產出渲染資料。 */
export function resolveFloatingCta(
  config: FloatingCtaConfig,
  device: DeviceVariant,
  locale: string,
  visibility: VisibilityInput,
): ResolvedCta {
  const placement = device === 'mobile' ? 'mobile-bottom-bar' : config.desktopPlacement;
  const label = pickLabel(config.labels, locale);
  if (!config.enabled) {
    return { visible: false, reason: 'disabled', device, label, targetAnchor: config.targetAnchor, placement };
  }
  if (visibility.scrollY < config.showAfterScrollPx) {
    return {
      visible: false,
      reason: 'before-scroll-threshold',
      device,
      label,
      targetAnchor: config.targetAnchor,
      placement,
    };
  }
  if (config.hideOnAnchorVisible && (visibility.anchorInView || visibility.checkoutVisible)) {
    return {
      visible: false,
      reason: 'anchor-in-view',
      device,
      label,
      targetAnchor: config.targetAnchor,
      placement,
    };
  }
  return {
    visible: true,
    device,
    label,
    targetAnchor: config.targetAnchor,
    placement,
  };
}
