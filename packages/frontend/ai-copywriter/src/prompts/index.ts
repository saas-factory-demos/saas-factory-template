import { INDUSTRIES } from '@saas-factory/factory-types';


import { aiWeb3Prompt } from './ai-web3.js';
import { babyMomPrompt } from './baby-mom.js';
import { beautySkincarePrompt } from './beauty-skincare.js';
import { churchReligionPrompt } from './church-religion.js';
import { consultingPrompt } from './consulting.js';
import { craftDesignPrompt } from './craft-design.js';
import { crowdfundingPrompt } from './crowdfunding.js';
import { dentalClinicPrompt } from './dental-clinic.js';
import { eventConferencePrompt } from './event-conference.js';
import { fashionApparelPrompt } from './fashion-apparel.js';
import { fitnessGymPrompt } from './fitness-gym.js';
import { foodSnacksPrompt } from './food-snacks.js';
import { homeFurniturePrompt } from './home-furniture.js';
import { legalAccountingPrompt } from './legal-accounting.js';
import { logisticsTradePrompt } from './logistics-trade.js';
import { manufacturingPrompt } from './manufacturing.js';
import { medicalAestheticPrompt } from './medical-aesthetic.js';
import { nightclubBarPrompt } from './nightclub-bar.js';
import { nonprofitPrompt } from './nonprofit.js';
import { onlineCoursePrompt } from './online-course.js';
import { personalBrandPrompt } from './personal-brand.js';
import { petSuppliesPrompt } from './pet-supplies.js';
import { politicalCampaignPrompt } from './political-campaign.js';
import { printDesignPrompt } from './print-design.js';
import { realestatePrompt } from './realestate.js';
import { restaurantPrompt } from './restaurant.js';
import { saasSoftwarePrompt } from './saas-software.js';
import { salonPrompt } from './salon.js';
import { sportsOutdoorPrompt } from './sports-outdoor.js';
import { supplementPrompt } from './supplement.js';
import { techAccessoriesPrompt } from './tech-accessories.js';
import { travelTourPrompt } from './travel-tour.js';
import { weddingPrompt } from './wedding.js';

import type { IndustryPrompt } from '../types.js';
import type { Industry } from '@saas-factory/factory-types';

/**
 * 33 個 industry 的 prompt 字典。對齊 `INDUSTRIES`，給 Wizard step 4.8 / generateCopy 用。
 */
export const PROMPT_REGISTRY: Record<Industry, IndustryPrompt> = {
  supplement: supplementPrompt,
  'tech-accessories': techAccessoriesPrompt,
  'fashion-apparel': fashionApparelPrompt,
  'beauty-skincare': beautySkincarePrompt,
  'home-furniture': homeFurniturePrompt,
  'food-snacks': foodSnacksPrompt,
  'baby-mom': babyMomPrompt,
  'pet-supplies': petSuppliesPrompt,
  'sports-outdoor': sportsOutdoorPrompt,
  'craft-design': craftDesignPrompt,
  'online-course': onlineCoursePrompt,
  'fitness-gym': fitnessGymPrompt,
  salon: salonPrompt,
  'medical-aesthetic': medicalAestheticPrompt,
  'dental-clinic': dentalClinicPrompt,
  restaurant: restaurantPrompt,
  'travel-tour': travelTourPrompt,
  wedding: weddingPrompt,
  'saas-software': saasSoftwarePrompt,
  consulting: consultingPrompt,
  manufacturing: manufacturingPrompt,
  'print-design': printDesignPrompt,
  'logistics-trade': logisticsTradePrompt,
  'legal-accounting': legalAccountingPrompt,
  'ai-web3': aiWeb3Prompt,
  realestate: realestatePrompt,
  crowdfunding: crowdfundingPrompt,
  nonprofit: nonprofitPrompt,
  'personal-brand': personalBrandPrompt,
  'event-conference': eventConferencePrompt,
  'nightclub-bar': nightclubBarPrompt,
  'church-religion': churchReligionPrompt,
  'political-campaign': politicalCampaignPrompt,
};

/**
 * 取得指定 industry 的 prompt 設定。
 *
 * @throws 若 industry 不在 33 個列表內（理論上 TS 已擋）。
 */
export function getIndustryPrompt(industry: Industry): IndustryPrompt {
  const prompt = PROMPT_REGISTRY[industry];
  if (!prompt) {
    throw new Error(`找不到 industry「${industry}」的 prompt 設定。`);
  }
  return prompt;
}

/** 33 個 industry slug 的 readonly 陣列，主要給測試與列舉用。 */
export const PROMPT_INDUSTRIES = INDUSTRIES;
