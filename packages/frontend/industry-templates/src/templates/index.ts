

import { aiWeb3Template } from './ai-web3.js';
import { babyMomTemplate } from './baby-mom.js';
import { beautySkincareTemplate } from './beauty-skincare.js';
import { churchReligionTemplate } from './church-religion.js';
import { consultingTemplate } from './consulting.js';
import { craftDesignTemplate } from './craft-design.js';
import { crowdfundingTemplate } from './crowdfunding.js';
import { dentalClinicTemplate } from './dental-clinic.js';
import { eventConferenceTemplate } from './event-conference.js';
import { fashionApparelTemplate } from './fashion-apparel.js';
import { fitnessGymTemplate } from './fitness-gym.js';
import { foodSnacksTemplate } from './food-snacks.js';
import { homeFurnitureTemplate } from './home-furniture.js';
import { legalAccountingTemplate } from './legal-accounting.js';
import { logisticsTradeTemplate } from './logistics-trade.js';
import { manufacturingTemplate } from './manufacturing.js';
import { medicalAestheticTemplate } from './medical-aesthetic.js';
import { nightclubBarTemplate } from './nightclub-bar.js';
import { nonprofitTemplate } from './nonprofit.js';
import { onlineCourseTemplate } from './online-course.js';
import { personalBrandTemplate } from './personal-brand.js';
import { petSuppliesTemplate } from './pet-supplies.js';
import { politicalCampaignTemplate } from './political-campaign.js';
import { printDesignTemplate } from './print-design.js';
import { realestateTemplate } from './realestate.js';
import { restaurantTemplate } from './restaurant.js';
import { saasSoftwareTemplate } from './saas-software.js';
import { salonTemplate } from './salon.js';
import { sportsOutdoorTemplate } from './sports-outdoor.js';
import { supplementTemplate } from './supplement.js';
import { techAccessoriesTemplate } from './tech-accessories.js';
import { travelTourTemplate } from './travel-tour.js';
import { weddingTemplate } from './wedding.js';

import type { IndustryTemplate } from '../types.js';
import type { Industry } from '@saas-factory/factory-types';

/**
 * 33 個產業的 IndustryTemplate registry。
 *
 * Wizard step 1.5「Industry 選擇」會用此 registry 自動填 page composition、
 * 預設 module 勾選、AI 文案語氣。
 */
export const INDUSTRY_TEMPLATES: Record<Industry, IndustryTemplate> = {
  // ===== 電商 10 =====
  supplement: supplementTemplate,
  'tech-accessories': techAccessoriesTemplate,
  'fashion-apparel': fashionApparelTemplate,
  'beauty-skincare': beautySkincareTemplate,
  'home-furniture': homeFurnitureTemplate,
  'food-snacks': foodSnacksTemplate,
  'baby-mom': babyMomTemplate,
  'pet-supplies': petSuppliesTemplate,
  'sports-outdoor': sportsOutdoorTemplate,
  'craft-design': craftDesignTemplate,
  // ===== 服務 8 =====
  'online-course': onlineCourseTemplate,
  'fitness-gym': fitnessGymTemplate,
  salon: salonTemplate,
  'medical-aesthetic': medicalAestheticTemplate,
  'dental-clinic': dentalClinicTemplate,
  restaurant: restaurantTemplate,
  'travel-tour': travelTourTemplate,
  wedding: weddingTemplate,
  // ===== B2B 6 =====
  'saas-software': saasSoftwareTemplate,
  consulting: consultingTemplate,
  manufacturing: manufacturingTemplate,
  'print-design': printDesignTemplate,
  'logistics-trade': logisticsTradeTemplate,
  'legal-accounting': legalAccountingTemplate,
  // ===== 特殊 9 =====
  'ai-web3': aiWeb3Template,
  realestate: realestateTemplate,
  crowdfunding: crowdfundingTemplate,
  nonprofit: nonprofitTemplate,
  'personal-brand': personalBrandTemplate,
  'event-conference': eventConferenceTemplate,
  'nightclub-bar': nightclubBarTemplate,
  'church-religion': churchReligionTemplate,
  'political-campaign': politicalCampaignTemplate,
};
