import { PRESET_KEYS } from '@saas-factory/factory-types';

import { academyWarm } from './academy-warm.js';
import { artisanCraft } from './artisan-craft.js';
import { beautyBoutique } from './beauty-boutique.js';
import { civicBold } from './civic-bold.js';
import { corporateTrust } from './corporate-trust.js';
import { crowdfundEnergy } from './crowdfund-energy.js';
import { culinaryWarmth } from './culinary-warmth.js';
import { cyberTech } from './cyber-tech.js';
import { luxuryEditorial } from './luxury-editorial.js';
import { magazineEditorial } from './magazine-editorial.js';
import { medicalClinical } from './medical-clinical.js';
import { modernMinimal } from './modern-minimal.js';
import { nightclubNeon } from './nightclub-neon.js';
import { organicWellness } from './organic-wellness.js';
import { playfulBold } from './playful-bold.js';
import { realestatePrestige } from './realestate-prestige.js';
import { retroNostalgic } from './retro-nostalgic.js';
import { sacredSerenity } from './sacred-serenity.js';
import { streetEdge } from './street-edge.js';
import { travelEscape } from './travel-escape.js';
// @gen-extended-presets:begin-imports
import { saasGeneral } from './extended/saas-general.js';
import { microSaas } from './extended/micro-saas.js';
import { eCommerce } from './extended/e-commerce.js';
import { eCommerceLuxury } from './extended/e-commerce-luxury.js';
import { b2bService } from './extended/b2b-service.js';
import { financialDashboard } from './extended/financial-dashboard.js';
import { analyticsDashboard } from './extended/analytics-dashboard.js';
import { healthcareApp } from './extended/healthcare-app.js';
import { educationalApp } from './extended/educational-app.js';
import { creativeAgency } from './extended/creative-agency.js';
import { portfolioPersonal } from './extended/portfolio-personal.js';
import { gaming } from './extended/gaming.js';
import { governmentPublicService } from './extended/government-public-service.js';
import { fintechCrypto } from './extended/fintech-crypto.js';
import { socialMediaApp } from './extended/social-media-app.js';
import { productivityTool } from './extended/productivity-tool.js';
import { designSystemComponentLibrary } from './extended/design-system-component-library.js';
import { aiChatbotPlatform } from './extended/ai-chatbot-platform.js';
import { nftWeb3Platform } from './extended/nft-web3-platform.js';
import { creatorEconomyPlatform } from './extended/creator-economy-platform.js';
import { remoteWorkCollaborationTool } from './extended/remote-work-collaboration-tool.js';
import { mentalHealthApp } from './extended/mental-health-app.js';
import { petTechApp } from './extended/pet-tech-app.js';
import { smartHomeIotDashboard } from './extended/smart-home-iot-dashboard.js';
import { evChargingEcosystem } from './extended/ev-charging-ecosystem.js';
import { subscriptionBoxService } from './extended/subscription-box-service.js';
import { podcastPlatform } from './extended/podcast-platform.js';
import { datingApp } from './extended/dating-app.js';
import { microCredentialsBadgesPlatform } from './extended/micro-credentials-badges-platform.js';
import { knowledgeBaseDocumentation } from './extended/knowledge-base-documentation.js';
import { hyperlocalServices } from './extended/hyperlocal-services.js';
import { beautySpaWellnessService } from './extended/beauty-spa-wellness-service.js';
import { luxuryPremiumBrand } from './extended/luxury-premium-brand.js';
import { restaurantFoodService } from './extended/restaurant-food-service.js';
import { fitnessGymApp } from './extended/fitness-gym-app.js';
import { realEstateProperty } from './extended/real-estate-property.js';
import { travelTourismAgency } from './extended/travel-tourism-agency.js';
import { hotelHospitality } from './extended/hotel-hospitality.js';
import { weddingEventPlanning } from './extended/wedding-event-planning.js';
import { legalServices } from './extended/legal-services.js';
import { insurancePlatform } from './extended/insurance-platform.js';
import { bankingTraditionalFinance } from './extended/banking-traditional-finance.js';
import { onlineCourseELearning } from './extended/online-course-e-learning.js';
import { nonProfitCharity } from './extended/non-profit-charity.js';
import { musicStreaming } from './extended/music-streaming.js';
import { videoStreamingOtt } from './extended/video-streaming-ott.js';
import { jobBoardRecruitment } from './extended/job-board-recruitment.js';
import { marketplaceP2p } from './extended/marketplace-p2p.js';
import { logisticsDelivery } from './extended/logistics-delivery.js';
import { agricultureFarmTech } from './extended/agriculture-farm-tech.js';
import { constructionArchitecture } from './extended/construction-architecture.js';
import { automotiveCarDealership } from './extended/automotive-car-dealership.js';
import { photographyStudio } from './extended/photography-studio.js';
import { coworkingSpace } from './extended/coworking-space.js';
import { homeServicesPlumberElectrician } from './extended/home-services-plumber-electrician.js';
import { childcareDaycare } from './extended/childcare-daycare.js';
import { seniorCareElderly } from './extended/senior-care-elderly.js';
import { medicalClinic } from './extended/medical-clinic.js';
import { pharmacyDrugStore } from './extended/pharmacy-drug-store.js';
import { dentalPractice } from './extended/dental-practice.js';
import { veterinaryClinic } from './extended/veterinary-clinic.js';
import { floristPlantShop } from './extended/florist-plant-shop.js';
import { bakeryCafe } from './extended/bakery-cafe.js';
import { breweryWinery } from './extended/brewery-winery.js';
import { airline } from './extended/airline.js';
import { newsMediaPlatform } from './extended/news-media-platform.js';
import { magazineBlog } from './extended/magazine-blog.js';
import { freelancerPlatform } from './extended/freelancer-platform.js';
import { marketingAgency } from './extended/marketing-agency.js';
import { eventManagement } from './extended/event-management.js';
import { membershipCommunity } from './extended/membership-community.js';
import { newsletterPlatform } from './extended/newsletter-platform.js';
import { digitalProductsDownloads } from './extended/digital-products-downloads.js';
import { churchReligiousOrganization } from './extended/church-religious-organization.js';
import { sportsTeamClub } from './extended/sports-team-club.js';
import { museumGallery } from './extended/museum-gallery.js';
import { theaterCinema } from './extended/theater-cinema.js';
import { languageLearningApp } from './extended/language-learning-app.js';
import { codingBootcamp } from './extended/coding-bootcamp.js';
import { cybersecurityPlatform } from './extended/cybersecurity-platform.js';
import { developerToolIde } from './extended/developer-tool-ide.js';
import { biotechLifeSciences } from './extended/biotech-life-sciences.js';
import { spaceTechAerospace } from './extended/space-tech-aerospace.js';
import { architectureInterior } from './extended/architecture-interior.js';
import { quantumComputingInterface } from './extended/quantum-computing-interface.js';
import { biohackingLongevityApp } from './extended/biohacking-longevity-app.js';
import { autonomousDroneFleetManager } from './extended/autonomous-drone-fleet-manager.js';
import { generativeArtPlatform } from './extended/generative-art-platform.js';
import { spatialComputingOsApp } from './extended/spatial-computing-os-app.js';
import { sustainableEnergyClimateTech } from './extended/sustainable-energy-climate-tech.js';
import { personalFinanceTracker } from './extended/personal-finance-tracker.js';
import { chatAndMessagingApp } from './extended/chat-and-messaging-app.js';
import { notesAndWritingApp } from './extended/notes-and-writing-app.js';
import { habitTracker } from './extended/habit-tracker.js';
import { foodDeliveryOnDemand } from './extended/food-delivery-on-demand.js';
import { rideHailingTransportation } from './extended/ride-hailing-transportation.js';
import { recipeAndCookingApp } from './extended/recipe-and-cooking-app.js';
import { meditationAndMindfulness } from './extended/meditation-and-mindfulness.js';
import { weatherApp } from './extended/weather-app.js';
import { diaryAndJournalApp } from './extended/diary-and-journal-app.js';
import { crmAndClientManagement } from './extended/crm-and-client-management.js';
import { inventoryAndStockManagement } from './extended/inventory-and-stock-management.js';
import { flashcardAndStudyTool } from './extended/flashcard-and-study-tool.js';
import { bookingAndAppointmentApp } from './extended/booking-and-appointment-app.js';
import { invoiceAndBillingTool } from './extended/invoice-and-billing-tool.js';
import { groceryAndShoppingList } from './extended/grocery-and-shopping-list.js';
import { timerAndPomodoro } from './extended/timer-and-pomodoro.js';
import { parentingAndBabyTracker } from './extended/parenting-and-baby-tracker.js';
import { scannerAndDocumentManager } from './extended/scanner-and-document-manager.js';
import { calendarAndSchedulingApp } from './extended/calendar-and-scheduling-app.js';
import { passwordManager } from './extended/password-manager.js';
import { expenseSplitterBillSplit } from './extended/expense-splitter-bill-split.js';
import { voiceRecorderAndMemo } from './extended/voice-recorder-and-memo.js';
import { bookmarkAndReadLater } from './extended/bookmark-and-read-later.js';
import { translatorApp } from './extended/translator-app.js';
import { calculatorAndUnitConverter } from './extended/calculator-and-unit-converter.js';
import { alarmAndWorldClock } from './extended/alarm-and-world-clock.js';
import { fileManagerAndTransfer } from './extended/file-manager-and-transfer.js';
import { emailClient } from './extended/email-client.js';
import { casualPuzzleGame } from './extended/casual-puzzle-game.js';
import { triviaAndQuizGame } from './extended/trivia-and-quiz-game.js';
import { cardAndBoardGame } from './extended/card-and-board-game.js';
import { idleAndClickerGame } from './extended/idle-and-clicker-game.js';
import { wordAndCrosswordGame } from './extended/word-and-crossword-game.js';
import { arcadeAndRetroGame } from './extended/arcade-and-retro-game.js';
import { photoEditorAndFilters } from './extended/photo-editor-and-filters.js';
import { shortVideoEditor } from './extended/short-video-editor.js';
import { drawingAndSketchingCanvas } from './extended/drawing-and-sketching-canvas.js';
import { musicCreationAndBeatMaker } from './extended/music-creation-and-beat-maker.js';
import { memeAndStickerMaker } from './extended/meme-and-sticker-maker.js';
import { aiPhotoAndAvatarGenerator } from './extended/ai-photo-and-avatar-generator.js';
import { linkInBioPageBuilder } from './extended/link-in-bio-page-builder.js';
import { wardrobeAndOutfitPlanner } from './extended/wardrobe-and-outfit-planner.js';
import { plantCareTracker } from './extended/plant-care-tracker.js';
import { bookAndReadingTracker } from './extended/book-and-reading-tracker.js';
import { coupleAndRelationshipApp } from './extended/couple-and-relationship-app.js';
import { familyCalendarAndChores } from './extended/family-calendar-and-chores.js';
import { moodTracker } from './extended/mood-tracker.js';
import { giftAndWishlist } from './extended/gift-and-wishlist.js';
import { runningAndCyclingGps } from './extended/running-and-cycling-gps.js';
import { yogaAndStretchingGuide } from './extended/yoga-and-stretching-guide.js';
import { sleepTracker } from './extended/sleep-tracker.js';
import { calorieAndNutritionCounter } from './extended/calorie-and-nutrition-counter.js';
import { periodAndCycleTracker } from './extended/period-and-cycle-tracker.js';
import { medicationAndPillReminder } from './extended/medication-and-pill-reminder.js';
import { waterAndHydrationReminder } from './extended/water-and-hydration-reminder.js';
import { fastingAndIntermittentTimer } from './extended/fasting-and-intermittent-timer.js';
import { anonymousCommunityConfession } from './extended/anonymous-community-confession.js';
import { localEventsAndDiscovery } from './extended/local-events-and-discovery.js';
import { studyTogetherVirtualCoworking } from './extended/study-together-virtual-coworking.js';
import { codingChallengeAndPractice } from './extended/coding-challenge-and-practice.js';
import { kidsLearningAbcAndMath } from './extended/kids-learning-abc-and-math.js';
import { musicInstrumentLearning } from './extended/music-instrument-learning.js';
import { parkingFinder } from './extended/parking-finder.js';
import { publicTransitGuide } from './extended/public-transit-guide.js';
import { roadTripPlanner } from './extended/road-trip-planner.js';
import { vpnAndPrivacyTool } from './extended/vpn-and-privacy-tool.js';
import { emergencySosAndSafety } from './extended/emergency-sos-and-safety.js';
import { wallpaperAndThemeApp } from './extended/wallpaper-and-theme-app.js';
import { whiteNoiseAndAmbientSound } from './extended/white-noise-and-ambient-sound.js';
import { homeDecorationAndInteriorDesign } from './extended/home-decoration-and-interior-design.js';
  // @gen-extended-presets:end-imports

import type { DesignTokens, TokenMeta } from '../types.js';
import type { PresetKey } from '@saas-factory/factory-types';

/**
 * 20 套 preset registry。
 *
 * 完整對應 `PresetKey`；新增 / 移除 preset 時，`PresetKey` 與此 dict 必須同步。
 * 用 `satisfies Record<PresetKey, DesignTokens>` 在編譯期強制完整性。
 */
export const presets = {
  'modern-minimal': modernMinimal,
  'luxury-editorial': luxuryEditorial,
  'playful-bold': playfulBold,
  'corporate-trust': corporateTrust,
  'academy-warm': academyWarm,
  'organic-wellness': organicWellness,
  'street-edge': streetEdge,
  'cyber-tech': cyberTech,
  'retro-nostalgic': retroNostalgic,
  'magazine-editorial': magazineEditorial,
  'artisan-craft': artisanCraft,
  'beauty-boutique': beautyBoutique,
  'medical-clinical': medicalClinical,
  'culinary-warmth': culinaryWarmth,
  'travel-escape': travelEscape,
  'nightclub-neon': nightclubNeon,
  'sacred-serenity': sacredSerenity,
  'civic-bold': civicBold,
  'crowdfund-energy': crowdfundEnergy,
  'realestate-prestige': realestatePrestige,
  // @gen-extended-presets:begin-entries
  'saas-general': saasGeneral,
  'micro-saas': microSaas,
  'e-commerce': eCommerce,
  'e-commerce-luxury': eCommerceLuxury,
  'b2b-service': b2bService,
  'financial-dashboard': financialDashboard,
  'analytics-dashboard': analyticsDashboard,
  'healthcare-app': healthcareApp,
  'educational-app': educationalApp,
  'creative-agency': creativeAgency,
  'portfolio-personal': portfolioPersonal,
  'gaming': gaming,
  'government-public-service': governmentPublicService,
  'fintech-crypto': fintechCrypto,
  'social-media-app': socialMediaApp,
  'productivity-tool': productivityTool,
  'design-system-component-library': designSystemComponentLibrary,
  'ai-chatbot-platform': aiChatbotPlatform,
  'nft-web3-platform': nftWeb3Platform,
  'creator-economy-platform': creatorEconomyPlatform,
  'remote-work-collaboration-tool': remoteWorkCollaborationTool,
  'mental-health-app': mentalHealthApp,
  'pet-tech-app': petTechApp,
  'smart-home-iot-dashboard': smartHomeIotDashboard,
  'ev-charging-ecosystem': evChargingEcosystem,
  'subscription-box-service': subscriptionBoxService,
  'podcast-platform': podcastPlatform,
  'dating-app': datingApp,
  'micro-credentials-badges-platform': microCredentialsBadgesPlatform,
  'knowledge-base-documentation': knowledgeBaseDocumentation,
  'hyperlocal-services': hyperlocalServices,
  'beauty-spa-wellness-service': beautySpaWellnessService,
  'luxury-premium-brand': luxuryPremiumBrand,
  'restaurant-food-service': restaurantFoodService,
  'fitness-gym-app': fitnessGymApp,
  'real-estate-property': realEstateProperty,
  'travel-tourism-agency': travelTourismAgency,
  'hotel-hospitality': hotelHospitality,
  'wedding-event-planning': weddingEventPlanning,
  'legal-services': legalServices,
  'insurance-platform': insurancePlatform,
  'banking-traditional-finance': bankingTraditionalFinance,
  'online-course-e-learning': onlineCourseELearning,
  'non-profit-charity': nonProfitCharity,
  'music-streaming': musicStreaming,
  'video-streaming-ott': videoStreamingOtt,
  'job-board-recruitment': jobBoardRecruitment,
  'marketplace-p2p': marketplaceP2p,
  'logistics-delivery': logisticsDelivery,
  'agriculture-farm-tech': agricultureFarmTech,
  'construction-architecture': constructionArchitecture,
  'automotive-car-dealership': automotiveCarDealership,
  'photography-studio': photographyStudio,
  'coworking-space': coworkingSpace,
  'home-services-plumber-electrician': homeServicesPlumberElectrician,
  'childcare-daycare': childcareDaycare,
  'senior-care-elderly': seniorCareElderly,
  'medical-clinic': medicalClinic,
  'pharmacy-drug-store': pharmacyDrugStore,
  'dental-practice': dentalPractice,
  'veterinary-clinic': veterinaryClinic,
  'florist-plant-shop': floristPlantShop,
  'bakery-cafe': bakeryCafe,
  'brewery-winery': breweryWinery,
  'airline': airline,
  'news-media-platform': newsMediaPlatform,
  'magazine-blog': magazineBlog,
  'freelancer-platform': freelancerPlatform,
  'marketing-agency': marketingAgency,
  'event-management': eventManagement,
  'membership-community': membershipCommunity,
  'newsletter-platform': newsletterPlatform,
  'digital-products-downloads': digitalProductsDownloads,
  'church-religious-organization': churchReligiousOrganization,
  'sports-team-club': sportsTeamClub,
  'museum-gallery': museumGallery,
  'theater-cinema': theaterCinema,
  'language-learning-app': languageLearningApp,
  'coding-bootcamp': codingBootcamp,
  'cybersecurity-platform': cybersecurityPlatform,
  'developer-tool-ide': developerToolIde,
  'biotech-life-sciences': biotechLifeSciences,
  'space-tech-aerospace': spaceTechAerospace,
  'architecture-interior': architectureInterior,
  'quantum-computing-interface': quantumComputingInterface,
  'biohacking-longevity-app': biohackingLongevityApp,
  'autonomous-drone-fleet-manager': autonomousDroneFleetManager,
  'generative-art-platform': generativeArtPlatform,
  'spatial-computing-os-app': spatialComputingOsApp,
  'sustainable-energy-climate-tech': sustainableEnergyClimateTech,
  'personal-finance-tracker': personalFinanceTracker,
  'chat-and-messaging-app': chatAndMessagingApp,
  'notes-and-writing-app': notesAndWritingApp,
  'habit-tracker': habitTracker,
  'food-delivery-on-demand': foodDeliveryOnDemand,
  'ride-hailing-transportation': rideHailingTransportation,
  'recipe-and-cooking-app': recipeAndCookingApp,
  'meditation-and-mindfulness': meditationAndMindfulness,
  'weather-app': weatherApp,
  'diary-and-journal-app': diaryAndJournalApp,
  'crm-and-client-management': crmAndClientManagement,
  'inventory-and-stock-management': inventoryAndStockManagement,
  'flashcard-and-study-tool': flashcardAndStudyTool,
  'booking-and-appointment-app': bookingAndAppointmentApp,
  'invoice-and-billing-tool': invoiceAndBillingTool,
  'grocery-and-shopping-list': groceryAndShoppingList,
  'timer-and-pomodoro': timerAndPomodoro,
  'parenting-and-baby-tracker': parentingAndBabyTracker,
  'scanner-and-document-manager': scannerAndDocumentManager,
  'calendar-and-scheduling-app': calendarAndSchedulingApp,
  'password-manager': passwordManager,
  'expense-splitter-bill-split': expenseSplitterBillSplit,
  'voice-recorder-and-memo': voiceRecorderAndMemo,
  'bookmark-and-read-later': bookmarkAndReadLater,
  'translator-app': translatorApp,
  'calculator-and-unit-converter': calculatorAndUnitConverter,
  'alarm-and-world-clock': alarmAndWorldClock,
  'file-manager-and-transfer': fileManagerAndTransfer,
  'email-client': emailClient,
  'casual-puzzle-game': casualPuzzleGame,
  'trivia-and-quiz-game': triviaAndQuizGame,
  'card-and-board-game': cardAndBoardGame,
  'idle-and-clicker-game': idleAndClickerGame,
  'word-and-crossword-game': wordAndCrosswordGame,
  'arcade-and-retro-game': arcadeAndRetroGame,
  'photo-editor-and-filters': photoEditorAndFilters,
  'short-video-editor': shortVideoEditor,
  'drawing-and-sketching-canvas': drawingAndSketchingCanvas,
  'music-creation-and-beat-maker': musicCreationAndBeatMaker,
  'meme-and-sticker-maker': memeAndStickerMaker,
  'ai-photo-and-avatar-generator': aiPhotoAndAvatarGenerator,
  'link-in-bio-page-builder': linkInBioPageBuilder,
  'wardrobe-and-outfit-planner': wardrobeAndOutfitPlanner,
  'plant-care-tracker': plantCareTracker,
  'book-and-reading-tracker': bookAndReadingTracker,
  'couple-and-relationship-app': coupleAndRelationshipApp,
  'family-calendar-and-chores': familyCalendarAndChores,
  'mood-tracker': moodTracker,
  'gift-and-wishlist': giftAndWishlist,
  'running-and-cycling-gps': runningAndCyclingGps,
  'yoga-and-stretching-guide': yogaAndStretchingGuide,
  'sleep-tracker': sleepTracker,
  'calorie-and-nutrition-counter': calorieAndNutritionCounter,
  'period-and-cycle-tracker': periodAndCycleTracker,
  'medication-and-pill-reminder': medicationAndPillReminder,
  'water-and-hydration-reminder': waterAndHydrationReminder,
  'fasting-and-intermittent-timer': fastingAndIntermittentTimer,
  'anonymous-community-confession': anonymousCommunityConfession,
  'local-events-and-discovery': localEventsAndDiscovery,
  'study-together-virtual-coworking': studyTogetherVirtualCoworking,
  'coding-challenge-and-practice': codingChallengeAndPractice,
  'kids-learning-abc-and-math': kidsLearningAbcAndMath,
  'music-instrument-learning': musicInstrumentLearning,
  'parking-finder': parkingFinder,
  'public-transit-guide': publicTransitGuide,
  'road-trip-planner': roadTripPlanner,
  'vpn-and-privacy-tool': vpnAndPrivacyTool,
  'emergency-sos-and-safety': emergencySosAndSafety,
  'wallpaper-and-theme-app': wallpaperAndThemeApp,
  'white-noise-and-ambient-sound': whiteNoiseAndAmbientSound,
  'home-decoration-and-interior-design': homeDecorationAndInteriorDesign,
  // @gen-extended-presets:end-entries
} as const satisfies Record<PresetKey, DesignTokens>;

/**
 * 對應 `factory-types` 的 `PRESET_KEYS`，給 Wizard 下拉清單用。
 * 順序與 `presets` 一致。
 */
export const PRESET_LIST: readonly TokenMeta[] = PRESET_KEYS.map((key) => presets[key].meta);
