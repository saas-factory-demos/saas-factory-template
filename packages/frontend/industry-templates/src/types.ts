import type {
  Industry,
  ModuleSlug,
  PageComposition,
  SiteType,
} from '@saas-factory/factory-types';

/**
 * 單一產業的完整 site template。
 *
 * 給 Wizard step 1.5「Industry 選擇」用：使用者選產業後 Wizard
 * 用此 template 自動填 page composition、預設 module 勾選、AI 文案語氣。
 */
export interface IndustryTemplate {
  /** Industry slug。 */
  industry: Industry;
  /** 推薦的主 site type，取自 metadata.recommendedSiteTypes[0]。 */
  primarySiteType: SiteType;
  /** 每個 site type 預設的 page composition。非主類型可填空陣列。 */
  pages: Record<SiteType, PageComposition[]>;
  /** 額外推薦模組（補 metadata.recommendedModules 已有的）。 */
  extraModules?: ModuleSlug[];
  /** 文案語氣建議（給 AI Copywriter 用）。 */
  copyTone: {
    /** 品牌口吻，例：「親切專業」「奢華低調」「年輕奔放」。 */
    brandVoice: string;
    /** 目標客群描述。 */
    targetAudience: string;
    /** 關鍵賣點 3-5 條。 */
    keySellingPoints: string[];
  };
}
