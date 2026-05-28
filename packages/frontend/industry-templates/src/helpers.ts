import {
  INDUSTRY_METADATA,
  type Industry,
  type IndustryMetadata,
  type ModuleSlug,
  type PageComposition,
  type PresetKey,
  type SiteType,
} from '@saas-factory/factory-types';

import { INDUSTRY_TEMPLATES } from './templates/index.js';

import type { IndustryTemplate } from './types.js';

/**
 * 取得指定產業的 IndustryTemplate。
 *
 * @param industry - 33 個 industry slug 之一
 * @returns 對應的 IndustryTemplate（registry 必含）
 */
export function getIndustryTemplate(industry: Industry): IndustryTemplate {
  return INDUSTRY_TEMPLATES[industry];
}

/**
 * 合併 metadata + template 的 view object，給 Wizard step 1.5 用。
 *
 * 一次拿到顯示名稱、推薦 preset、推薦 site type、推薦模組、預設 pages、文案語氣。
 */
export interface MergedIndustryView {
  industry: Industry;
  displayName: string;
  category: IndustryMetadata['category'];
  recommendedPresetId: PresetKey;
  recommendedSiteTypes: readonly SiteType[];
  /** 合併 metadata 與 template.extraModules 後的完整推薦模組清單（去重）。 */
  recommendedModules: ModuleSlug[];
  primarySiteType: SiteType;
  pages: Record<SiteType, PageComposition[]>;
  copyTone: IndustryTemplate['copyTone'];
}

/**
 * 合併 INDUSTRY_METADATA 與 INDUSTRY_TEMPLATES，回傳給 Wizard 用的合一視圖。
 *
 * `recommendedModules` 為 metadata 與 template.extraModules 的聯集（去重，
 * 保留 metadata 的順序）。
 */
export function mergeWithMetadata(industry: Industry): MergedIndustryView {
  const meta = INDUSTRY_METADATA[industry];
  const tpl = INDUSTRY_TEMPLATES[industry];

  const mergedModules: ModuleSlug[] = [...meta.recommendedModules];
  if (tpl.extraModules) {
    for (const slug of tpl.extraModules) {
      if (!mergedModules.includes(slug)) {
        mergedModules.push(slug);
      }
    }
  }

  return {
    industry,
    displayName: meta.displayName,
    category: meta.category,
    recommendedPresetId: meta.recommendedPresetId,
    recommendedSiteTypes: meta.recommendedSiteTypes,
    recommendedModules: mergedModules,
    primarySiteType: tpl.primarySiteType,
    pages: tpl.pages,
    copyTone: tpl.copyTone,
  };
}
