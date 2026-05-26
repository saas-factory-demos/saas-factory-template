import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('zh-TW', 'en');
  CREATE TYPE "public"."enum_users_role" AS ENUM('owner', 'admin', 'editor', 'viewer');
  CREATE TYPE "public"."enum_pages_blocks_hero_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_pages_blocks_hero_variant" AS ENUM('centered', 'split-left-image', 'split-right-image', 'full-bleed-image', 'video-bg', 'gradient-stack');
  CREATE TYPE "public"."enum_pages_blocks_hero_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_hero_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_header_variant" AS ENUM('simple-center', 'logo-left-links-right', 'split-logo-center', 'transparent-overlay', 'sticky-blur', 'mega-menu');
  CREATE TYPE "public"."enum_pages_blocks_header_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_pages_blocks_header_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_header_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_footer_variant" AS ENUM('minimal-centered', 'multi-column', 'newsletter-cta', 'social-icons', 'dark-corporate', 'compact-bar');
  CREATE TYPE "public"."enum_pages_blocks_footer_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_footer_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_features_grid_variant" AS ENUM('grid-2-text', 'grid-3-icon', 'grid-3-illustration', 'grid-4-compact', 'alternating-rows', 'bento-mixed');
  CREATE TYPE "public"."enum_pages_blocks_features_grid_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_features_grid_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_stats_variant" AS ENUM('horizontal-3', 'horizontal-4', 'grid-2x2', 'with-headline-left', 'card-callouts', 'big-numbers');
  CREATE TYPE "public"."enum_pages_blocks_stats_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_stats_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_variant" AS ENUM('grid-3', 'masonry', 'single-large', 'carousel-row', 'avatar-quote', 'video-quote');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_cta_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_pages_blocks_cta_variant" AS ENUM('centered', 'split-with-image', 'gradient-banner', 'inline-form', 'dark-banner', 'newsletter-stack');
  CREATE TYPE "public"."enum_pages_blocks_cta_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_cta_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_faq_variant" AS ENUM('accordion-single', 'accordion-two-column', 'cards-grid', 'inline-list', 'with-cta-aside', 'stacked-callouts');
  CREATE TYPE "public"."enum_pages_blocks_faq_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_faq_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_logo_cloud_variant" AS ENUM('inline-row', 'grid-4-mono', 'grid-6-color', 'marquee-row', 'with-headline-stack', 'bordered-cells');
  CREATE TYPE "public"."enum_pages_blocks_logo_cloud_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_logo_cloud_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_content_section_variant" AS ENUM('two-column-text', 'image-left-text-right', 'image-right-text-left', 'centered-prose', 'media-stack', 'quote-callout');
  CREATE TYPE "public"."enum_pages_blocks_content_section_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_pages_blocks_content_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_content_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_pricing_table_tiers_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_pages_blocks_pricing_table_variant" AS ENUM('three-tier-cards', 'two-tier-toggle', 'comparison-matrix', 'single-highlight', 'four-tier-compact', 'feature-list-stack');
  CREATE TYPE "public"."enum_pages_blocks_pricing_table_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_pricing_table_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_team_variant" AS ENUM('grid-cards', 'circle-avatars', 'detailed-bio', 'leadership-spotlight', 'departments-tabs', 'photo-wall');
  CREATE TYPE "public"."enum_pages_blocks_team_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_team_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_timeline_variant" AS ENUM('vertical-line', 'horizontal-steps', 'alternating-side', 'milestone-cards', 'minimal-list', 'numbered-stack');
  CREATE TYPE "public"."enum_pages_blocks_timeline_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_timeline_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_gallery_variant" AS ENUM('grid-3', 'grid-4', 'masonry', 'carousel-strip', 'lightbox-grid', 'split-feature');
  CREATE TYPE "public"."enum_pages_blocks_gallery_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_gallery_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_newsletter_variant" AS ENUM('inline-bar', 'centered-card', 'split-with-image', 'minimal-input', 'incentive-callout', 'overlay-banner');
  CREATE TYPE "public"."enum_pages_blocks_newsletter_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_newsletter_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_contact_channels_type" AS ENUM('email', 'phone', 'line', 'address', 'hours');
  CREATE TYPE "public"."enum_pages_blocks_contact_form_fields_value" AS ENUM('name', 'email', 'phone', 'subject', 'message');
  CREATE TYPE "public"."enum_pages_blocks_contact_variant" AS ENUM('form-only', 'form-with-info', 'split-with-map', 'multi-channel', 'simple-cta-card', 'office-grid');
  CREATE TYPE "public"."enum_pages_blocks_contact_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_contact_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_breadcrumb_variant" AS ENUM('simple-chevron', 'simple-slash', 'pill-style', 'underline-style', 'with-page-title', 'compact-mobile');
  CREATE TYPE "public"."enum_pages_blocks_breadcrumb_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_breadcrumb_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_tabs_section_variant" AS ENUM('horizontal-pills', 'horizontal-underline', 'vertical-side', 'card-stack', 'feature-screenshot', 'compact-bar');
  CREATE TYPE "public"."enum_pages_blocks_tabs_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_tabs_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_steps_variant" AS ENUM('horizontal-line', 'vertical-stack', 'numbered-cards', 'icon-grid', 'connected-arrow', 'split-image-side');
  CREATE TYPE "public"."enum_pages_blocks_steps_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_steps_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_banner_variant" AS ENUM('announcement-bar', 'promo-strip', 'countdown', 'cookie-consent', 'warning-alert', 'launch-takeover');
  CREATE TYPE "public"."enum_pages_blocks_banner_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_pages_blocks_banner_tone" AS ENUM('neutral', 'primary', 'success', 'warning', 'danger');
  CREATE TYPE "public"."enum_pages_blocks_banner_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_pages_blocks_banner_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_variant" AS ENUM('centered', 'split-left-image', 'split-right-image', 'full-bleed-image', 'video-bg', 'gradient-stack');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_header_variant" AS ENUM('simple-center', 'logo-left-links-right', 'split-logo-center', 'transparent-overlay', 'sticky-blur', 'mega-menu');
  CREATE TYPE "public"."enum__pages_v_blocks_header_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_header_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_header_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_footer_variant" AS ENUM('minimal-centered', 'multi-column', 'newsletter-cta', 'social-icons', 'dark-corporate', 'compact-bar');
  CREATE TYPE "public"."enum__pages_v_blocks_footer_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_footer_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_features_grid_variant" AS ENUM('grid-2-text', 'grid-3-icon', 'grid-3-illustration', 'grid-4-compact', 'alternating-rows', 'bento-mixed');
  CREATE TYPE "public"."enum__pages_v_blocks_features_grid_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_features_grid_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_variant" AS ENUM('horizontal-3', 'horizontal-4', 'grid-2x2', 'with-headline-left', 'card-callouts', 'big-numbers');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_variant" AS ENUM('grid-3', 'masonry', 'single-large', 'carousel-row', 'avatar-quote', 'video-quote');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_variant" AS ENUM('centered', 'split-with-image', 'gradient-banner', 'inline-form', 'dark-banner', 'newsletter-stack');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_variant" AS ENUM('accordion-single', 'accordion-two-column', 'cards-grid', 'inline-list', 'with-cta-aside', 'stacked-callouts');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_cloud_variant" AS ENUM('inline-row', 'grid-4-mono', 'grid-6-color', 'marquee-row', 'with-headline-stack', 'bordered-cells');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_cloud_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_cloud_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_variant" AS ENUM('two-column-text', 'image-left-text-right', 'image-right-text-left', 'centered-prose', 'media-stack', 'quote-callout');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_table_tiers_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_table_variant" AS ENUM('three-tier-cards', 'two-tier-toggle', 'comparison-matrix', 'single-highlight', 'four-tier-compact', 'feature-list-stack');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_table_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_table_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_team_variant" AS ENUM('grid-cards', 'circle-avatars', 'detailed-bio', 'leadership-spotlight', 'departments-tabs', 'photo-wall');
  CREATE TYPE "public"."enum__pages_v_blocks_team_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_team_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_timeline_variant" AS ENUM('vertical-line', 'horizontal-steps', 'alternating-side', 'milestone-cards', 'minimal-list', 'numbered-stack');
  CREATE TYPE "public"."enum__pages_v_blocks_timeline_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_timeline_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_variant" AS ENUM('grid-3', 'grid-4', 'masonry', 'carousel-strip', 'lightbox-grid', 'split-feature');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_variant" AS ENUM('inline-bar', 'centered-card', 'split-with-image', 'minimal-input', 'incentive-callout', 'overlay-banner');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_channels_type" AS ENUM('email', 'phone', 'line', 'address', 'hours');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_form_fields_value" AS ENUM('name', 'email', 'phone', 'subject', 'message');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_variant" AS ENUM('form-only', 'form-with-info', 'split-with-map', 'multi-channel', 'simple-cta-card', 'office-grid');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_breadcrumb_variant" AS ENUM('simple-chevron', 'simple-slash', 'pill-style', 'underline-style', 'with-page-title', 'compact-mobile');
  CREATE TYPE "public"."enum__pages_v_blocks_breadcrumb_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_breadcrumb_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_section_variant" AS ENUM('horizontal-pills', 'horizontal-underline', 'vertical-side', 'card-stack', 'feature-screenshot', 'compact-bar');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_variant" AS ENUM('horizontal-line', 'vertical-stack', 'numbered-cards', 'icon-grid', 'connected-arrow', 'split-image-side');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_variant" AS ENUM('announcement-bar', 'promo-strip', 'countdown', 'cookie-consent', 'warning-alert', 'launch-takeover');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_tone" AS ENUM('neutral', 'primary', 'success', 'warning', 'danger');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('zh-TW', 'en');
  CREATE TYPE "public"."enum_shop_pages_blocks_hero_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_shop_pages_blocks_hero_variant" AS ENUM('centered', 'split-left-image', 'split-right-image', 'full-bleed-image', 'video-bg', 'gradient-stack');
  CREATE TYPE "public"."enum_shop_pages_blocks_hero_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_hero_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_header_variant" AS ENUM('simple-center', 'logo-left-links-right', 'split-logo-center', 'transparent-overlay', 'sticky-blur', 'mega-menu');
  CREATE TYPE "public"."enum_shop_pages_blocks_header_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_shop_pages_blocks_header_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_header_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_footer_variant" AS ENUM('minimal-centered', 'multi-column', 'newsletter-cta', 'social-icons', 'dark-corporate', 'compact-bar');
  CREATE TYPE "public"."enum_shop_pages_blocks_footer_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_footer_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_features_grid_variant" AS ENUM('grid-2-text', 'grid-3-icon', 'grid-3-illustration', 'grid-4-compact', 'alternating-rows', 'bento-mixed');
  CREATE TYPE "public"."enum_shop_pages_blocks_features_grid_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_features_grid_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_stats_variant" AS ENUM('horizontal-3', 'horizontal-4', 'grid-2x2', 'with-headline-left', 'card-callouts', 'big-numbers');
  CREATE TYPE "public"."enum_shop_pages_blocks_stats_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_stats_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_testimonials_variant" AS ENUM('grid-3', 'masonry', 'single-large', 'carousel-row', 'avatar-quote', 'video-quote');
  CREATE TYPE "public"."enum_shop_pages_blocks_testimonials_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_testimonials_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_cta_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_shop_pages_blocks_cta_variant" AS ENUM('centered', 'split-with-image', 'gradient-banner', 'inline-form', 'dark-banner', 'newsletter-stack');
  CREATE TYPE "public"."enum_shop_pages_blocks_cta_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_cta_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_faq_variant" AS ENUM('accordion-single', 'accordion-two-column', 'cards-grid', 'inline-list', 'with-cta-aside', 'stacked-callouts');
  CREATE TYPE "public"."enum_shop_pages_blocks_faq_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_faq_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_logo_cloud_variant" AS ENUM('inline-row', 'grid-4-mono', 'grid-6-color', 'marquee-row', 'with-headline-stack', 'bordered-cells');
  CREATE TYPE "public"."enum_shop_pages_blocks_logo_cloud_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_logo_cloud_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_content_section_variant" AS ENUM('two-column-text', 'image-left-text-right', 'image-right-text-left', 'centered-prose', 'media-stack', 'quote-callout');
  CREATE TYPE "public"."enum_shop_pages_blocks_content_section_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_shop_pages_blocks_content_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_content_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_pricing_table_tiers_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_shop_pages_blocks_pricing_table_variant" AS ENUM('three-tier-cards', 'two-tier-toggle', 'comparison-matrix', 'single-highlight', 'four-tier-compact', 'feature-list-stack');
  CREATE TYPE "public"."enum_shop_pages_blocks_pricing_table_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_pricing_table_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_team_variant" AS ENUM('grid-cards', 'circle-avatars', 'detailed-bio', 'leadership-spotlight', 'departments-tabs', 'photo-wall');
  CREATE TYPE "public"."enum_shop_pages_blocks_team_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_team_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_timeline_variant" AS ENUM('vertical-line', 'horizontal-steps', 'alternating-side', 'milestone-cards', 'minimal-list', 'numbered-stack');
  CREATE TYPE "public"."enum_shop_pages_blocks_timeline_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_timeline_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_gallery_variant" AS ENUM('grid-3', 'grid-4', 'masonry', 'carousel-strip', 'lightbox-grid', 'split-feature');
  CREATE TYPE "public"."enum_shop_pages_blocks_gallery_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_gallery_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_newsletter_variant" AS ENUM('inline-bar', 'centered-card', 'split-with-image', 'minimal-input', 'incentive-callout', 'overlay-banner');
  CREATE TYPE "public"."enum_shop_pages_blocks_newsletter_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_newsletter_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_contact_channels_type" AS ENUM('email', 'phone', 'line', 'address', 'hours');
  CREATE TYPE "public"."enum_shop_pages_blocks_contact_form_fields_value" AS ENUM('name', 'email', 'phone', 'subject', 'message');
  CREATE TYPE "public"."enum_shop_pages_blocks_contact_variant" AS ENUM('form-only', 'form-with-info', 'split-with-map', 'multi-channel', 'simple-cta-card', 'office-grid');
  CREATE TYPE "public"."enum_shop_pages_blocks_contact_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_contact_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_breadcrumb_variant" AS ENUM('simple-chevron', 'simple-slash', 'pill-style', 'underline-style', 'with-page-title', 'compact-mobile');
  CREATE TYPE "public"."enum_shop_pages_blocks_breadcrumb_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_breadcrumb_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_tabs_section_variant" AS ENUM('horizontal-pills', 'horizontal-underline', 'vertical-side', 'card-stack', 'feature-screenshot', 'compact-bar');
  CREATE TYPE "public"."enum_shop_pages_blocks_tabs_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_tabs_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_steps_variant" AS ENUM('horizontal-line', 'vertical-stack', 'numbered-cards', 'icon-grid', 'connected-arrow', 'split-image-side');
  CREATE TYPE "public"."enum_shop_pages_blocks_steps_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_steps_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_blocks_banner_variant" AS ENUM('announcement-bar', 'promo-strip', 'countdown', 'cookie-consent', 'warning-alert', 'launch-takeover');
  CREATE TYPE "public"."enum_shop_pages_blocks_banner_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_shop_pages_blocks_banner_tone" AS ENUM('neutral', 'primary', 'success', 'warning', 'danger');
  CREATE TYPE "public"."enum_shop_pages_blocks_banner_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_shop_pages_blocks_banner_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_shop_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_hero_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_hero_variant" AS ENUM('centered', 'split-left-image', 'split-right-image', 'full-bleed-image', 'video-bg', 'gradient-stack');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_hero_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_hero_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_header_variant" AS ENUM('simple-center', 'logo-left-links-right', 'split-logo-center', 'transparent-overlay', 'sticky-blur', 'mega-menu');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_header_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_header_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_header_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_footer_variant" AS ENUM('minimal-centered', 'multi-column', 'newsletter-cta', 'social-icons', 'dark-corporate', 'compact-bar');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_footer_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_footer_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_features_grid_variant" AS ENUM('grid-2-text', 'grid-3-icon', 'grid-3-illustration', 'grid-4-compact', 'alternating-rows', 'bento-mixed');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_features_grid_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_features_grid_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_stats_variant" AS ENUM('horizontal-3', 'horizontal-4', 'grid-2x2', 'with-headline-left', 'card-callouts', 'big-numbers');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_stats_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_stats_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_testimonials_variant" AS ENUM('grid-3', 'masonry', 'single-large', 'carousel-row', 'avatar-quote', 'video-quote');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_testimonials_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_testimonials_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_cta_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_cta_variant" AS ENUM('centered', 'split-with-image', 'gradient-banner', 'inline-form', 'dark-banner', 'newsletter-stack');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_cta_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_cta_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_faq_variant" AS ENUM('accordion-single', 'accordion-two-column', 'cards-grid', 'inline-list', 'with-cta-aside', 'stacked-callouts');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_faq_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_faq_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_logo_cloud_variant" AS ENUM('inline-row', 'grid-4-mono', 'grid-6-color', 'marquee-row', 'with-headline-stack', 'bordered-cells');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_logo_cloud_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_logo_cloud_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_content_section_variant" AS ENUM('two-column-text', 'image-left-text-right', 'image-right-text-left', 'centered-prose', 'media-stack', 'quote-callout');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_content_section_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_content_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_content_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_pricing_table_tiers_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_pricing_table_variant" AS ENUM('three-tier-cards', 'two-tier-toggle', 'comparison-matrix', 'single-highlight', 'four-tier-compact', 'feature-list-stack');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_pricing_table_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_pricing_table_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_team_variant" AS ENUM('grid-cards', 'circle-avatars', 'detailed-bio', 'leadership-spotlight', 'departments-tabs', 'photo-wall');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_team_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_team_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_timeline_variant" AS ENUM('vertical-line', 'horizontal-steps', 'alternating-side', 'milestone-cards', 'minimal-list', 'numbered-stack');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_timeline_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_timeline_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_gallery_variant" AS ENUM('grid-3', 'grid-4', 'masonry', 'carousel-strip', 'lightbox-grid', 'split-feature');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_gallery_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_gallery_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_newsletter_variant" AS ENUM('inline-bar', 'centered-card', 'split-with-image', 'minimal-input', 'incentive-callout', 'overlay-banner');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_newsletter_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_newsletter_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_contact_channels_type" AS ENUM('email', 'phone', 'line', 'address', 'hours');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_contact_form_fields_value" AS ENUM('name', 'email', 'phone', 'subject', 'message');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_contact_variant" AS ENUM('form-only', 'form-with-info', 'split-with-map', 'multi-channel', 'simple-cta-card', 'office-grid');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_contact_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_contact_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_breadcrumb_variant" AS ENUM('simple-chevron', 'simple-slash', 'pill-style', 'underline-style', 'with-page-title', 'compact-mobile');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_breadcrumb_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_breadcrumb_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_tabs_section_variant" AS ENUM('horizontal-pills', 'horizontal-underline', 'vertical-side', 'card-stack', 'feature-screenshot', 'compact-bar');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_tabs_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_tabs_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_steps_variant" AS ENUM('horizontal-line', 'vertical-stack', 'numbered-cards', 'icon-grid', 'connected-arrow', 'split-image-side');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_steps_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_steps_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_banner_variant" AS ENUM('announcement-bar', 'promo-strip', 'countdown', 'cookie-consent', 'warning-alert', 'launch-takeover');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_banner_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_banner_tone" AS ENUM('neutral', 'primary', 'success', 'warning', 'danger');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_banner_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__shop_pages_v_blocks_banner_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__shop_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__shop_pages_v_published_locale" AS ENUM('zh-TW', 'en');
  CREATE TYPE "public"."enum_course_pages_blocks_hero_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_course_pages_blocks_hero_variant" AS ENUM('centered', 'split-left-image', 'split-right-image', 'full-bleed-image', 'video-bg', 'gradient-stack');
  CREATE TYPE "public"."enum_course_pages_blocks_hero_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_hero_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_header_variant" AS ENUM('simple-center', 'logo-left-links-right', 'split-logo-center', 'transparent-overlay', 'sticky-blur', 'mega-menu');
  CREATE TYPE "public"."enum_course_pages_blocks_header_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_course_pages_blocks_header_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_header_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_footer_variant" AS ENUM('minimal-centered', 'multi-column', 'newsletter-cta', 'social-icons', 'dark-corporate', 'compact-bar');
  CREATE TYPE "public"."enum_course_pages_blocks_footer_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_footer_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_features_grid_variant" AS ENUM('grid-2-text', 'grid-3-icon', 'grid-3-illustration', 'grid-4-compact', 'alternating-rows', 'bento-mixed');
  CREATE TYPE "public"."enum_course_pages_blocks_features_grid_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_features_grid_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_stats_variant" AS ENUM('horizontal-3', 'horizontal-4', 'grid-2x2', 'with-headline-left', 'card-callouts', 'big-numbers');
  CREATE TYPE "public"."enum_course_pages_blocks_stats_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_stats_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_testimonials_variant" AS ENUM('grid-3', 'masonry', 'single-large', 'carousel-row', 'avatar-quote', 'video-quote');
  CREATE TYPE "public"."enum_course_pages_blocks_testimonials_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_testimonials_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_cta_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_course_pages_blocks_cta_variant" AS ENUM('centered', 'split-with-image', 'gradient-banner', 'inline-form', 'dark-banner', 'newsletter-stack');
  CREATE TYPE "public"."enum_course_pages_blocks_cta_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_cta_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_faq_variant" AS ENUM('accordion-single', 'accordion-two-column', 'cards-grid', 'inline-list', 'with-cta-aside', 'stacked-callouts');
  CREATE TYPE "public"."enum_course_pages_blocks_faq_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_faq_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_logo_cloud_variant" AS ENUM('inline-row', 'grid-4-mono', 'grid-6-color', 'marquee-row', 'with-headline-stack', 'bordered-cells');
  CREATE TYPE "public"."enum_course_pages_blocks_logo_cloud_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_logo_cloud_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_content_section_variant" AS ENUM('two-column-text', 'image-left-text-right', 'image-right-text-left', 'centered-prose', 'media-stack', 'quote-callout');
  CREATE TYPE "public"."enum_course_pages_blocks_content_section_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_course_pages_blocks_content_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_content_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_pricing_table_tiers_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_course_pages_blocks_pricing_table_variant" AS ENUM('three-tier-cards', 'two-tier-toggle', 'comparison-matrix', 'single-highlight', 'four-tier-compact', 'feature-list-stack');
  CREATE TYPE "public"."enum_course_pages_blocks_pricing_table_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_pricing_table_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_team_variant" AS ENUM('grid-cards', 'circle-avatars', 'detailed-bio', 'leadership-spotlight', 'departments-tabs', 'photo-wall');
  CREATE TYPE "public"."enum_course_pages_blocks_team_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_team_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_timeline_variant" AS ENUM('vertical-line', 'horizontal-steps', 'alternating-side', 'milestone-cards', 'minimal-list', 'numbered-stack');
  CREATE TYPE "public"."enum_course_pages_blocks_timeline_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_timeline_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_gallery_variant" AS ENUM('grid-3', 'grid-4', 'masonry', 'carousel-strip', 'lightbox-grid', 'split-feature');
  CREATE TYPE "public"."enum_course_pages_blocks_gallery_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_gallery_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_newsletter_variant" AS ENUM('inline-bar', 'centered-card', 'split-with-image', 'minimal-input', 'incentive-callout', 'overlay-banner');
  CREATE TYPE "public"."enum_course_pages_blocks_newsletter_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_newsletter_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_contact_channels_type" AS ENUM('email', 'phone', 'line', 'address', 'hours');
  CREATE TYPE "public"."enum_course_pages_blocks_contact_form_fields_value" AS ENUM('name', 'email', 'phone', 'subject', 'message');
  CREATE TYPE "public"."enum_course_pages_blocks_contact_variant" AS ENUM('form-only', 'form-with-info', 'split-with-map', 'multi-channel', 'simple-cta-card', 'office-grid');
  CREATE TYPE "public"."enum_course_pages_blocks_contact_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_contact_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_breadcrumb_variant" AS ENUM('simple-chevron', 'simple-slash', 'pill-style', 'underline-style', 'with-page-title', 'compact-mobile');
  CREATE TYPE "public"."enum_course_pages_blocks_breadcrumb_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_breadcrumb_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_tabs_section_variant" AS ENUM('horizontal-pills', 'horizontal-underline', 'vertical-side', 'card-stack', 'feature-screenshot', 'compact-bar');
  CREATE TYPE "public"."enum_course_pages_blocks_tabs_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_tabs_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_steps_variant" AS ENUM('horizontal-line', 'vertical-stack', 'numbered-cards', 'icon-grid', 'connected-arrow', 'split-image-side');
  CREATE TYPE "public"."enum_course_pages_blocks_steps_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_steps_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_blocks_banner_variant" AS ENUM('announcement-bar', 'promo-strip', 'countdown', 'cookie-consent', 'warning-alert', 'launch-takeover');
  CREATE TYPE "public"."enum_course_pages_blocks_banner_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_course_pages_blocks_banner_tone" AS ENUM('neutral', 'primary', 'success', 'warning', 'danger');
  CREATE TYPE "public"."enum_course_pages_blocks_banner_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_course_pages_blocks_banner_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_course_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__course_pages_v_blocks_hero_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__course_pages_v_blocks_hero_variant" AS ENUM('centered', 'split-left-image', 'split-right-image', 'full-bleed-image', 'video-bg', 'gradient-stack');
  CREATE TYPE "public"."enum__course_pages_v_blocks_hero_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_hero_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_header_variant" AS ENUM('simple-center', 'logo-left-links-right', 'split-logo-center', 'transparent-overlay', 'sticky-blur', 'mega-menu');
  CREATE TYPE "public"."enum__course_pages_v_blocks_header_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__course_pages_v_blocks_header_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_header_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_footer_variant" AS ENUM('minimal-centered', 'multi-column', 'newsletter-cta', 'social-icons', 'dark-corporate', 'compact-bar');
  CREATE TYPE "public"."enum__course_pages_v_blocks_footer_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_footer_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_features_grid_variant" AS ENUM('grid-2-text', 'grid-3-icon', 'grid-3-illustration', 'grid-4-compact', 'alternating-rows', 'bento-mixed');
  CREATE TYPE "public"."enum__course_pages_v_blocks_features_grid_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_features_grid_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_stats_variant" AS ENUM('horizontal-3', 'horizontal-4', 'grid-2x2', 'with-headline-left', 'card-callouts', 'big-numbers');
  CREATE TYPE "public"."enum__course_pages_v_blocks_stats_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_stats_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_testimonials_variant" AS ENUM('grid-3', 'masonry', 'single-large', 'carousel-row', 'avatar-quote', 'video-quote');
  CREATE TYPE "public"."enum__course_pages_v_blocks_testimonials_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_testimonials_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_cta_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__course_pages_v_blocks_cta_variant" AS ENUM('centered', 'split-with-image', 'gradient-banner', 'inline-form', 'dark-banner', 'newsletter-stack');
  CREATE TYPE "public"."enum__course_pages_v_blocks_cta_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_cta_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_faq_variant" AS ENUM('accordion-single', 'accordion-two-column', 'cards-grid', 'inline-list', 'with-cta-aside', 'stacked-callouts');
  CREATE TYPE "public"."enum__course_pages_v_blocks_faq_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_faq_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_logo_cloud_variant" AS ENUM('inline-row', 'grid-4-mono', 'grid-6-color', 'marquee-row', 'with-headline-stack', 'bordered-cells');
  CREATE TYPE "public"."enum__course_pages_v_blocks_logo_cloud_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_logo_cloud_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_content_section_variant" AS ENUM('two-column-text', 'image-left-text-right', 'image-right-text-left', 'centered-prose', 'media-stack', 'quote-callout');
  CREATE TYPE "public"."enum__course_pages_v_blocks_content_section_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__course_pages_v_blocks_content_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_content_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_pricing_table_tiers_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__course_pages_v_blocks_pricing_table_variant" AS ENUM('three-tier-cards', 'two-tier-toggle', 'comparison-matrix', 'single-highlight', 'four-tier-compact', 'feature-list-stack');
  CREATE TYPE "public"."enum__course_pages_v_blocks_pricing_table_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_pricing_table_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_team_variant" AS ENUM('grid-cards', 'circle-avatars', 'detailed-bio', 'leadership-spotlight', 'departments-tabs', 'photo-wall');
  CREATE TYPE "public"."enum__course_pages_v_blocks_team_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_team_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_timeline_variant" AS ENUM('vertical-line', 'horizontal-steps', 'alternating-side', 'milestone-cards', 'minimal-list', 'numbered-stack');
  CREATE TYPE "public"."enum__course_pages_v_blocks_timeline_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_timeline_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_gallery_variant" AS ENUM('grid-3', 'grid-4', 'masonry', 'carousel-strip', 'lightbox-grid', 'split-feature');
  CREATE TYPE "public"."enum__course_pages_v_blocks_gallery_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_gallery_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_newsletter_variant" AS ENUM('inline-bar', 'centered-card', 'split-with-image', 'minimal-input', 'incentive-callout', 'overlay-banner');
  CREATE TYPE "public"."enum__course_pages_v_blocks_newsletter_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_newsletter_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_contact_channels_type" AS ENUM('email', 'phone', 'line', 'address', 'hours');
  CREATE TYPE "public"."enum__course_pages_v_blocks_contact_form_fields_value" AS ENUM('name', 'email', 'phone', 'subject', 'message');
  CREATE TYPE "public"."enum__course_pages_v_blocks_contact_variant" AS ENUM('form-only', 'form-with-info', 'split-with-map', 'multi-channel', 'simple-cta-card', 'office-grid');
  CREATE TYPE "public"."enum__course_pages_v_blocks_contact_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_contact_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_breadcrumb_variant" AS ENUM('simple-chevron', 'simple-slash', 'pill-style', 'underline-style', 'with-page-title', 'compact-mobile');
  CREATE TYPE "public"."enum__course_pages_v_blocks_breadcrumb_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_breadcrumb_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_tabs_section_variant" AS ENUM('horizontal-pills', 'horizontal-underline', 'vertical-side', 'card-stack', 'feature-screenshot', 'compact-bar');
  CREATE TYPE "public"."enum__course_pages_v_blocks_tabs_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_tabs_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_steps_variant" AS ENUM('horizontal-line', 'vertical-stack', 'numbered-cards', 'icon-grid', 'connected-arrow', 'split-image-side');
  CREATE TYPE "public"."enum__course_pages_v_blocks_steps_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_steps_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_blocks_banner_variant" AS ENUM('announcement-bar', 'promo-strip', 'countdown', 'cookie-consent', 'warning-alert', 'launch-takeover');
  CREATE TYPE "public"."enum__course_pages_v_blocks_banner_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__course_pages_v_blocks_banner_tone" AS ENUM('neutral', 'primary', 'success', 'warning', 'danger');
  CREATE TYPE "public"."enum__course_pages_v_blocks_banner_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__course_pages_v_blocks_banner_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__course_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__course_pages_v_published_locale" AS ENUM('zh-TW', 'en');
  CREATE TYPE "public"."enum_posts_blocks_hero_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_posts_blocks_hero_variant" AS ENUM('centered', 'split-left-image', 'split-right-image', 'full-bleed-image', 'video-bg', 'gradient-stack');
  CREATE TYPE "public"."enum_posts_blocks_hero_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_hero_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_header_variant" AS ENUM('simple-center', 'logo-left-links-right', 'split-logo-center', 'transparent-overlay', 'sticky-blur', 'mega-menu');
  CREATE TYPE "public"."enum_posts_blocks_header_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_posts_blocks_header_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_header_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_footer_variant" AS ENUM('minimal-centered', 'multi-column', 'newsletter-cta', 'social-icons', 'dark-corporate', 'compact-bar');
  CREATE TYPE "public"."enum_posts_blocks_footer_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_footer_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_features_grid_variant" AS ENUM('grid-2-text', 'grid-3-icon', 'grid-3-illustration', 'grid-4-compact', 'alternating-rows', 'bento-mixed');
  CREATE TYPE "public"."enum_posts_blocks_features_grid_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_features_grid_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_stats_variant" AS ENUM('horizontal-3', 'horizontal-4', 'grid-2x2', 'with-headline-left', 'card-callouts', 'big-numbers');
  CREATE TYPE "public"."enum_posts_blocks_stats_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_stats_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_testimonials_variant" AS ENUM('grid-3', 'masonry', 'single-large', 'carousel-row', 'avatar-quote', 'video-quote');
  CREATE TYPE "public"."enum_posts_blocks_testimonials_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_testimonials_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_cta_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_posts_blocks_cta_variant" AS ENUM('centered', 'split-with-image', 'gradient-banner', 'inline-form', 'dark-banner', 'newsletter-stack');
  CREATE TYPE "public"."enum_posts_blocks_cta_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_cta_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_faq_variant" AS ENUM('accordion-single', 'accordion-two-column', 'cards-grid', 'inline-list', 'with-cta-aside', 'stacked-callouts');
  CREATE TYPE "public"."enum_posts_blocks_faq_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_faq_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_logo_cloud_variant" AS ENUM('inline-row', 'grid-4-mono', 'grid-6-color', 'marquee-row', 'with-headline-stack', 'bordered-cells');
  CREATE TYPE "public"."enum_posts_blocks_logo_cloud_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_logo_cloud_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_content_section_variant" AS ENUM('two-column-text', 'image-left-text-right', 'image-right-text-left', 'centered-prose', 'media-stack', 'quote-callout');
  CREATE TYPE "public"."enum_posts_blocks_content_section_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_posts_blocks_content_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_content_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_pricing_table_tiers_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_posts_blocks_pricing_table_variant" AS ENUM('three-tier-cards', 'two-tier-toggle', 'comparison-matrix', 'single-highlight', 'four-tier-compact', 'feature-list-stack');
  CREATE TYPE "public"."enum_posts_blocks_pricing_table_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_pricing_table_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_team_variant" AS ENUM('grid-cards', 'circle-avatars', 'detailed-bio', 'leadership-spotlight', 'departments-tabs', 'photo-wall');
  CREATE TYPE "public"."enum_posts_blocks_team_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_team_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_timeline_variant" AS ENUM('vertical-line', 'horizontal-steps', 'alternating-side', 'milestone-cards', 'minimal-list', 'numbered-stack');
  CREATE TYPE "public"."enum_posts_blocks_timeline_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_timeline_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_gallery_variant" AS ENUM('grid-3', 'grid-4', 'masonry', 'carousel-strip', 'lightbox-grid', 'split-feature');
  CREATE TYPE "public"."enum_posts_blocks_gallery_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_gallery_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_newsletter_variant" AS ENUM('inline-bar', 'centered-card', 'split-with-image', 'minimal-input', 'incentive-callout', 'overlay-banner');
  CREATE TYPE "public"."enum_posts_blocks_newsletter_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_newsletter_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_contact_channels_type" AS ENUM('email', 'phone', 'line', 'address', 'hours');
  CREATE TYPE "public"."enum_posts_blocks_contact_form_fields_value" AS ENUM('name', 'email', 'phone', 'subject', 'message');
  CREATE TYPE "public"."enum_posts_blocks_contact_variant" AS ENUM('form-only', 'form-with-info', 'split-with-map', 'multi-channel', 'simple-cta-card', 'office-grid');
  CREATE TYPE "public"."enum_posts_blocks_contact_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_contact_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_breadcrumb_variant" AS ENUM('simple-chevron', 'simple-slash', 'pill-style', 'underline-style', 'with-page-title', 'compact-mobile');
  CREATE TYPE "public"."enum_posts_blocks_breadcrumb_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_breadcrumb_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_tabs_section_variant" AS ENUM('horizontal-pills', 'horizontal-underline', 'vertical-side', 'card-stack', 'feature-screenshot', 'compact-bar');
  CREATE TYPE "public"."enum_posts_blocks_tabs_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_tabs_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_steps_variant" AS ENUM('horizontal-line', 'vertical-stack', 'numbered-cards', 'icon-grid', 'connected-arrow', 'split-image-side');
  CREATE TYPE "public"."enum_posts_blocks_steps_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_steps_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_blocks_banner_variant" AS ENUM('announcement-bar', 'promo-strip', 'countdown', 'cookie-consent', 'warning-alert', 'launch-takeover');
  CREATE TYPE "public"."enum_posts_blocks_banner_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum_posts_blocks_banner_tone" AS ENUM('neutral', 'primary', 'success', 'warning', 'danger');
  CREATE TYPE "public"."enum_posts_blocks_banner_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum_posts_blocks_banner_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_posts_comment_source" AS ENUM('builtin', 'disqus', 'disabled');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_blocks_hero_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__posts_v_blocks_hero_variant" AS ENUM('centered', 'split-left-image', 'split-right-image', 'full-bleed-image', 'video-bg', 'gradient-stack');
  CREATE TYPE "public"."enum__posts_v_blocks_hero_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_hero_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_header_variant" AS ENUM('simple-center', 'logo-left-links-right', 'split-logo-center', 'transparent-overlay', 'sticky-blur', 'mega-menu');
  CREATE TYPE "public"."enum__posts_v_blocks_header_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__posts_v_blocks_header_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_header_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_footer_variant" AS ENUM('minimal-centered', 'multi-column', 'newsletter-cta', 'social-icons', 'dark-corporate', 'compact-bar');
  CREATE TYPE "public"."enum__posts_v_blocks_footer_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_footer_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_features_grid_variant" AS ENUM('grid-2-text', 'grid-3-icon', 'grid-3-illustration', 'grid-4-compact', 'alternating-rows', 'bento-mixed');
  CREATE TYPE "public"."enum__posts_v_blocks_features_grid_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_features_grid_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_stats_variant" AS ENUM('horizontal-3', 'horizontal-4', 'grid-2x2', 'with-headline-left', 'card-callouts', 'big-numbers');
  CREATE TYPE "public"."enum__posts_v_blocks_stats_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_stats_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_testimonials_variant" AS ENUM('grid-3', 'masonry', 'single-large', 'carousel-row', 'avatar-quote', 'video-quote');
  CREATE TYPE "public"."enum__posts_v_blocks_testimonials_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_testimonials_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_cta_ctas_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__posts_v_blocks_cta_variant" AS ENUM('centered', 'split-with-image', 'gradient-banner', 'inline-form', 'dark-banner', 'newsletter-stack');
  CREATE TYPE "public"."enum__posts_v_blocks_cta_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_cta_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_faq_variant" AS ENUM('accordion-single', 'accordion-two-column', 'cards-grid', 'inline-list', 'with-cta-aside', 'stacked-callouts');
  CREATE TYPE "public"."enum__posts_v_blocks_faq_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_faq_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_logo_cloud_variant" AS ENUM('inline-row', 'grid-4-mono', 'grid-6-color', 'marquee-row', 'with-headline-stack', 'bordered-cells');
  CREATE TYPE "public"."enum__posts_v_blocks_logo_cloud_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_logo_cloud_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_content_section_variant" AS ENUM('two-column-text', 'image-left-text-right', 'image-right-text-left', 'centered-prose', 'media-stack', 'quote-callout');
  CREATE TYPE "public"."enum__posts_v_blocks_content_section_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__posts_v_blocks_content_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_content_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_pricing_table_tiers_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__posts_v_blocks_pricing_table_variant" AS ENUM('three-tier-cards', 'two-tier-toggle', 'comparison-matrix', 'single-highlight', 'four-tier-compact', 'feature-list-stack');
  CREATE TYPE "public"."enum__posts_v_blocks_pricing_table_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_pricing_table_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_team_variant" AS ENUM('grid-cards', 'circle-avatars', 'detailed-bio', 'leadership-spotlight', 'departments-tabs', 'photo-wall');
  CREATE TYPE "public"."enum__posts_v_blocks_team_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_team_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_timeline_variant" AS ENUM('vertical-line', 'horizontal-steps', 'alternating-side', 'milestone-cards', 'minimal-list', 'numbered-stack');
  CREATE TYPE "public"."enum__posts_v_blocks_timeline_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_timeline_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_gallery_variant" AS ENUM('grid-3', 'grid-4', 'masonry', 'carousel-strip', 'lightbox-grid', 'split-feature');
  CREATE TYPE "public"."enum__posts_v_blocks_gallery_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_gallery_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_newsletter_variant" AS ENUM('inline-bar', 'centered-card', 'split-with-image', 'minimal-input', 'incentive-callout', 'overlay-banner');
  CREATE TYPE "public"."enum__posts_v_blocks_newsletter_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_newsletter_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_contact_channels_type" AS ENUM('email', 'phone', 'line', 'address', 'hours');
  CREATE TYPE "public"."enum__posts_v_blocks_contact_form_fields_value" AS ENUM('name', 'email', 'phone', 'subject', 'message');
  CREATE TYPE "public"."enum__posts_v_blocks_contact_variant" AS ENUM('form-only', 'form-with-info', 'split-with-map', 'multi-channel', 'simple-cta-card', 'office-grid');
  CREATE TYPE "public"."enum__posts_v_blocks_contact_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_contact_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_breadcrumb_variant" AS ENUM('simple-chevron', 'simple-slash', 'pill-style', 'underline-style', 'with-page-title', 'compact-mobile');
  CREATE TYPE "public"."enum__posts_v_blocks_breadcrumb_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_breadcrumb_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_tabs_section_variant" AS ENUM('horizontal-pills', 'horizontal-underline', 'vertical-side', 'card-stack', 'feature-screenshot', 'compact-bar');
  CREATE TYPE "public"."enum__posts_v_blocks_tabs_section_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_tabs_section_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_steps_variant" AS ENUM('horizontal-line', 'vertical-stack', 'numbered-cards', 'icon-grid', 'connected-arrow', 'split-image-side');
  CREATE TYPE "public"."enum__posts_v_blocks_steps_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_steps_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_blocks_banner_variant" AS ENUM('announcement-bar', 'promo-strip', 'countdown', 'cookie-consent', 'warning-alert', 'launch-takeover');
  CREATE TYPE "public"."enum__posts_v_blocks_banner_cta_variant" AS ENUM('default', 'secondary', 'outline', 'ghost', 'destructive', 'link');
  CREATE TYPE "public"."enum__posts_v_blocks_banner_tone" AS ENUM('neutral', 'primary', 'success', 'warning', 'danger');
  CREATE TYPE "public"."enum__posts_v_blocks_banner_motion_variant" AS ENUM('fadeIn', 'slideUp', 'slideRight', 'scale');
  CREATE TYPE "public"."enum__posts_v_blocks_banner_motion_level" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__posts_v_version_comment_source" AS ENUM('builtin', 'disqus', 'disabled');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('zh-TW', 'en');
  CREATE TYPE "public"."enum_comments_status" AS ENUM('pending', 'approved', 'spam', 'rejected');
  CREATE TYPE "public"."enum_cta_blocks_placement" AS ENUM('inline', 'end-of-post', 'sidebar');
  CREATE TYPE "public"."enum_marketing_click_events_source" AS ENUM('cta', 'lead-magnet', 'share');
  CREATE TYPE "public"."enum_workflow_executions_status" AS ENUM('queued', 'running', 'completed', 'failed', 'cancelled');
  CREATE TYPE "public"."enum_workflow_executions_trigger_kind" AS ENUM('signup', 'tag-added', 'tag-removed', 'page-viewed', 'form-submitted', 'order-placed', 'manual');
  CREATE TYPE "public"."enum_workflow_registry_status" AS ENUM('draft', 'active', 'paused', 'archived');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor',
  	"totp_secret" varchar,
  	"totp_enabled" boolean DEFAULT false,
  	"totp_enabled_at" timestamp(3) with time zone,
  	"recovery_codes" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"cover_id" integer,
  	"parent_id" integer,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "authors_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar,
  	"bio" varchar,
  	"avatar_id" integer,
  	"user_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "post_series" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"cover_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "course_chapters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum_pages_blocks_hero_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_hero_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"image_id" integer,
  	"video_url" varchar,
  	"motion_variant" "enum_pages_blocks_hero_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_hero_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_header_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_header_variant" DEFAULT 'logo-left-links-right',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_pages_blocks_header_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum_pages_blocks_header_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_header_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "pages_blocks_footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_footer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_footer_variant" DEFAULT 'multi-column',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"tagline" varchar,
  	"copyright" varchar DEFAULT '',
  	"motion_variant" "enum_pages_blocks_footer_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_footer_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_features_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_features_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_features_grid_variant" DEFAULT 'grid-3-icon',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_pages_blocks_features_grid_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_features_grid_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_stats_variant" DEFAULT 'horizontal-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_pages_blocks_stats_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_stats_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author_name" varchar,
  	"author_title" varchar,
  	"avatar_id" integer,
  	"rating" numeric,
  	"video_url" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_testimonials_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_pages_blocks_testimonials_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_testimonials_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum_pages_blocks_cta_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_cta_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"form_placeholder" varchar DEFAULT '輸入 Email',
  	"form_submit_label" varchar DEFAULT '訂閱',
  	"motion_variant" "enum_pages_blocks_cta_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_cta_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_faq_variant" DEFAULT 'accordion-single',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"contact_hint" varchar,
  	"motion_variant" "enum_pages_blocks_faq_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_faq_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_logo_cloud_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer,
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_logo_cloud" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_logo_cloud_variant" DEFAULT 'grid-6-color',
  	"headline" varchar,
  	"motion_variant" "enum_pages_blocks_logo_cloud_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_logo_cloud_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_content_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_content_section_variant" DEFAULT 'centered-prose',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"body" varchar,
  	"highlighted_quote" varchar,
  	"image_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_pages_blocks_content_section_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum_pages_blocks_content_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_content_section_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_table_tiers_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_table_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"price_suffix" varchar DEFAULT '/月',
  	"description" varchar,
  	"highlighted" boolean DEFAULT false,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_pages_blocks_pricing_table_tiers_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_pricing_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_pricing_table_variant" DEFAULT 'three-tier-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_pages_blocks_pricing_table_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_pricing_table_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_team_members_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"bio" varchar,
  	"photo_id" integer,
  	"department" varchar
  );
  
  CREATE TABLE "pages_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_team_variant" DEFAULT 'grid-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_pages_blocks_team_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_team_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" varchar,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_timeline_variant" DEFAULT 'vertical-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_pages_blocks_timeline_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_timeline_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"category" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_gallery_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_pages_blocks_gallery_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_gallery_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_newsletter_variant" DEFAULT 'centered-card',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"email_placeholder" varchar DEFAULT '輸入 Email',
  	"submit_label" varchar DEFAULT '訂閱',
  	"incentive" varchar,
  	"privacy_note" varchar DEFAULT '我們不會與第三方分享你的 Email。',
  	"motion_variant" "enum_pages_blocks_newsletter_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_newsletter_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_pages_blocks_contact_channels_type",
  	"label" varchar,
  	"value" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_offices" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"city" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_form_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" "enum_pages_blocks_contact_form_fields_value"
  );
  
  CREATE TABLE "pages_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_contact_variant" DEFAULT 'form-with-info',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"submit_label" varchar DEFAULT '送出',
  	"motion_variant" "enum_pages_blocks_contact_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_contact_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_breadcrumb_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_breadcrumb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_breadcrumb_variant" DEFAULT 'simple-chevron',
  	"current_title" varchar,
  	"motion_variant" "enum_pages_blocks_breadcrumb_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_breadcrumb_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_tabs_section_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"title" varchar,
  	"body" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_tabs_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_tabs_section_variant" DEFAULT 'horizontal-underline',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_pages_blocks_tabs_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_tabs_section_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_steps_variant" DEFAULT 'horizontal-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_pages_blocks_steps_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_steps_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_banner_variant" DEFAULT 'announcement-bar',
  	"message" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_pages_blocks_banner_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"ends_at" varchar,
  	"dismissible" boolean DEFAULT true,
  	"tone" "enum_pages_blocks_banner_tone" DEFAULT 'primary',
  	"motion_variant" "enum_pages_blocks_banner_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_pages_blocks_banner_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar,
  	"slug" varchar,
  	"parent_id" integer,
  	"is_homepage" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 0,
  	"status" "enum_pages_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"scheduled_at" timestamp(3) with time zone,
  	"seo_canonical" varchar,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"seo_nofollow" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum__pages_v_blocks_hero_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_hero_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"image_id" integer,
  	"video_url" varchar,
  	"motion_variant" "enum__pages_v_blocks_hero_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_hero_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_header_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_header_variant" DEFAULT 'logo-left-links-right',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__pages_v_blocks_header_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum__pages_v_blocks_header_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_header_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_footer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_footer_variant" DEFAULT 'multi-column',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"tagline" varchar,
  	"copyright" varchar DEFAULT '',
  	"motion_variant" "enum__pages_v_blocks_footer_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_footer_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_features_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_features_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_features_grid_variant" DEFAULT 'grid-3-icon',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__pages_v_blocks_features_grid_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_features_grid_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_stats_variant" DEFAULT 'horizontal-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__pages_v_blocks_stats_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_stats_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author_name" varchar,
  	"author_title" varchar,
  	"avatar_id" integer,
  	"rating" numeric,
  	"video_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_testimonials_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__pages_v_blocks_testimonials_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_testimonials_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum__pages_v_blocks_cta_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_cta_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"form_placeholder" varchar DEFAULT '輸入 Email',
  	"form_submit_label" varchar DEFAULT '訂閱',
  	"motion_variant" "enum__pages_v_blocks_cta_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_cta_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_faq_variant" DEFAULT 'accordion-single',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"contact_hint" varchar,
  	"motion_variant" "enum__pages_v_blocks_faq_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_faq_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_logo_cloud_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_logo_cloud" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_logo_cloud_variant" DEFAULT 'grid-6-color',
  	"headline" varchar,
  	"motion_variant" "enum__pages_v_blocks_logo_cloud_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_logo_cloud_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_content_section_variant" DEFAULT 'centered-prose',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"body" varchar,
  	"highlighted_quote" varchar,
  	"image_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__pages_v_blocks_content_section_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum__pages_v_blocks_content_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_content_section_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_table_tiers_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_table_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"price_suffix" varchar DEFAULT '/月',
  	"description" varchar,
  	"highlighted" boolean DEFAULT false,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__pages_v_blocks_pricing_table_tiers_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_pricing_table_variant" DEFAULT 'three-tier-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__pages_v_blocks_pricing_table_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_pricing_table_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_team_members_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"bio" varchar,
  	"photo_id" integer,
  	"department" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_team_variant" DEFAULT 'grid-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__pages_v_blocks_team_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_team_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" varchar,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_timeline_variant" DEFAULT 'vertical-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__pages_v_blocks_timeline_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_timeline_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"category" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_gallery_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__pages_v_blocks_gallery_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_gallery_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_newsletter_variant" DEFAULT 'centered-card',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"email_placeholder" varchar DEFAULT '輸入 Email',
  	"submit_label" varchar DEFAULT '訂閱',
  	"incentive" varchar,
  	"privacy_note" varchar DEFAULT '我們不會與第三方分享你的 Email。',
  	"motion_variant" "enum__pages_v_blocks_newsletter_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_newsletter_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__pages_v_blocks_contact_channels_type",
  	"label" varchar,
  	"value" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_offices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"city" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_form_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" "enum__pages_v_blocks_contact_form_fields_value",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_contact_variant" DEFAULT 'form-with-info',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"submit_label" varchar DEFAULT '送出',
  	"motion_variant" "enum__pages_v_blocks_contact_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_contact_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_breadcrumb_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_breadcrumb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_breadcrumb_variant" DEFAULT 'simple-chevron',
  	"current_title" varchar,
  	"motion_variant" "enum__pages_v_blocks_breadcrumb_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_breadcrumb_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tabs_section_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"title" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tabs_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_tabs_section_variant" DEFAULT 'horizontal-underline',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__pages_v_blocks_tabs_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_tabs_section_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_steps_variant" DEFAULT 'horizontal-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__pages_v_blocks_steps_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_steps_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_banner_variant" DEFAULT 'announcement-bar',
  	"message" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__pages_v_blocks_banner_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"ends_at" varchar,
  	"dismissible" boolean DEFAULT true,
  	"tone" "enum__pages_v_blocks_banner_tone" DEFAULT 'primary',
  	"motion_variant" "enum__pages_v_blocks_banner_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__pages_v_blocks_banner_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_version_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" varchar,
  	"version_slug" varchar,
  	"version_parent_id" integer,
  	"version_is_homepage" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_scheduled_at" timestamp(3) with time zone,
  	"version_seo_canonical" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_seo_nofollow" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "shop_pages_blocks_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum_shop_pages_blocks_hero_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false
  );
  
  CREATE TABLE "shop_pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_hero_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"image_id" integer,
  	"video_url" varchar,
  	"motion_variant" "enum_shop_pages_blocks_hero_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_hero_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_header_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "shop_pages_blocks_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_header_variant" DEFAULT 'logo-left-links-right',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_shop_pages_blocks_header_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum_shop_pages_blocks_header_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_header_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "shop_pages_blocks_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "shop_pages_blocks_footer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_footer_variant" DEFAULT 'multi-column',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"tagline" varchar,
  	"copyright" varchar DEFAULT '',
  	"motion_variant" "enum_shop_pages_blocks_footer_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_footer_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_features_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "shop_pages_blocks_features_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_features_grid_variant" DEFAULT 'grid-3-icon',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_shop_pages_blocks_features_grid_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_features_grid_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_stats_variant" DEFAULT 'horizontal-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_shop_pages_blocks_stats_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_stats_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author_name" varchar,
  	"author_title" varchar,
  	"avatar_id" integer,
  	"rating" numeric,
  	"video_url" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_testimonials_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_shop_pages_blocks_testimonials_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_testimonials_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_cta_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum_shop_pages_blocks_cta_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false
  );
  
  CREATE TABLE "shop_pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_cta_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"form_placeholder" varchar DEFAULT '輸入 Email',
  	"form_submit_label" varchar DEFAULT '訂閱',
  	"motion_variant" "enum_shop_pages_blocks_cta_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_cta_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_faq_variant" DEFAULT 'accordion-single',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"contact_hint" varchar,
  	"motion_variant" "enum_shop_pages_blocks_faq_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_faq_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_logo_cloud_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer,
  	"href" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_logo_cloud" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_logo_cloud_variant" DEFAULT 'grid-6-color',
  	"headline" varchar,
  	"motion_variant" "enum_shop_pages_blocks_logo_cloud_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_logo_cloud_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_content_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_content_section_variant" DEFAULT 'centered-prose',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"body" varchar,
  	"highlighted_quote" varchar,
  	"image_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_shop_pages_blocks_content_section_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum_shop_pages_blocks_content_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_content_section_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_pricing_table_tiers_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_pricing_table_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"price_suffix" varchar DEFAULT '/月',
  	"description" varchar,
  	"highlighted" boolean DEFAULT false,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_shop_pages_blocks_pricing_table_tiers_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false
  );
  
  CREATE TABLE "shop_pages_blocks_pricing_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_pricing_table_variant" DEFAULT 'three-tier-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_shop_pages_blocks_pricing_table_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_pricing_table_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_team_members_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "shop_pages_blocks_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"bio" varchar,
  	"photo_id" integer,
  	"department" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_team_variant" DEFAULT 'grid-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_shop_pages_blocks_team_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_team_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" varchar,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_timeline_variant" DEFAULT 'vertical-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_shop_pages_blocks_timeline_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_timeline_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"category" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_gallery_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_shop_pages_blocks_gallery_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_gallery_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_newsletter_variant" DEFAULT 'centered-card',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"email_placeholder" varchar DEFAULT '輸入 Email',
  	"submit_label" varchar DEFAULT '訂閱',
  	"incentive" varchar,
  	"privacy_note" varchar DEFAULT '我們不會與第三方分享你的 Email。',
  	"motion_variant" "enum_shop_pages_blocks_newsletter_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_newsletter_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_contact_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_shop_pages_blocks_contact_channels_type",
  	"label" varchar,
  	"value" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_contact_offices" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"city" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_contact_form_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" "enum_shop_pages_blocks_contact_form_fields_value"
  );
  
  CREATE TABLE "shop_pages_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_contact_variant" DEFAULT 'form-with-info',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"submit_label" varchar DEFAULT '送出',
  	"motion_variant" "enum_shop_pages_blocks_contact_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_contact_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_breadcrumb_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "shop_pages_blocks_breadcrumb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_breadcrumb_variant" DEFAULT 'simple-chevron',
  	"current_title" varchar,
  	"motion_variant" "enum_shop_pages_blocks_breadcrumb_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_breadcrumb_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_tabs_section_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"title" varchar,
  	"body" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "shop_pages_blocks_tabs_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_tabs_section_variant" DEFAULT 'horizontal-underline',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_shop_pages_blocks_tabs_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_tabs_section_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "shop_pages_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_steps_variant" DEFAULT 'horizontal-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_shop_pages_blocks_steps_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_steps_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_shop_pages_blocks_banner_variant" DEFAULT 'announcement-bar',
  	"message" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_shop_pages_blocks_banner_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"ends_at" varchar,
  	"dismissible" boolean DEFAULT true,
  	"tone" "enum_shop_pages_blocks_banner_tone" DEFAULT 'primary',
  	"motion_variant" "enum_shop_pages_blocks_banner_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_shop_pages_blocks_banner_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "shop_pages_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "shop_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar,
  	"slug" varchar,
  	"product_id" integer,
  	"status" "enum_shop_pages_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"scheduled_at" timestamp(3) with time zone,
  	"seo_canonical" varchar,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"seo_nofollow" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_shop_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "shop_pages_locales" (
  	"title" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_shop_pages_v_blocks_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum__shop_pages_v_blocks_hero_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_hero_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"image_id" integer,
  	"video_url" varchar,
  	"motion_variant" "enum__shop_pages_v_blocks_hero_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_hero_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_header_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_header_variant" DEFAULT 'logo-left-links-right',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__shop_pages_v_blocks_header_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum__shop_pages_v_blocks_header_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_header_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_footer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_footer_variant" DEFAULT 'multi-column',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"tagline" varchar,
  	"copyright" varchar DEFAULT '',
  	"motion_variant" "enum__shop_pages_v_blocks_footer_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_footer_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_features_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_features_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_features_grid_variant" DEFAULT 'grid-3-icon',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__shop_pages_v_blocks_features_grid_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_features_grid_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_stats_variant" DEFAULT 'horizontal-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__shop_pages_v_blocks_stats_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_stats_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author_name" varchar,
  	"author_title" varchar,
  	"avatar_id" integer,
  	"rating" numeric,
  	"video_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_testimonials_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__shop_pages_v_blocks_testimonials_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_testimonials_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_cta_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum__shop_pages_v_blocks_cta_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_cta_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"form_placeholder" varchar DEFAULT '輸入 Email',
  	"form_submit_label" varchar DEFAULT '訂閱',
  	"motion_variant" "enum__shop_pages_v_blocks_cta_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_cta_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_faq_variant" DEFAULT 'accordion-single',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"contact_hint" varchar,
  	"motion_variant" "enum__shop_pages_v_blocks_faq_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_faq_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_logo_cloud_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_logo_cloud" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_logo_cloud_variant" DEFAULT 'grid-6-color',
  	"headline" varchar,
  	"motion_variant" "enum__shop_pages_v_blocks_logo_cloud_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_logo_cloud_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_content_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_content_section_variant" DEFAULT 'centered-prose',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"body" varchar,
  	"highlighted_quote" varchar,
  	"image_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__shop_pages_v_blocks_content_section_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum__shop_pages_v_blocks_content_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_content_section_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_pricing_table_tiers_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_pricing_table_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"price_suffix" varchar DEFAULT '/月',
  	"description" varchar,
  	"highlighted" boolean DEFAULT false,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__shop_pages_v_blocks_pricing_table_tiers_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_pricing_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_pricing_table_variant" DEFAULT 'three-tier-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__shop_pages_v_blocks_pricing_table_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_pricing_table_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_team_members_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"bio" varchar,
  	"photo_id" integer,
  	"department" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_team_variant" DEFAULT 'grid-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__shop_pages_v_blocks_team_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_team_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" varchar,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_timeline_variant" DEFAULT 'vertical-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__shop_pages_v_blocks_timeline_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_timeline_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"category" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_gallery_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__shop_pages_v_blocks_gallery_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_gallery_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_newsletter_variant" DEFAULT 'centered-card',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"email_placeholder" varchar DEFAULT '輸入 Email',
  	"submit_label" varchar DEFAULT '訂閱',
  	"incentive" varchar,
  	"privacy_note" varchar DEFAULT '我們不會與第三方分享你的 Email。',
  	"motion_variant" "enum__shop_pages_v_blocks_newsletter_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_newsletter_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_contact_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__shop_pages_v_blocks_contact_channels_type",
  	"label" varchar,
  	"value" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_contact_offices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"city" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_contact_form_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" "enum__shop_pages_v_blocks_contact_form_fields_value",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_contact_variant" DEFAULT 'form-with-info',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"submit_label" varchar DEFAULT '送出',
  	"motion_variant" "enum__shop_pages_v_blocks_contact_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_contact_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_breadcrumb_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_breadcrumb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_breadcrumb_variant" DEFAULT 'simple-chevron',
  	"current_title" varchar,
  	"motion_variant" "enum__shop_pages_v_blocks_breadcrumb_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_breadcrumb_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_tabs_section_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"title" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_tabs_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_tabs_section_variant" DEFAULT 'horizontal-underline',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__shop_pages_v_blocks_tabs_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_tabs_section_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_steps_variant" DEFAULT 'horizontal-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__shop_pages_v_blocks_steps_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_steps_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__shop_pages_v_blocks_banner_variant" DEFAULT 'announcement-bar',
  	"message" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__shop_pages_v_blocks_banner_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"ends_at" varchar,
  	"dismissible" boolean DEFAULT true,
  	"tone" "enum__shop_pages_v_blocks_banner_tone" DEFAULT 'primary',
  	"motion_variant" "enum__shop_pages_v_blocks_banner_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__shop_pages_v_blocks_banner_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_shop_pages_v_version_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shop_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" varchar,
  	"version_slug" varchar,
  	"version_product_id" integer,
  	"version_status" "enum__shop_pages_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_scheduled_at" timestamp(3) with time zone,
  	"version_seo_canonical" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_seo_nofollow" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__shop_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__shop_pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_shop_pages_v_locales" (
  	"version_title" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "course_pages_blocks_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum_course_pages_blocks_hero_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false
  );
  
  CREATE TABLE "course_pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_hero_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"image_id" integer,
  	"video_url" varchar,
  	"motion_variant" "enum_course_pages_blocks_hero_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_hero_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_header_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "course_pages_blocks_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_header_variant" DEFAULT 'logo-left-links-right',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_course_pages_blocks_header_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum_course_pages_blocks_header_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_header_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "course_pages_blocks_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "course_pages_blocks_footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "course_pages_blocks_footer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_footer_variant" DEFAULT 'multi-column',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"tagline" varchar,
  	"copyright" varchar DEFAULT '',
  	"motion_variant" "enum_course_pages_blocks_footer_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_footer_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_features_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "course_pages_blocks_features_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_features_grid_variant" DEFAULT 'grid-3-icon',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_course_pages_blocks_features_grid_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_features_grid_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "course_pages_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_stats_variant" DEFAULT 'horizontal-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_course_pages_blocks_stats_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_stats_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author_name" varchar,
  	"author_title" varchar,
  	"avatar_id" integer,
  	"rating" numeric,
  	"video_url" varchar
  );
  
  CREATE TABLE "course_pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_testimonials_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_course_pages_blocks_testimonials_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_testimonials_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_cta_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum_course_pages_blocks_cta_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false
  );
  
  CREATE TABLE "course_pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_cta_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"form_placeholder" varchar DEFAULT '輸入 Email',
  	"form_submit_label" varchar DEFAULT '訂閱',
  	"motion_variant" "enum_course_pages_blocks_cta_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_cta_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "course_pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_faq_variant" DEFAULT 'accordion-single',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"contact_hint" varchar,
  	"motion_variant" "enum_course_pages_blocks_faq_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_faq_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_logo_cloud_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer,
  	"href" varchar
  );
  
  CREATE TABLE "course_pages_blocks_logo_cloud" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_logo_cloud_variant" DEFAULT 'grid-6-color',
  	"headline" varchar,
  	"motion_variant" "enum_course_pages_blocks_logo_cloud_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_logo_cloud_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_content_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_content_section_variant" DEFAULT 'centered-prose',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"body" varchar,
  	"highlighted_quote" varchar,
  	"image_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_course_pages_blocks_content_section_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum_course_pages_blocks_content_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_content_section_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_pricing_table_tiers_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "course_pages_blocks_pricing_table_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"price_suffix" varchar DEFAULT '/月',
  	"description" varchar,
  	"highlighted" boolean DEFAULT false,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_course_pages_blocks_pricing_table_tiers_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false
  );
  
  CREATE TABLE "course_pages_blocks_pricing_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_pricing_table_variant" DEFAULT 'three-tier-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_course_pages_blocks_pricing_table_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_pricing_table_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_team_members_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "course_pages_blocks_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"bio" varchar,
  	"photo_id" integer,
  	"department" varchar
  );
  
  CREATE TABLE "course_pages_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_team_variant" DEFAULT 'grid-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_course_pages_blocks_team_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_team_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" varchar,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar
  );
  
  CREATE TABLE "course_pages_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_timeline_variant" DEFAULT 'vertical-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_course_pages_blocks_timeline_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_timeline_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"category" varchar
  );
  
  CREATE TABLE "course_pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_gallery_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_course_pages_blocks_gallery_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_gallery_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_newsletter_variant" DEFAULT 'centered-card',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"email_placeholder" varchar DEFAULT '輸入 Email',
  	"submit_label" varchar DEFAULT '訂閱',
  	"incentive" varchar,
  	"privacy_note" varchar DEFAULT '我們不會與第三方分享你的 Email。',
  	"motion_variant" "enum_course_pages_blocks_newsletter_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_newsletter_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_contact_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_course_pages_blocks_contact_channels_type",
  	"label" varchar,
  	"value" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "course_pages_blocks_contact_offices" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"city" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar
  );
  
  CREATE TABLE "course_pages_blocks_contact_form_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" "enum_course_pages_blocks_contact_form_fields_value"
  );
  
  CREATE TABLE "course_pages_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_contact_variant" DEFAULT 'form-with-info',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"submit_label" varchar DEFAULT '送出',
  	"motion_variant" "enum_course_pages_blocks_contact_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_contact_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_breadcrumb_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "course_pages_blocks_breadcrumb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_breadcrumb_variant" DEFAULT 'simple-chevron',
  	"current_title" varchar,
  	"motion_variant" "enum_course_pages_blocks_breadcrumb_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_breadcrumb_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_tabs_section_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"title" varchar,
  	"body" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "course_pages_blocks_tabs_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_tabs_section_variant" DEFAULT 'horizontal-underline',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_course_pages_blocks_tabs_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_tabs_section_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "course_pages_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_steps_variant" DEFAULT 'horizontal-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_course_pages_blocks_steps_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_steps_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_course_pages_blocks_banner_variant" DEFAULT 'announcement-bar',
  	"message" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_course_pages_blocks_banner_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"ends_at" varchar,
  	"dismissible" boolean DEFAULT true,
  	"tone" "enum_course_pages_blocks_banner_tone" DEFAULT 'primary',
  	"motion_variant" "enum_course_pages_blocks_banner_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_course_pages_blocks_banner_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "course_pages_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "course_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar,
  	"slug" varchar,
  	"course_id" integer,
  	"status" "enum_course_pages_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"scheduled_at" timestamp(3) with time zone,
  	"seo_canonical" varchar,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"seo_nofollow" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_course_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "course_pages_locales" (
  	"title" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_course_pages_v_blocks_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum__course_pages_v_blocks_hero_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_hero_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"image_id" integer,
  	"video_url" varchar,
  	"motion_variant" "enum__course_pages_v_blocks_hero_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_hero_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_header_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_header_variant" DEFAULT 'logo-left-links-right',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__course_pages_v_blocks_header_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum__course_pages_v_blocks_header_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_header_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_footer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_footer_variant" DEFAULT 'multi-column',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"tagline" varchar,
  	"copyright" varchar DEFAULT '',
  	"motion_variant" "enum__course_pages_v_blocks_footer_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_footer_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_features_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_features_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_features_grid_variant" DEFAULT 'grid-3-icon',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__course_pages_v_blocks_features_grid_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_features_grid_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_stats_variant" DEFAULT 'horizontal-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__course_pages_v_blocks_stats_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_stats_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author_name" varchar,
  	"author_title" varchar,
  	"avatar_id" integer,
  	"rating" numeric,
  	"video_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_testimonials_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__course_pages_v_blocks_testimonials_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_testimonials_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_cta_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum__course_pages_v_blocks_cta_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_cta_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"form_placeholder" varchar DEFAULT '輸入 Email',
  	"form_submit_label" varchar DEFAULT '訂閱',
  	"motion_variant" "enum__course_pages_v_blocks_cta_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_cta_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_faq_variant" DEFAULT 'accordion-single',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"contact_hint" varchar,
  	"motion_variant" "enum__course_pages_v_blocks_faq_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_faq_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_logo_cloud_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_logo_cloud" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_logo_cloud_variant" DEFAULT 'grid-6-color',
  	"headline" varchar,
  	"motion_variant" "enum__course_pages_v_blocks_logo_cloud_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_logo_cloud_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_content_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_content_section_variant" DEFAULT 'centered-prose',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"body" varchar,
  	"highlighted_quote" varchar,
  	"image_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__course_pages_v_blocks_content_section_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum__course_pages_v_blocks_content_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_content_section_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_pricing_table_tiers_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_pricing_table_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"price_suffix" varchar DEFAULT '/月',
  	"description" varchar,
  	"highlighted" boolean DEFAULT false,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__course_pages_v_blocks_pricing_table_tiers_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_pricing_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_pricing_table_variant" DEFAULT 'three-tier-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__course_pages_v_blocks_pricing_table_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_pricing_table_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_team_members_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"bio" varchar,
  	"photo_id" integer,
  	"department" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_team_variant" DEFAULT 'grid-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__course_pages_v_blocks_team_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_team_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" varchar,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_timeline_variant" DEFAULT 'vertical-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__course_pages_v_blocks_timeline_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_timeline_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"category" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_gallery_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__course_pages_v_blocks_gallery_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_gallery_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_newsletter_variant" DEFAULT 'centered-card',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"email_placeholder" varchar DEFAULT '輸入 Email',
  	"submit_label" varchar DEFAULT '訂閱',
  	"incentive" varchar,
  	"privacy_note" varchar DEFAULT '我們不會與第三方分享你的 Email。',
  	"motion_variant" "enum__course_pages_v_blocks_newsletter_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_newsletter_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_contact_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__course_pages_v_blocks_contact_channels_type",
  	"label" varchar,
  	"value" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_contact_offices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"city" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_contact_form_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" "enum__course_pages_v_blocks_contact_form_fields_value",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_contact_variant" DEFAULT 'form-with-info',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"submit_label" varchar DEFAULT '送出',
  	"motion_variant" "enum__course_pages_v_blocks_contact_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_contact_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_breadcrumb_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_breadcrumb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_breadcrumb_variant" DEFAULT 'simple-chevron',
  	"current_title" varchar,
  	"motion_variant" "enum__course_pages_v_blocks_breadcrumb_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_breadcrumb_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_tabs_section_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"title" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_tabs_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_tabs_section_variant" DEFAULT 'horizontal-underline',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__course_pages_v_blocks_tabs_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_tabs_section_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_steps_variant" DEFAULT 'horizontal-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__course_pages_v_blocks_steps_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_steps_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__course_pages_v_blocks_banner_variant" DEFAULT 'announcement-bar',
  	"message" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__course_pages_v_blocks_banner_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"ends_at" varchar,
  	"dismissible" boolean DEFAULT true,
  	"tone" "enum__course_pages_v_blocks_banner_tone" DEFAULT 'primary',
  	"motion_variant" "enum__course_pages_v_blocks_banner_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__course_pages_v_blocks_banner_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_course_pages_v_version_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_course_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" varchar,
  	"version_slug" varchar,
  	"version_course_id" integer,
  	"version_status" "enum__course_pages_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_scheduled_at" timestamp(3) with time zone,
  	"version_seo_canonical" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_seo_nofollow" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__course_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__course_pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_course_pages_v_locales" (
  	"version_title" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_blocks_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum_posts_blocks_hero_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false
  );
  
  CREATE TABLE "posts_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_hero_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"image_id" integer,
  	"video_url" varchar,
  	"motion_variant" "enum_posts_blocks_hero_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_hero_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_header_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "posts_blocks_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_header_variant" DEFAULT 'logo-left-links-right',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_posts_blocks_header_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum_posts_blocks_header_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_header_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "posts_blocks_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "posts_blocks_footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "posts_blocks_footer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_footer_variant" DEFAULT 'multi-column',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"tagline" varchar,
  	"copyright" varchar DEFAULT '',
  	"motion_variant" "enum_posts_blocks_footer_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_footer_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_features_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "posts_blocks_features_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_features_grid_variant" DEFAULT 'grid-3-icon',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_posts_blocks_features_grid_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_features_grid_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "posts_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_stats_variant" DEFAULT 'horizontal-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_posts_blocks_stats_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_stats_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author_name" varchar,
  	"author_title" varchar,
  	"avatar_id" integer,
  	"rating" numeric,
  	"video_url" varchar
  );
  
  CREATE TABLE "posts_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_testimonials_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_posts_blocks_testimonials_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_testimonials_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_cta_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum_posts_blocks_cta_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false
  );
  
  CREATE TABLE "posts_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_cta_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"form_placeholder" varchar DEFAULT '輸入 Email',
  	"form_submit_label" varchar DEFAULT '訂閱',
  	"motion_variant" "enum_posts_blocks_cta_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_cta_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "posts_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_faq_variant" DEFAULT 'accordion-single',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"contact_hint" varchar,
  	"motion_variant" "enum_posts_blocks_faq_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_faq_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_logo_cloud_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer,
  	"href" varchar
  );
  
  CREATE TABLE "posts_blocks_logo_cloud" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_logo_cloud_variant" DEFAULT 'grid-6-color',
  	"headline" varchar,
  	"motion_variant" "enum_posts_blocks_logo_cloud_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_logo_cloud_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_content_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_content_section_variant" DEFAULT 'centered-prose',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"body" varchar,
  	"highlighted_quote" varchar,
  	"image_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_posts_blocks_content_section_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum_posts_blocks_content_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_content_section_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_pricing_table_tiers_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "posts_blocks_pricing_table_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"price_suffix" varchar DEFAULT '/月',
  	"description" varchar,
  	"highlighted" boolean DEFAULT false,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_posts_blocks_pricing_table_tiers_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false
  );
  
  CREATE TABLE "posts_blocks_pricing_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_pricing_table_variant" DEFAULT 'three-tier-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_posts_blocks_pricing_table_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_pricing_table_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_team_members_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "posts_blocks_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"bio" varchar,
  	"photo_id" integer,
  	"department" varchar
  );
  
  CREATE TABLE "posts_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_team_variant" DEFAULT 'grid-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_posts_blocks_team_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_team_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" varchar,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar
  );
  
  CREATE TABLE "posts_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_timeline_variant" DEFAULT 'vertical-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_posts_blocks_timeline_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_timeline_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"category" varchar
  );
  
  CREATE TABLE "posts_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_gallery_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_posts_blocks_gallery_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_gallery_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_newsletter_variant" DEFAULT 'centered-card',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"email_placeholder" varchar DEFAULT '輸入 Email',
  	"submit_label" varchar DEFAULT '訂閱',
  	"incentive" varchar,
  	"privacy_note" varchar DEFAULT '我們不會與第三方分享你的 Email。',
  	"motion_variant" "enum_posts_blocks_newsletter_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_newsletter_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_contact_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_posts_blocks_contact_channels_type",
  	"label" varchar,
  	"value" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "posts_blocks_contact_offices" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"city" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar
  );
  
  CREATE TABLE "posts_blocks_contact_form_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" "enum_posts_blocks_contact_form_fields_value"
  );
  
  CREATE TABLE "posts_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_contact_variant" DEFAULT 'form-with-info',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"submit_label" varchar DEFAULT '送出',
  	"motion_variant" "enum_posts_blocks_contact_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_contact_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_breadcrumb_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "posts_blocks_breadcrumb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_breadcrumb_variant" DEFAULT 'simple-chevron',
  	"current_title" varchar,
  	"motion_variant" "enum_posts_blocks_breadcrumb_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_breadcrumb_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_tabs_section_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"title" varchar,
  	"body" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "posts_blocks_tabs_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_tabs_section_variant" DEFAULT 'horizontal-underline',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum_posts_blocks_tabs_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_tabs_section_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "posts_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_steps_variant" DEFAULT 'horizontal-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum_posts_blocks_steps_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_steps_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_posts_blocks_banner_variant" DEFAULT 'announcement-bar',
  	"message" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_posts_blocks_banner_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"ends_at" varchar,
  	"dismissible" boolean DEFAULT true,
  	"tone" "enum_posts_blocks_banner_tone" DEFAULT 'primary',
  	"motion_variant" "enum_posts_blocks_banner_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum_posts_blocks_banner_motion_level",
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar,
  	"slug" varchar,
  	"content" jsonb,
  	"plain_text" varchar,
  	"featured_image_id" integer,
  	"category_id" integer,
  	"author_id" integer,
  	"reading_time" numeric DEFAULT 1,
  	"view_count" numeric DEFAULT 0,
  	"series_id" integer,
  	"series_order" numeric,
  	"comment_source" "enum_posts_comment_source",
  	"status" "enum_posts_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"scheduled_at" timestamp(3) with time zone,
  	"seo_canonical" varchar,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"seo_nofollow" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"authors_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "_posts_v_blocks_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum__posts_v_blocks_hero_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_hero_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"image_id" integer,
  	"video_url" varchar,
  	"motion_variant" "enum__posts_v_blocks_hero_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_hero_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_header_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_header_variant" DEFAULT 'logo-left-links-right',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__posts_v_blocks_header_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum__posts_v_blocks_header_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_header_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_footer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_footer_variant" DEFAULT 'multi-column',
  	"brand_name" varchar,
  	"logo_id" integer,
  	"tagline" varchar,
  	"copyright" varchar DEFAULT '',
  	"motion_variant" "enum__posts_v_blocks_footer_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_footer_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_features_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_features_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_features_grid_variant" DEFAULT 'grid-3-icon',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__posts_v_blocks_features_grid_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_features_grid_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_stats_variant" DEFAULT 'horizontal-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__posts_v_blocks_stats_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_stats_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author_name" varchar,
  	"author_title" varchar,
  	"avatar_id" integer,
  	"rating" numeric,
  	"video_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_testimonials_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__posts_v_blocks_testimonials_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_testimonials_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_cta_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"variant" "enum__posts_v_blocks_cta_ctas_variant" DEFAULT 'default',
  	"primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_cta_variant" DEFAULT 'centered',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"form_placeholder" varchar DEFAULT '輸入 Email',
  	"form_submit_label" varchar DEFAULT '訂閱',
  	"motion_variant" "enum__posts_v_blocks_cta_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_cta_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_faq_variant" DEFAULT 'accordion-single',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"contact_hint" varchar,
  	"motion_variant" "enum__posts_v_blocks_faq_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_faq_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_logo_cloud_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_logo_cloud" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_logo_cloud_variant" DEFAULT 'grid-6-color',
  	"headline" varchar,
  	"motion_variant" "enum__posts_v_blocks_logo_cloud_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_logo_cloud_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_content_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_content_section_variant" DEFAULT 'centered-prose',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"body" varchar,
  	"highlighted_quote" varchar,
  	"image_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__posts_v_blocks_content_section_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"motion_variant" "enum__posts_v_blocks_content_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_content_section_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_pricing_table_tiers_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_pricing_table_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"price_suffix" varchar DEFAULT '/月',
  	"description" varchar,
  	"highlighted" boolean DEFAULT false,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__posts_v_blocks_pricing_table_tiers_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_pricing_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_pricing_table_variant" DEFAULT 'three-tier-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__posts_v_blocks_pricing_table_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_pricing_table_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_team_members_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"bio" varchar,
  	"photo_id" integer,
  	"department" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_team_variant" DEFAULT 'grid-cards',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__posts_v_blocks_team_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_team_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" varchar,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_timeline_variant" DEFAULT 'vertical-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__posts_v_blocks_timeline_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_timeline_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"category" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_gallery_variant" DEFAULT 'grid-3',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__posts_v_blocks_gallery_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_gallery_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_newsletter_variant" DEFAULT 'centered-card',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"email_placeholder" varchar DEFAULT '輸入 Email',
  	"submit_label" varchar DEFAULT '訂閱',
  	"incentive" varchar,
  	"privacy_note" varchar DEFAULT '我們不會與第三方分享你的 Email。',
  	"motion_variant" "enum__posts_v_blocks_newsletter_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_newsletter_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_contact_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__posts_v_blocks_contact_channels_type",
  	"label" varchar,
  	"value" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_contact_offices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"city" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_contact_form_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" "enum__posts_v_blocks_contact_form_fields_value",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_contact_variant" DEFAULT 'form-with-info',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"submit_label" varchar DEFAULT '送出',
  	"motion_variant" "enum__posts_v_blocks_contact_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_contact_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_breadcrumb_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"external" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_breadcrumb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_breadcrumb_variant" DEFAULT 'simple-chevron',
  	"current_title" varchar,
  	"motion_variant" "enum__posts_v_blocks_breadcrumb_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_breadcrumb_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_tabs_section_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"title" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_tabs_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_tabs_section_variant" DEFAULT 'horizontal-underline',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"motion_variant" "enum__posts_v_blocks_tabs_section_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_tabs_section_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_steps_variant" DEFAULT 'horizontal-line',
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"motion_variant" "enum__posts_v_blocks_steps_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_steps_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__posts_v_blocks_banner_variant" DEFAULT 'announcement-bar',
  	"message" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__posts_v_blocks_banner_cta_variant" DEFAULT 'default',
  	"cta_primary" boolean DEFAULT false,
  	"ends_at" varchar,
  	"dismissible" boolean DEFAULT true,
  	"tone" "enum__posts_v_blocks_banner_tone" DEFAULT 'primary',
  	"motion_variant" "enum__posts_v_blocks_banner_motion_variant" DEFAULT 'slideUp',
  	"motion_delay" numeric DEFAULT 0,
  	"motion_level" "enum__posts_v_blocks_banner_motion_level",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_version_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" varchar,
  	"version_slug" varchar,
  	"version_content" jsonb,
  	"version_plain_text" varchar,
  	"version_featured_image_id" integer,
  	"version_category_id" integer,
  	"version_author_id" integer,
  	"version_reading_time" numeric DEFAULT 1,
  	"version_view_count" numeric DEFAULT 0,
  	"version_series_id" integer,
  	"version_series_order" numeric,
  	"version_comment_source" "enum__posts_v_version_comment_source",
  	"version_status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_scheduled_at" timestamp(3) with time zone,
  	"version_seo_canonical" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_seo_nofollow" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__posts_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_posts_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"authors_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"fields" jsonb NOT NULL,
  	"actions" jsonb,
  	"captcha_enabled" boolean DEFAULT false,
  	"success_message" varchar,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "form_submissions_spam_reasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reason" varchar
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"form_id" varchar NOT NULL,
  	"values" jsonb NOT NULL,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"action_results" jsonb,
  	"is_spam" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faq_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faq_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"category_id" integer,
  	"question" varchar NOT NULL,
  	"answer" jsonb NOT NULL,
  	"answer_plain" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"click_count" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "comments_spam_reasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reason" varchar
  );
  
  CREATE TABLE "comments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"post_id" varchar NOT NULL,
  	"parent_id" varchar,
  	"author_name" varchar NOT NULL,
  	"author_email" varchar NOT NULL,
  	"author_website" varchar,
  	"content" varchar NOT NULL,
  	"status" "enum_comments_status" DEFAULT 'pending' NOT NULL,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cta_blocks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"placement" "enum_cta_blocks_placement" NOT NULL,
  	"heading" varchar NOT NULL,
  	"body" varchar,
  	"button_label" varchar NOT NULL,
  	"button_url" varchar NOT NULL,
  	"weight" numeric DEFAULT 1,
  	"enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cta_blocks_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "lead_magnets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"file_url" varchar NOT NULL,
  	"file_name" varchar NOT NULL,
  	"thumbnail_url" varchar,
  	"enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "lead_captures" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"name" varchar,
  	"magnet_id" varchar NOT NULL,
  	"source_post_id" varchar,
  	"ip_address" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "newsletter_subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"name" varchar,
  	"source" varchar,
  	"confirmed" boolean DEFAULT false,
  	"unsubscribed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "marketing_click_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"source" "enum_marketing_click_events_source" NOT NULL,
  	"entity_id" varchar NOT NULL,
  	"channel" varchar,
  	"post_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "broken_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"referrer" varchar,
  	"hit_count" numeric DEFAULT 1,
  	"resolved" boolean DEFAULT false,
  	"first_seen_at" timestamp(3) with time zone,
  	"last_seen_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "user_credentials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"credential_id" varchar NOT NULL,
  	"public_key" varchar NOT NULL,
  	"counter" numeric DEFAULT 0 NOT NULL,
  	"transports" jsonb,
  	"nickname" varchar,
  	"last_used_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "workflow_executions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workflow_id" varchar NOT NULL,
  	"project_id" varchar NOT NULL,
  	"workflow_version" varchar,
  	"status" "enum_workflow_executions_status" DEFAULT 'queued' NOT NULL,
  	"trigger_kind" "enum_workflow_executions_trigger_kind",
  	"context" jsonb,
  	"node_states" jsonb,
  	"current_node_id" varchar,
  	"error" jsonb,
  	"started_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone,
  	"duration_ms" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "workflow_registry" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workflow_id" varchar NOT NULL,
  	"project_id" varchar NOT NULL,
  	"version" varchar NOT NULL,
  	"active_version" boolean DEFAULT false,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"status" "enum_workflow_registry_status" NOT NULL,
  	"nodes" jsonb NOT NULL,
  	"edges" jsonb NOT NULL,
  	"pushed_at" timestamp(3) with time zone NOT NULL,
  	"customized_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"tags_id" integer,
  	"authors_id" integer,
  	"post_series_id" integer,
  	"products_id" integer,
  	"courses_id" integer,
  	"course_chapters_id" integer,
  	"pages_id" integer,
  	"shop_pages_id" integer,
  	"course_pages_id" integer,
  	"posts_id" integer,
  	"forms_id" integer,
  	"form_submissions_id" integer,
  	"faq_categories_id" integer,
  	"faq_items_id" integer,
  	"comments_id" integer,
  	"cta_blocks_id" integer,
  	"lead_magnets_id" integer,
  	"lead_captures_id" integer,
  	"newsletter_subscribers_id" integer,
  	"marketing_click_events_id" integer,
  	"broken_links_id" integer,
  	"user_credentials_id" integer,
  	"workflow_executions_id" integer,
  	"workflow_registry_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors_social" ADD CONSTRAINT "authors_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "post_series" ADD CONSTRAINT "post_series_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_ctas" ADD CONSTRAINT "pages_blocks_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_header_links" ADD CONSTRAINT "pages_blocks_header_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_header" ADD CONSTRAINT "pages_blocks_header_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_header" ADD CONSTRAINT "pages_blocks_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_footer_columns_links" ADD CONSTRAINT "pages_blocks_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_footer_columns" ADD CONSTRAINT "pages_blocks_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_footer_social_links" ADD CONSTRAINT "pages_blocks_footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_footer" ADD CONSTRAINT "pages_blocks_footer_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_footer" ADD CONSTRAINT "pages_blocks_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_features_grid_items" ADD CONSTRAINT "pages_blocks_features_grid_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_features_grid_items" ADD CONSTRAINT "pages_blocks_features_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_features_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_features_grid" ADD CONSTRAINT "pages_blocks_features_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_items" ADD CONSTRAINT "pages_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats" ADD CONSTRAINT "pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_ctas" ADD CONSTRAINT "pages_blocks_cta_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_cloud_items" ADD CONSTRAINT "pages_blocks_logo_cloud_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_cloud_items" ADD CONSTRAINT "pages_blocks_logo_cloud_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_logo_cloud"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_cloud" ADD CONSTRAINT "pages_blocks_logo_cloud_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_section" ADD CONSTRAINT "pages_blocks_content_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_section" ADD CONSTRAINT "pages_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_table_tiers_features" ADD CONSTRAINT "pages_blocks_pricing_table_tiers_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_table_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_table_tiers" ADD CONSTRAINT "pages_blocks_pricing_table_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_table" ADD CONSTRAINT "pages_blocks_pricing_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_members_social_links" ADD CONSTRAINT "pages_blocks_team_members_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_members" ADD CONSTRAINT "pages_blocks_team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_members" ADD CONSTRAINT "pages_blocks_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team" ADD CONSTRAINT "pages_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_items" ADD CONSTRAINT "pages_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline" ADD CONSTRAINT "pages_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_newsletter" ADD CONSTRAINT "pages_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_channels" ADD CONSTRAINT "pages_blocks_contact_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_offices" ADD CONSTRAINT "pages_blocks_contact_offices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_form_fields" ADD CONSTRAINT "pages_blocks_contact_form_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact" ADD CONSTRAINT "pages_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_breadcrumb_items" ADD CONSTRAINT "pages_blocks_breadcrumb_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_breadcrumb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_breadcrumb" ADD CONSTRAINT "pages_blocks_breadcrumb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_section_panels" ADD CONSTRAINT "pages_blocks_tabs_section_panels_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_section_panels" ADD CONSTRAINT "pages_blocks_tabs_section_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tabs_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_section" ADD CONSTRAINT "pages_blocks_tabs_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_items" ADD CONSTRAINT "pages_blocks_steps_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_items" ADD CONSTRAINT "pages_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps" ADD CONSTRAINT "pages_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_banner" ADD CONSTRAINT "pages_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_seo_keywords" ADD CONSTRAINT "pages_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_ctas" ADD CONSTRAINT "_pages_v_blocks_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_header_links" ADD CONSTRAINT "_pages_v_blocks_header_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_header" ADD CONSTRAINT "_pages_v_blocks_header_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_header" ADD CONSTRAINT "_pages_v_blocks_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_footer_columns_links" ADD CONSTRAINT "_pages_v_blocks_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_footer_columns" ADD CONSTRAINT "_pages_v_blocks_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_footer_social_links" ADD CONSTRAINT "_pages_v_blocks_footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_footer" ADD CONSTRAINT "_pages_v_blocks_footer_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_footer" ADD CONSTRAINT "_pages_v_blocks_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_features_grid_items" ADD CONSTRAINT "_pages_v_blocks_features_grid_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_features_grid_items" ADD CONSTRAINT "_pages_v_blocks_features_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_features_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_features_grid" ADD CONSTRAINT "_pages_v_blocks_features_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_items" ADD CONSTRAINT "_pages_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats" ADD CONSTRAINT "_pages_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_ctas" ADD CONSTRAINT "_pages_v_blocks_cta_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_cloud_items" ADD CONSTRAINT "_pages_v_blocks_logo_cloud_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_cloud_items" ADD CONSTRAINT "_pages_v_blocks_logo_cloud_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_logo_cloud"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_cloud" ADD CONSTRAINT "_pages_v_blocks_logo_cloud_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_section" ADD CONSTRAINT "_pages_v_blocks_content_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_section" ADD CONSTRAINT "_pages_v_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_table_tiers_features" ADD CONSTRAINT "_pages_v_blocks_pricing_table_tiers_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_table_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_table_tiers" ADD CONSTRAINT "_pages_v_blocks_pricing_table_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_table" ADD CONSTRAINT "_pages_v_blocks_pricing_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_members_social_links" ADD CONSTRAINT "_pages_v_blocks_team_members_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_members" ADD CONSTRAINT "_pages_v_blocks_team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_members" ADD CONSTRAINT "_pages_v_blocks_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team" ADD CONSTRAINT "_pages_v_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_items" ADD CONSTRAINT "_pages_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline" ADD CONSTRAINT "_pages_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter" ADD CONSTRAINT "_pages_v_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_channels" ADD CONSTRAINT "_pages_v_blocks_contact_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_offices" ADD CONSTRAINT "_pages_v_blocks_contact_offices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_form_fields" ADD CONSTRAINT "_pages_v_blocks_contact_form_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact" ADD CONSTRAINT "_pages_v_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_breadcrumb_items" ADD CONSTRAINT "_pages_v_blocks_breadcrumb_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_breadcrumb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_breadcrumb" ADD CONSTRAINT "_pages_v_blocks_breadcrumb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_section_panels" ADD CONSTRAINT "_pages_v_blocks_tabs_section_panels_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_section_panels" ADD CONSTRAINT "_pages_v_blocks_tabs_section_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_tabs_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_section" ADD CONSTRAINT "_pages_v_blocks_tabs_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_items" ADD CONSTRAINT "_pages_v_blocks_steps_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_items" ADD CONSTRAINT "_pages_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps" ADD CONSTRAINT "_pages_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_banner" ADD CONSTRAINT "_pages_v_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_seo_keywords" ADD CONSTRAINT "_pages_v_version_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_id_pages_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_hero_ctas" ADD CONSTRAINT "shop_pages_blocks_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_hero" ADD CONSTRAINT "shop_pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_hero" ADD CONSTRAINT "shop_pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_header_links" ADD CONSTRAINT "shop_pages_blocks_header_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_header" ADD CONSTRAINT "shop_pages_blocks_header_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_header" ADD CONSTRAINT "shop_pages_blocks_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_footer_columns_links" ADD CONSTRAINT "shop_pages_blocks_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_footer_columns" ADD CONSTRAINT "shop_pages_blocks_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_footer_social_links" ADD CONSTRAINT "shop_pages_blocks_footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_footer" ADD CONSTRAINT "shop_pages_blocks_footer_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_footer" ADD CONSTRAINT "shop_pages_blocks_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_features_grid_items" ADD CONSTRAINT "shop_pages_blocks_features_grid_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_features_grid_items" ADD CONSTRAINT "shop_pages_blocks_features_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_features_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_features_grid" ADD CONSTRAINT "shop_pages_blocks_features_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_stats_items" ADD CONSTRAINT "shop_pages_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_stats" ADD CONSTRAINT "shop_pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_testimonials_items" ADD CONSTRAINT "shop_pages_blocks_testimonials_items_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_testimonials_items" ADD CONSTRAINT "shop_pages_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_testimonials" ADD CONSTRAINT "shop_pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_cta_ctas" ADD CONSTRAINT "shop_pages_blocks_cta_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_cta" ADD CONSTRAINT "shop_pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_faq_items" ADD CONSTRAINT "shop_pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_faq" ADD CONSTRAINT "shop_pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_logo_cloud_items" ADD CONSTRAINT "shop_pages_blocks_logo_cloud_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_logo_cloud_items" ADD CONSTRAINT "shop_pages_blocks_logo_cloud_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_logo_cloud"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_logo_cloud" ADD CONSTRAINT "shop_pages_blocks_logo_cloud_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_content_section" ADD CONSTRAINT "shop_pages_blocks_content_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_content_section" ADD CONSTRAINT "shop_pages_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_pricing_table_tiers_features" ADD CONSTRAINT "shop_pages_blocks_pricing_table_tiers_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_pricing_table_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_pricing_table_tiers" ADD CONSTRAINT "shop_pages_blocks_pricing_table_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_pricing_table" ADD CONSTRAINT "shop_pages_blocks_pricing_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_team_members_social_links" ADD CONSTRAINT "shop_pages_blocks_team_members_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_team_members" ADD CONSTRAINT "shop_pages_blocks_team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_team_members" ADD CONSTRAINT "shop_pages_blocks_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_team" ADD CONSTRAINT "shop_pages_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_timeline_items" ADD CONSTRAINT "shop_pages_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_timeline" ADD CONSTRAINT "shop_pages_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_gallery_items" ADD CONSTRAINT "shop_pages_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_gallery_items" ADD CONSTRAINT "shop_pages_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_gallery" ADD CONSTRAINT "shop_pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_newsletter" ADD CONSTRAINT "shop_pages_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_contact_channels" ADD CONSTRAINT "shop_pages_blocks_contact_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_contact_offices" ADD CONSTRAINT "shop_pages_blocks_contact_offices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_contact_form_fields" ADD CONSTRAINT "shop_pages_blocks_contact_form_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_contact" ADD CONSTRAINT "shop_pages_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_breadcrumb_items" ADD CONSTRAINT "shop_pages_blocks_breadcrumb_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_breadcrumb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_breadcrumb" ADD CONSTRAINT "shop_pages_blocks_breadcrumb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_tabs_section_panels" ADD CONSTRAINT "shop_pages_blocks_tabs_section_panels_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_tabs_section_panels" ADD CONSTRAINT "shop_pages_blocks_tabs_section_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_tabs_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_tabs_section" ADD CONSTRAINT "shop_pages_blocks_tabs_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_steps_items" ADD CONSTRAINT "shop_pages_blocks_steps_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_steps_items" ADD CONSTRAINT "shop_pages_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_steps" ADD CONSTRAINT "shop_pages_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_blocks_banner" ADD CONSTRAINT "shop_pages_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages_seo_keywords" ADD CONSTRAINT "shop_pages_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_pages" ADD CONSTRAINT "shop_pages_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_pages" ADD CONSTRAINT "shop_pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_pages_locales" ADD CONSTRAINT "shop_pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_hero_ctas" ADD CONSTRAINT "_shop_pages_v_blocks_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_hero" ADD CONSTRAINT "_shop_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_hero" ADD CONSTRAINT "_shop_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_header_links" ADD CONSTRAINT "_shop_pages_v_blocks_header_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_header" ADD CONSTRAINT "_shop_pages_v_blocks_header_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_header" ADD CONSTRAINT "_shop_pages_v_blocks_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_footer_columns_links" ADD CONSTRAINT "_shop_pages_v_blocks_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_footer_columns" ADD CONSTRAINT "_shop_pages_v_blocks_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_footer_social_links" ADD CONSTRAINT "_shop_pages_v_blocks_footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_footer" ADD CONSTRAINT "_shop_pages_v_blocks_footer_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_footer" ADD CONSTRAINT "_shop_pages_v_blocks_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_features_grid_items" ADD CONSTRAINT "_shop_pages_v_blocks_features_grid_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_features_grid_items" ADD CONSTRAINT "_shop_pages_v_blocks_features_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_features_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_features_grid" ADD CONSTRAINT "_shop_pages_v_blocks_features_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_stats_items" ADD CONSTRAINT "_shop_pages_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_stats" ADD CONSTRAINT "_shop_pages_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_shop_pages_v_blocks_testimonials_items_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_shop_pages_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_testimonials" ADD CONSTRAINT "_shop_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_cta_ctas" ADD CONSTRAINT "_shop_pages_v_blocks_cta_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_cta" ADD CONSTRAINT "_shop_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_faq_items" ADD CONSTRAINT "_shop_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_faq" ADD CONSTRAINT "_shop_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_logo_cloud_items" ADD CONSTRAINT "_shop_pages_v_blocks_logo_cloud_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_logo_cloud_items" ADD CONSTRAINT "_shop_pages_v_blocks_logo_cloud_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_logo_cloud"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_logo_cloud" ADD CONSTRAINT "_shop_pages_v_blocks_logo_cloud_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_content_section" ADD CONSTRAINT "_shop_pages_v_blocks_content_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_content_section" ADD CONSTRAINT "_shop_pages_v_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_pricing_table_tiers_features" ADD CONSTRAINT "_shop_pages_v_blocks_pricing_table_tiers_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_pricing_table_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_pricing_table_tiers" ADD CONSTRAINT "_shop_pages_v_blocks_pricing_table_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_pricing_table" ADD CONSTRAINT "_shop_pages_v_blocks_pricing_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_team_members_social_links" ADD CONSTRAINT "_shop_pages_v_blocks_team_members_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_team_members" ADD CONSTRAINT "_shop_pages_v_blocks_team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_team_members" ADD CONSTRAINT "_shop_pages_v_blocks_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_team" ADD CONSTRAINT "_shop_pages_v_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_timeline_items" ADD CONSTRAINT "_shop_pages_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_timeline" ADD CONSTRAINT "_shop_pages_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_gallery_items" ADD CONSTRAINT "_shop_pages_v_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_gallery_items" ADD CONSTRAINT "_shop_pages_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_gallery" ADD CONSTRAINT "_shop_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_newsletter" ADD CONSTRAINT "_shop_pages_v_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_contact_channels" ADD CONSTRAINT "_shop_pages_v_blocks_contact_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_contact_offices" ADD CONSTRAINT "_shop_pages_v_blocks_contact_offices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_contact_form_fields" ADD CONSTRAINT "_shop_pages_v_blocks_contact_form_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_contact" ADD CONSTRAINT "_shop_pages_v_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_breadcrumb_items" ADD CONSTRAINT "_shop_pages_v_blocks_breadcrumb_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_breadcrumb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_breadcrumb" ADD CONSTRAINT "_shop_pages_v_blocks_breadcrumb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_tabs_section_panels" ADD CONSTRAINT "_shop_pages_v_blocks_tabs_section_panels_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_tabs_section_panels" ADD CONSTRAINT "_shop_pages_v_blocks_tabs_section_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_tabs_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_tabs_section" ADD CONSTRAINT "_shop_pages_v_blocks_tabs_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_steps_items" ADD CONSTRAINT "_shop_pages_v_blocks_steps_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_steps_items" ADD CONSTRAINT "_shop_pages_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_steps" ADD CONSTRAINT "_shop_pages_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_blocks_banner" ADD CONSTRAINT "_shop_pages_v_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_version_seo_keywords" ADD CONSTRAINT "_shop_pages_v_version_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shop_pages_v" ADD CONSTRAINT "_shop_pages_v_parent_id_shop_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."shop_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shop_pages_v" ADD CONSTRAINT "_shop_pages_v_version_product_id_products_id_fk" FOREIGN KEY ("version_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shop_pages_v" ADD CONSTRAINT "_shop_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shop_pages_v_locales" ADD CONSTRAINT "_shop_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shop_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_hero_ctas" ADD CONSTRAINT "course_pages_blocks_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_hero" ADD CONSTRAINT "course_pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_hero" ADD CONSTRAINT "course_pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_header_links" ADD CONSTRAINT "course_pages_blocks_header_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_header" ADD CONSTRAINT "course_pages_blocks_header_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_header" ADD CONSTRAINT "course_pages_blocks_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_footer_columns_links" ADD CONSTRAINT "course_pages_blocks_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_footer_columns" ADD CONSTRAINT "course_pages_blocks_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_footer_social_links" ADD CONSTRAINT "course_pages_blocks_footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_footer" ADD CONSTRAINT "course_pages_blocks_footer_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_footer" ADD CONSTRAINT "course_pages_blocks_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_features_grid_items" ADD CONSTRAINT "course_pages_blocks_features_grid_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_features_grid_items" ADD CONSTRAINT "course_pages_blocks_features_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_features_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_features_grid" ADD CONSTRAINT "course_pages_blocks_features_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_stats_items" ADD CONSTRAINT "course_pages_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_stats" ADD CONSTRAINT "course_pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_testimonials_items" ADD CONSTRAINT "course_pages_blocks_testimonials_items_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_testimonials_items" ADD CONSTRAINT "course_pages_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_testimonials" ADD CONSTRAINT "course_pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_cta_ctas" ADD CONSTRAINT "course_pages_blocks_cta_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_cta" ADD CONSTRAINT "course_pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_faq_items" ADD CONSTRAINT "course_pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_faq" ADD CONSTRAINT "course_pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_logo_cloud_items" ADD CONSTRAINT "course_pages_blocks_logo_cloud_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_logo_cloud_items" ADD CONSTRAINT "course_pages_blocks_logo_cloud_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_logo_cloud"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_logo_cloud" ADD CONSTRAINT "course_pages_blocks_logo_cloud_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_content_section" ADD CONSTRAINT "course_pages_blocks_content_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_content_section" ADD CONSTRAINT "course_pages_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_pricing_table_tiers_features" ADD CONSTRAINT "course_pages_blocks_pricing_table_tiers_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_pricing_table_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_pricing_table_tiers" ADD CONSTRAINT "course_pages_blocks_pricing_table_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_pricing_table" ADD CONSTRAINT "course_pages_blocks_pricing_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_team_members_social_links" ADD CONSTRAINT "course_pages_blocks_team_members_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_team_members" ADD CONSTRAINT "course_pages_blocks_team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_team_members" ADD CONSTRAINT "course_pages_blocks_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_team" ADD CONSTRAINT "course_pages_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_timeline_items" ADD CONSTRAINT "course_pages_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_timeline" ADD CONSTRAINT "course_pages_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_gallery_items" ADD CONSTRAINT "course_pages_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_gallery_items" ADD CONSTRAINT "course_pages_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_gallery" ADD CONSTRAINT "course_pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_newsletter" ADD CONSTRAINT "course_pages_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_contact_channels" ADD CONSTRAINT "course_pages_blocks_contact_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_contact_offices" ADD CONSTRAINT "course_pages_blocks_contact_offices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_contact_form_fields" ADD CONSTRAINT "course_pages_blocks_contact_form_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_contact" ADD CONSTRAINT "course_pages_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_breadcrumb_items" ADD CONSTRAINT "course_pages_blocks_breadcrumb_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_breadcrumb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_breadcrumb" ADD CONSTRAINT "course_pages_blocks_breadcrumb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_tabs_section_panels" ADD CONSTRAINT "course_pages_blocks_tabs_section_panels_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_tabs_section_panels" ADD CONSTRAINT "course_pages_blocks_tabs_section_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_tabs_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_tabs_section" ADD CONSTRAINT "course_pages_blocks_tabs_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_steps_items" ADD CONSTRAINT "course_pages_blocks_steps_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_steps_items" ADD CONSTRAINT "course_pages_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_steps" ADD CONSTRAINT "course_pages_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_blocks_banner" ADD CONSTRAINT "course_pages_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages_seo_keywords" ADD CONSTRAINT "course_pages_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_pages" ADD CONSTRAINT "course_pages_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_pages" ADD CONSTRAINT "course_pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_pages_locales" ADD CONSTRAINT "course_pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_hero_ctas" ADD CONSTRAINT "_course_pages_v_blocks_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_hero" ADD CONSTRAINT "_course_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_hero" ADD CONSTRAINT "_course_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_header_links" ADD CONSTRAINT "_course_pages_v_blocks_header_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_header" ADD CONSTRAINT "_course_pages_v_blocks_header_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_header" ADD CONSTRAINT "_course_pages_v_blocks_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_footer_columns_links" ADD CONSTRAINT "_course_pages_v_blocks_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_footer_columns" ADD CONSTRAINT "_course_pages_v_blocks_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_footer_social_links" ADD CONSTRAINT "_course_pages_v_blocks_footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_footer" ADD CONSTRAINT "_course_pages_v_blocks_footer_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_footer" ADD CONSTRAINT "_course_pages_v_blocks_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_features_grid_items" ADD CONSTRAINT "_course_pages_v_blocks_features_grid_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_features_grid_items" ADD CONSTRAINT "_course_pages_v_blocks_features_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_features_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_features_grid" ADD CONSTRAINT "_course_pages_v_blocks_features_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_stats_items" ADD CONSTRAINT "_course_pages_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_stats" ADD CONSTRAINT "_course_pages_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_course_pages_v_blocks_testimonials_items_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_course_pages_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_testimonials" ADD CONSTRAINT "_course_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_cta_ctas" ADD CONSTRAINT "_course_pages_v_blocks_cta_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_cta" ADD CONSTRAINT "_course_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_faq_items" ADD CONSTRAINT "_course_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_faq" ADD CONSTRAINT "_course_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_logo_cloud_items" ADD CONSTRAINT "_course_pages_v_blocks_logo_cloud_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_logo_cloud_items" ADD CONSTRAINT "_course_pages_v_blocks_logo_cloud_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_logo_cloud"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_logo_cloud" ADD CONSTRAINT "_course_pages_v_blocks_logo_cloud_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_content_section" ADD CONSTRAINT "_course_pages_v_blocks_content_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_content_section" ADD CONSTRAINT "_course_pages_v_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_pricing_table_tiers_features" ADD CONSTRAINT "_course_pages_v_blocks_pricing_table_tiers_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_pricing_table_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_pricing_table_tiers" ADD CONSTRAINT "_course_pages_v_blocks_pricing_table_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_pricing_table" ADD CONSTRAINT "_course_pages_v_blocks_pricing_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_team_members_social_links" ADD CONSTRAINT "_course_pages_v_blocks_team_members_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_team_members" ADD CONSTRAINT "_course_pages_v_blocks_team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_team_members" ADD CONSTRAINT "_course_pages_v_blocks_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_team" ADD CONSTRAINT "_course_pages_v_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_timeline_items" ADD CONSTRAINT "_course_pages_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_timeline" ADD CONSTRAINT "_course_pages_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_gallery_items" ADD CONSTRAINT "_course_pages_v_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_gallery_items" ADD CONSTRAINT "_course_pages_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_gallery" ADD CONSTRAINT "_course_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_newsletter" ADD CONSTRAINT "_course_pages_v_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_contact_channels" ADD CONSTRAINT "_course_pages_v_blocks_contact_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_contact_offices" ADD CONSTRAINT "_course_pages_v_blocks_contact_offices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_contact_form_fields" ADD CONSTRAINT "_course_pages_v_blocks_contact_form_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_contact" ADD CONSTRAINT "_course_pages_v_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_breadcrumb_items" ADD CONSTRAINT "_course_pages_v_blocks_breadcrumb_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_breadcrumb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_breadcrumb" ADD CONSTRAINT "_course_pages_v_blocks_breadcrumb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_tabs_section_panels" ADD CONSTRAINT "_course_pages_v_blocks_tabs_section_panels_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_tabs_section_panels" ADD CONSTRAINT "_course_pages_v_blocks_tabs_section_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_tabs_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_tabs_section" ADD CONSTRAINT "_course_pages_v_blocks_tabs_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_steps_items" ADD CONSTRAINT "_course_pages_v_blocks_steps_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_steps_items" ADD CONSTRAINT "_course_pages_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_steps" ADD CONSTRAINT "_course_pages_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_blocks_banner" ADD CONSTRAINT "_course_pages_v_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v_version_seo_keywords" ADD CONSTRAINT "_course_pages_v_version_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_pages_v" ADD CONSTRAINT "_course_pages_v_parent_id_course_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."course_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_course_pages_v" ADD CONSTRAINT "_course_pages_v_version_course_id_courses_id_fk" FOREIGN KEY ("version_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_course_pages_v" ADD CONSTRAINT "_course_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_course_pages_v_locales" ADD CONSTRAINT "_course_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_hero_ctas" ADD CONSTRAINT "posts_blocks_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_hero" ADD CONSTRAINT "posts_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_hero" ADD CONSTRAINT "posts_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_header_links" ADD CONSTRAINT "posts_blocks_header_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_header" ADD CONSTRAINT "posts_blocks_header_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_header" ADD CONSTRAINT "posts_blocks_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_footer_columns_links" ADD CONSTRAINT "posts_blocks_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_footer_columns" ADD CONSTRAINT "posts_blocks_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_footer_social_links" ADD CONSTRAINT "posts_blocks_footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_footer" ADD CONSTRAINT "posts_blocks_footer_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_footer" ADD CONSTRAINT "posts_blocks_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_features_grid_items" ADD CONSTRAINT "posts_blocks_features_grid_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_features_grid_items" ADD CONSTRAINT "posts_blocks_features_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_features_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_features_grid" ADD CONSTRAINT "posts_blocks_features_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_stats_items" ADD CONSTRAINT "posts_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_stats" ADD CONSTRAINT "posts_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_testimonials_items" ADD CONSTRAINT "posts_blocks_testimonials_items_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_testimonials_items" ADD CONSTRAINT "posts_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_testimonials" ADD CONSTRAINT "posts_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_cta_ctas" ADD CONSTRAINT "posts_blocks_cta_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_cta" ADD CONSTRAINT "posts_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_faq_items" ADD CONSTRAINT "posts_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_faq" ADD CONSTRAINT "posts_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_logo_cloud_items" ADD CONSTRAINT "posts_blocks_logo_cloud_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_logo_cloud_items" ADD CONSTRAINT "posts_blocks_logo_cloud_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_logo_cloud"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_logo_cloud" ADD CONSTRAINT "posts_blocks_logo_cloud_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_section" ADD CONSTRAINT "posts_blocks_content_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_section" ADD CONSTRAINT "posts_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_pricing_table_tiers_features" ADD CONSTRAINT "posts_blocks_pricing_table_tiers_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_pricing_table_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_pricing_table_tiers" ADD CONSTRAINT "posts_blocks_pricing_table_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_pricing_table" ADD CONSTRAINT "posts_blocks_pricing_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_team_members_social_links" ADD CONSTRAINT "posts_blocks_team_members_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_team_members" ADD CONSTRAINT "posts_blocks_team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_team_members" ADD CONSTRAINT "posts_blocks_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_team" ADD CONSTRAINT "posts_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_timeline_items" ADD CONSTRAINT "posts_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_timeline" ADD CONSTRAINT "posts_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_gallery_items" ADD CONSTRAINT "posts_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_gallery_items" ADD CONSTRAINT "posts_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_gallery" ADD CONSTRAINT "posts_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_newsletter" ADD CONSTRAINT "posts_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_contact_channels" ADD CONSTRAINT "posts_blocks_contact_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_contact_offices" ADD CONSTRAINT "posts_blocks_contact_offices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_contact_form_fields" ADD CONSTRAINT "posts_blocks_contact_form_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_contact" ADD CONSTRAINT "posts_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_breadcrumb_items" ADD CONSTRAINT "posts_blocks_breadcrumb_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_breadcrumb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_breadcrumb" ADD CONSTRAINT "posts_blocks_breadcrumb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_section_panels" ADD CONSTRAINT "posts_blocks_tabs_section_panels_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_section_panels" ADD CONSTRAINT "posts_blocks_tabs_section_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_tabs_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_tabs_section" ADD CONSTRAINT "posts_blocks_tabs_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_steps_items" ADD CONSTRAINT "posts_blocks_steps_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_steps_items" ADD CONSTRAINT "posts_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_steps" ADD CONSTRAINT "posts_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_banner" ADD CONSTRAINT "posts_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_seo_keywords" ADD CONSTRAINT "posts_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_series_id_post_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."post_series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_hero_ctas" ADD CONSTRAINT "_posts_v_blocks_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_hero" ADD CONSTRAINT "_posts_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_hero" ADD CONSTRAINT "_posts_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_header_links" ADD CONSTRAINT "_posts_v_blocks_header_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_header" ADD CONSTRAINT "_posts_v_blocks_header_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_header" ADD CONSTRAINT "_posts_v_blocks_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_footer_columns_links" ADD CONSTRAINT "_posts_v_blocks_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_footer_columns" ADD CONSTRAINT "_posts_v_blocks_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_footer_social_links" ADD CONSTRAINT "_posts_v_blocks_footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_footer" ADD CONSTRAINT "_posts_v_blocks_footer_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_footer" ADD CONSTRAINT "_posts_v_blocks_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_features_grid_items" ADD CONSTRAINT "_posts_v_blocks_features_grid_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_features_grid_items" ADD CONSTRAINT "_posts_v_blocks_features_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_features_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_features_grid" ADD CONSTRAINT "_posts_v_blocks_features_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_stats_items" ADD CONSTRAINT "_posts_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_stats" ADD CONSTRAINT "_posts_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_testimonials_items" ADD CONSTRAINT "_posts_v_blocks_testimonials_items_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_testimonials_items" ADD CONSTRAINT "_posts_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_testimonials" ADD CONSTRAINT "_posts_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_cta_ctas" ADD CONSTRAINT "_posts_v_blocks_cta_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_cta" ADD CONSTRAINT "_posts_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_faq_items" ADD CONSTRAINT "_posts_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_faq" ADD CONSTRAINT "_posts_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_logo_cloud_items" ADD CONSTRAINT "_posts_v_blocks_logo_cloud_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_logo_cloud_items" ADD CONSTRAINT "_posts_v_blocks_logo_cloud_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_logo_cloud"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_logo_cloud" ADD CONSTRAINT "_posts_v_blocks_logo_cloud_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_section" ADD CONSTRAINT "_posts_v_blocks_content_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_section" ADD CONSTRAINT "_posts_v_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_pricing_table_tiers_features" ADD CONSTRAINT "_posts_v_blocks_pricing_table_tiers_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_pricing_table_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_pricing_table_tiers" ADD CONSTRAINT "_posts_v_blocks_pricing_table_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_pricing_table" ADD CONSTRAINT "_posts_v_blocks_pricing_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_team_members_social_links" ADD CONSTRAINT "_posts_v_blocks_team_members_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_team_members" ADD CONSTRAINT "_posts_v_blocks_team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_team_members" ADD CONSTRAINT "_posts_v_blocks_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_team" ADD CONSTRAINT "_posts_v_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_timeline_items" ADD CONSTRAINT "_posts_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_timeline" ADD CONSTRAINT "_posts_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_gallery_items" ADD CONSTRAINT "_posts_v_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_gallery_items" ADD CONSTRAINT "_posts_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_gallery" ADD CONSTRAINT "_posts_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_newsletter" ADD CONSTRAINT "_posts_v_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_contact_channels" ADD CONSTRAINT "_posts_v_blocks_contact_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_contact_offices" ADD CONSTRAINT "_posts_v_blocks_contact_offices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_contact_form_fields" ADD CONSTRAINT "_posts_v_blocks_contact_form_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_contact" ADD CONSTRAINT "_posts_v_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_breadcrumb_items" ADD CONSTRAINT "_posts_v_blocks_breadcrumb_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_breadcrumb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_breadcrumb" ADD CONSTRAINT "_posts_v_blocks_breadcrumb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_section_panels" ADD CONSTRAINT "_posts_v_blocks_tabs_section_panels_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_section_panels" ADD CONSTRAINT "_posts_v_blocks_tabs_section_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_tabs_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_tabs_section" ADD CONSTRAINT "_posts_v_blocks_tabs_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_steps_items" ADD CONSTRAINT "_posts_v_blocks_steps_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_steps_items" ADD CONSTRAINT "_posts_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_steps" ADD CONSTRAINT "_posts_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_banner" ADD CONSTRAINT "_posts_v_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_seo_keywords" ADD CONSTRAINT "_posts_v_version_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_series_id_post_series_id_fk" FOREIGN KEY ("version_series_id") REFERENCES "public"."post_series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_spam_reasons" ADD CONSTRAINT "form_submissions_spam_reasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_items" ADD CONSTRAINT "faq_items_category_id_faq_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."faq_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments_spam_reasons" ADD CONSTRAINT "comments_spam_reasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cta_blocks_rels" ADD CONSTRAINT "cta_blocks_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cta_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cta_blocks_rels" ADD CONSTRAINT "cta_blocks_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cta_blocks_rels" ADD CONSTRAINT "cta_blocks_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "user_credentials" ADD CONSTRAINT "user_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_post_series_fk" FOREIGN KEY ("post_series_id") REFERENCES "public"."post_series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_chapters_fk" FOREIGN KEY ("course_chapters_id") REFERENCES "public"."course_chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_shop_pages_fk" FOREIGN KEY ("shop_pages_id") REFERENCES "public"."shop_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_pages_fk" FOREIGN KEY ("course_pages_id") REFERENCES "public"."course_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faq_categories_fk" FOREIGN KEY ("faq_categories_id") REFERENCES "public"."faq_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faq_items_fk" FOREIGN KEY ("faq_items_id") REFERENCES "public"."faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_comments_fk" FOREIGN KEY ("comments_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cta_blocks_fk" FOREIGN KEY ("cta_blocks_id") REFERENCES "public"."cta_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lead_magnets_fk" FOREIGN KEY ("lead_magnets_id") REFERENCES "public"."lead_magnets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lead_captures_fk" FOREIGN KEY ("lead_captures_id") REFERENCES "public"."lead_captures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk" FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_marketing_click_events_fk" FOREIGN KEY ("marketing_click_events_id") REFERENCES "public"."marketing_click_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_broken_links_fk" FOREIGN KEY ("broken_links_id") REFERENCES "public"."broken_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_credentials_fk" FOREIGN KEY ("user_credentials_id") REFERENCES "public"."user_credentials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workflow_executions_fk" FOREIGN KEY ("workflow_executions_id") REFERENCES "public"."workflow_executions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workflow_registry_fk" FOREIGN KEY ("workflow_registry_id") REFERENCES "public"."workflow_registry"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "categories_tenant_id_idx" ON "categories" USING btree ("tenant_id");
  CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_cover_idx" ON "categories" USING btree ("cover_id");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "tags_tenant_id_idx" ON "tags" USING btree ("tenant_id");
  CREATE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "authors_social_order_idx" ON "authors_social" USING btree ("_order");
  CREATE INDEX "authors_social_parent_id_idx" ON "authors_social" USING btree ("_parent_id");
  CREATE INDEX "authors_tenant_id_idx" ON "authors" USING btree ("tenant_id");
  CREATE INDEX "authors_avatar_idx" ON "authors" USING btree ("avatar_id");
  CREATE INDEX "authors_user_idx" ON "authors" USING btree ("user_id");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE INDEX "post_series_tenant_id_idx" ON "post_series" USING btree ("tenant_id");
  CREATE INDEX "post_series_slug_idx" ON "post_series" USING btree ("slug");
  CREATE INDEX "post_series_cover_idx" ON "post_series" USING btree ("cover_id");
  CREATE INDEX "post_series_updated_at_idx" ON "post_series" USING btree ("updated_at");
  CREATE INDEX "post_series_created_at_idx" ON "post_series" USING btree ("created_at");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE UNIQUE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE INDEX "course_chapters_slug_idx" ON "course_chapters" USING btree ("slug");
  CREATE INDEX "course_chapters_updated_at_idx" ON "course_chapters" USING btree ("updated_at");
  CREATE INDEX "course_chapters_created_at_idx" ON "course_chapters" USING btree ("created_at");
  CREATE INDEX "pages_blocks_hero_ctas_order_idx" ON "pages_blocks_hero_ctas" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_ctas_parent_id_idx" ON "pages_blocks_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_ctas_locale_idx" ON "pages_blocks_hero_ctas" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_locale_idx" ON "pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "pages_blocks_header_links_order_idx" ON "pages_blocks_header_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_header_links_parent_id_idx" ON "pages_blocks_header_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_header_links_locale_idx" ON "pages_blocks_header_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_header_order_idx" ON "pages_blocks_header" USING btree ("_order");
  CREATE INDEX "pages_blocks_header_parent_id_idx" ON "pages_blocks_header" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_header_path_idx" ON "pages_blocks_header" USING btree ("_path");
  CREATE INDEX "pages_blocks_header_locale_idx" ON "pages_blocks_header" USING btree ("_locale");
  CREATE INDEX "pages_blocks_header_logo_idx" ON "pages_blocks_header" USING btree ("logo_id");
  CREATE INDEX "pages_blocks_footer_columns_links_order_idx" ON "pages_blocks_footer_columns_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_footer_columns_links_parent_id_idx" ON "pages_blocks_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_footer_columns_links_locale_idx" ON "pages_blocks_footer_columns_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_footer_columns_order_idx" ON "pages_blocks_footer_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_footer_columns_parent_id_idx" ON "pages_blocks_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_footer_columns_locale_idx" ON "pages_blocks_footer_columns" USING btree ("_locale");
  CREATE INDEX "pages_blocks_footer_social_links_order_idx" ON "pages_blocks_footer_social_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_footer_social_links_parent_id_idx" ON "pages_blocks_footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_footer_social_links_locale_idx" ON "pages_blocks_footer_social_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_footer_order_idx" ON "pages_blocks_footer" USING btree ("_order");
  CREATE INDEX "pages_blocks_footer_parent_id_idx" ON "pages_blocks_footer" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_footer_path_idx" ON "pages_blocks_footer" USING btree ("_path");
  CREATE INDEX "pages_blocks_footer_locale_idx" ON "pages_blocks_footer" USING btree ("_locale");
  CREATE INDEX "pages_blocks_footer_logo_idx" ON "pages_blocks_footer" USING btree ("logo_id");
  CREATE INDEX "pages_blocks_features_grid_items_order_idx" ON "pages_blocks_features_grid_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_features_grid_items_parent_id_idx" ON "pages_blocks_features_grid_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_features_grid_items_locale_idx" ON "pages_blocks_features_grid_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_features_grid_items_image_idx" ON "pages_blocks_features_grid_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_features_grid_order_idx" ON "pages_blocks_features_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_features_grid_parent_id_idx" ON "pages_blocks_features_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_features_grid_path_idx" ON "pages_blocks_features_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_features_grid_locale_idx" ON "pages_blocks_features_grid" USING btree ("_locale");
  CREATE INDEX "pages_blocks_stats_items_order_idx" ON "pages_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_items_parent_id_idx" ON "pages_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_items_locale_idx" ON "pages_blocks_stats_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_stats_order_idx" ON "pages_blocks_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_parent_id_idx" ON "pages_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_path_idx" ON "pages_blocks_stats" USING btree ("_path");
  CREATE INDEX "pages_blocks_stats_locale_idx" ON "pages_blocks_stats" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonials_items_order_idx" ON "pages_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_items_parent_id_idx" ON "pages_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_items_locale_idx" ON "pages_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonials_items_avatar_idx" ON "pages_blocks_testimonials_items" USING btree ("avatar_id");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonials_locale_idx" ON "pages_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_ctas_order_idx" ON "pages_blocks_cta_ctas" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_ctas_parent_id_idx" ON "pages_blocks_cta_ctas" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_ctas_locale_idx" ON "pages_blocks_cta_ctas" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_locale_idx" ON "pages_blocks_cta" USING btree ("_locale");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_items_locale_idx" ON "pages_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_locale_idx" ON "pages_blocks_faq" USING btree ("_locale");
  CREATE INDEX "pages_blocks_logo_cloud_items_order_idx" ON "pages_blocks_logo_cloud_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_logo_cloud_items_parent_id_idx" ON "pages_blocks_logo_cloud_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_logo_cloud_items_locale_idx" ON "pages_blocks_logo_cloud_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_logo_cloud_items_image_idx" ON "pages_blocks_logo_cloud_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_logo_cloud_order_idx" ON "pages_blocks_logo_cloud" USING btree ("_order");
  CREATE INDEX "pages_blocks_logo_cloud_parent_id_idx" ON "pages_blocks_logo_cloud" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_logo_cloud_path_idx" ON "pages_blocks_logo_cloud" USING btree ("_path");
  CREATE INDEX "pages_blocks_logo_cloud_locale_idx" ON "pages_blocks_logo_cloud" USING btree ("_locale");
  CREATE INDEX "pages_blocks_content_section_order_idx" ON "pages_blocks_content_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_section_parent_id_idx" ON "pages_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_section_path_idx" ON "pages_blocks_content_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_section_locale_idx" ON "pages_blocks_content_section" USING btree ("_locale");
  CREATE INDEX "pages_blocks_content_section_image_idx" ON "pages_blocks_content_section" USING btree ("image_id");
  CREATE INDEX "pages_blocks_pricing_table_tiers_features_order_idx" ON "pages_blocks_pricing_table_tiers_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_table_tiers_features_parent_id_idx" ON "pages_blocks_pricing_table_tiers_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_table_tiers_features_locale_idx" ON "pages_blocks_pricing_table_tiers_features" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_table_tiers_order_idx" ON "pages_blocks_pricing_table_tiers" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_table_tiers_parent_id_idx" ON "pages_blocks_pricing_table_tiers" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_table_tiers_locale_idx" ON "pages_blocks_pricing_table_tiers" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_table_order_idx" ON "pages_blocks_pricing_table" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_table_parent_id_idx" ON "pages_blocks_pricing_table" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_table_path_idx" ON "pages_blocks_pricing_table" USING btree ("_path");
  CREATE INDEX "pages_blocks_pricing_table_locale_idx" ON "pages_blocks_pricing_table" USING btree ("_locale");
  CREATE INDEX "pages_blocks_team_members_social_links_order_idx" ON "pages_blocks_team_members_social_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_members_social_links_parent_id_idx" ON "pages_blocks_team_members_social_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_members_social_links_locale_idx" ON "pages_blocks_team_members_social_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_team_members_order_idx" ON "pages_blocks_team_members" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_members_parent_id_idx" ON "pages_blocks_team_members" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_members_locale_idx" ON "pages_blocks_team_members" USING btree ("_locale");
  CREATE INDEX "pages_blocks_team_members_photo_idx" ON "pages_blocks_team_members" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_team_order_idx" ON "pages_blocks_team" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_parent_id_idx" ON "pages_blocks_team" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_path_idx" ON "pages_blocks_team" USING btree ("_path");
  CREATE INDEX "pages_blocks_team_locale_idx" ON "pages_blocks_team" USING btree ("_locale");
  CREATE INDEX "pages_blocks_timeline_items_order_idx" ON "pages_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_items_parent_id_idx" ON "pages_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_items_locale_idx" ON "pages_blocks_timeline_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_timeline_order_idx" ON "pages_blocks_timeline" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_parent_id_idx" ON "pages_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_path_idx" ON "pages_blocks_timeline" USING btree ("_path");
  CREATE INDEX "pages_blocks_timeline_locale_idx" ON "pages_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_items_order_idx" ON "pages_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_items_parent_id_idx" ON "pages_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_items_locale_idx" ON "pages_blocks_gallery_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_items_image_idx" ON "pages_blocks_gallery_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_locale_idx" ON "pages_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "pages_blocks_newsletter_order_idx" ON "pages_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "pages_blocks_newsletter_parent_id_idx" ON "pages_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_newsletter_path_idx" ON "pages_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "pages_blocks_newsletter_locale_idx" ON "pages_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_channels_order_idx" ON "pages_blocks_contact_channels" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_channels_parent_id_idx" ON "pages_blocks_contact_channels" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_channels_locale_idx" ON "pages_blocks_contact_channels" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_offices_order_idx" ON "pages_blocks_contact_offices" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_offices_parent_id_idx" ON "pages_blocks_contact_offices" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_offices_locale_idx" ON "pages_blocks_contact_offices" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_form_fields_order_idx" ON "pages_blocks_contact_form_fields" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_form_fields_parent_id_idx" ON "pages_blocks_contact_form_fields" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_form_fields_locale_idx" ON "pages_blocks_contact_form_fields" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_order_idx" ON "pages_blocks_contact" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_parent_id_idx" ON "pages_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_path_idx" ON "pages_blocks_contact" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_locale_idx" ON "pages_blocks_contact" USING btree ("_locale");
  CREATE INDEX "pages_blocks_breadcrumb_items_order_idx" ON "pages_blocks_breadcrumb_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_breadcrumb_items_parent_id_idx" ON "pages_blocks_breadcrumb_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_breadcrumb_items_locale_idx" ON "pages_blocks_breadcrumb_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_breadcrumb_order_idx" ON "pages_blocks_breadcrumb" USING btree ("_order");
  CREATE INDEX "pages_blocks_breadcrumb_parent_id_idx" ON "pages_blocks_breadcrumb" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_breadcrumb_path_idx" ON "pages_blocks_breadcrumb" USING btree ("_path");
  CREATE INDEX "pages_blocks_breadcrumb_locale_idx" ON "pages_blocks_breadcrumb" USING btree ("_locale");
  CREATE INDEX "pages_blocks_tabs_section_panels_order_idx" ON "pages_blocks_tabs_section_panels" USING btree ("_order");
  CREATE INDEX "pages_blocks_tabs_section_panels_parent_id_idx" ON "pages_blocks_tabs_section_panels" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tabs_section_panels_locale_idx" ON "pages_blocks_tabs_section_panels" USING btree ("_locale");
  CREATE INDEX "pages_blocks_tabs_section_panels_image_idx" ON "pages_blocks_tabs_section_panels" USING btree ("image_id");
  CREATE INDEX "pages_blocks_tabs_section_order_idx" ON "pages_blocks_tabs_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_tabs_section_parent_id_idx" ON "pages_blocks_tabs_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tabs_section_path_idx" ON "pages_blocks_tabs_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_tabs_section_locale_idx" ON "pages_blocks_tabs_section" USING btree ("_locale");
  CREATE INDEX "pages_blocks_steps_items_order_idx" ON "pages_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_items_parent_id_idx" ON "pages_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_items_locale_idx" ON "pages_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_steps_items_image_idx" ON "pages_blocks_steps_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_steps_order_idx" ON "pages_blocks_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_parent_id_idx" ON "pages_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_path_idx" ON "pages_blocks_steps" USING btree ("_path");
  CREATE INDEX "pages_blocks_steps_locale_idx" ON "pages_blocks_steps" USING btree ("_locale");
  CREATE INDEX "pages_blocks_banner_order_idx" ON "pages_blocks_banner" USING btree ("_order");
  CREATE INDEX "pages_blocks_banner_parent_id_idx" ON "pages_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_banner_path_idx" ON "pages_blocks_banner" USING btree ("_path");
  CREATE INDEX "pages_blocks_banner_locale_idx" ON "pages_blocks_banner" USING btree ("_locale");
  CREATE INDEX "pages_seo_keywords_order_idx" ON "pages_seo_keywords" USING btree ("_order");
  CREATE INDEX "pages_seo_keywords_parent_id_idx" ON "pages_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "pages_tenant_id_idx" ON "pages" USING btree ("tenant_id");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE INDEX "pages_seo_seo_og_image_idx" ON "pages" USING btree ("seo_og_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_ctas_order_idx" ON "_pages_v_blocks_hero_ctas" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_ctas_parent_id_idx" ON "_pages_v_blocks_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_ctas_locale_idx" ON "_pages_v_blocks_hero_ctas" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_locale_idx" ON "_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_image_idx" ON "_pages_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_header_links_order_idx" ON "_pages_v_blocks_header_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_header_links_parent_id_idx" ON "_pages_v_blocks_header_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_header_links_locale_idx" ON "_pages_v_blocks_header_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_header_order_idx" ON "_pages_v_blocks_header" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_header_parent_id_idx" ON "_pages_v_blocks_header" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_header_path_idx" ON "_pages_v_blocks_header" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_header_locale_idx" ON "_pages_v_blocks_header" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_header_logo_idx" ON "_pages_v_blocks_header" USING btree ("logo_id");
  CREATE INDEX "_pages_v_blocks_footer_columns_links_order_idx" ON "_pages_v_blocks_footer_columns_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_footer_columns_links_parent_id_idx" ON "_pages_v_blocks_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_footer_columns_links_locale_idx" ON "_pages_v_blocks_footer_columns_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_footer_columns_order_idx" ON "_pages_v_blocks_footer_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_footer_columns_parent_id_idx" ON "_pages_v_blocks_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_footer_columns_locale_idx" ON "_pages_v_blocks_footer_columns" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_footer_social_links_order_idx" ON "_pages_v_blocks_footer_social_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_footer_social_links_parent_id_idx" ON "_pages_v_blocks_footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_footer_social_links_locale_idx" ON "_pages_v_blocks_footer_social_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_footer_order_idx" ON "_pages_v_blocks_footer" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_footer_parent_id_idx" ON "_pages_v_blocks_footer" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_footer_path_idx" ON "_pages_v_blocks_footer" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_footer_locale_idx" ON "_pages_v_blocks_footer" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_footer_logo_idx" ON "_pages_v_blocks_footer" USING btree ("logo_id");
  CREATE INDEX "_pages_v_blocks_features_grid_items_order_idx" ON "_pages_v_blocks_features_grid_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_features_grid_items_parent_id_idx" ON "_pages_v_blocks_features_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_features_grid_items_locale_idx" ON "_pages_v_blocks_features_grid_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_features_grid_items_image_idx" ON "_pages_v_blocks_features_grid_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_features_grid_order_idx" ON "_pages_v_blocks_features_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_features_grid_parent_id_idx" ON "_pages_v_blocks_features_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_features_grid_path_idx" ON "_pages_v_blocks_features_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_features_grid_locale_idx" ON "_pages_v_blocks_features_grid" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_stats_items_order_idx" ON "_pages_v_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_items_parent_id_idx" ON "_pages_v_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_items_locale_idx" ON "_pages_v_blocks_stats_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_stats_order_idx" ON "_pages_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_parent_id_idx" ON "_pages_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_path_idx" ON "_pages_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_stats_locale_idx" ON "_pages_v_blocks_stats" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_testimonials_items_order_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_items_parent_id_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_items_locale_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_testimonials_items_avatar_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("avatar_id");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_locale_idx" ON "_pages_v_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_ctas_order_idx" ON "_pages_v_blocks_cta_ctas" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_ctas_parent_id_idx" ON "_pages_v_blocks_cta_ctas" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_ctas_locale_idx" ON "_pages_v_blocks_cta_ctas" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_locale_idx" ON "_pages_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_items_locale_idx" ON "_pages_v_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_locale_idx" ON "_pages_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_logo_cloud_items_order_idx" ON "_pages_v_blocks_logo_cloud_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_logo_cloud_items_parent_id_idx" ON "_pages_v_blocks_logo_cloud_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_logo_cloud_items_locale_idx" ON "_pages_v_blocks_logo_cloud_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_logo_cloud_items_image_idx" ON "_pages_v_blocks_logo_cloud_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_logo_cloud_order_idx" ON "_pages_v_blocks_logo_cloud" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_logo_cloud_parent_id_idx" ON "_pages_v_blocks_logo_cloud" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_logo_cloud_path_idx" ON "_pages_v_blocks_logo_cloud" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_logo_cloud_locale_idx" ON "_pages_v_blocks_logo_cloud" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_content_section_order_idx" ON "_pages_v_blocks_content_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_section_parent_id_idx" ON "_pages_v_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_section_path_idx" ON "_pages_v_blocks_content_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_section_locale_idx" ON "_pages_v_blocks_content_section" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_content_section_image_idx" ON "_pages_v_blocks_content_section" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_pricing_table_tiers_features_order_idx" ON "_pages_v_blocks_pricing_table_tiers_features" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_table_tiers_features_parent_id_idx" ON "_pages_v_blocks_pricing_table_tiers_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_table_tiers_features_locale_idx" ON "_pages_v_blocks_pricing_table_tiers_features" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_table_tiers_order_idx" ON "_pages_v_blocks_pricing_table_tiers" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_table_tiers_parent_id_idx" ON "_pages_v_blocks_pricing_table_tiers" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_table_tiers_locale_idx" ON "_pages_v_blocks_pricing_table_tiers" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_table_order_idx" ON "_pages_v_blocks_pricing_table" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_table_parent_id_idx" ON "_pages_v_blocks_pricing_table" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_table_path_idx" ON "_pages_v_blocks_pricing_table" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pricing_table_locale_idx" ON "_pages_v_blocks_pricing_table" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_team_members_social_links_order_idx" ON "_pages_v_blocks_team_members_social_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_members_social_links_parent_id_idx" ON "_pages_v_blocks_team_members_social_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_members_social_links_locale_idx" ON "_pages_v_blocks_team_members_social_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_team_members_order_idx" ON "_pages_v_blocks_team_members" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_members_parent_id_idx" ON "_pages_v_blocks_team_members" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_members_locale_idx" ON "_pages_v_blocks_team_members" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_team_members_photo_idx" ON "_pages_v_blocks_team_members" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_team_order_idx" ON "_pages_v_blocks_team" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_parent_id_idx" ON "_pages_v_blocks_team" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_path_idx" ON "_pages_v_blocks_team" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_team_locale_idx" ON "_pages_v_blocks_team" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_timeline_items_order_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_items_parent_id_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_items_locale_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_timeline_order_idx" ON "_pages_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_parent_id_idx" ON "_pages_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_path_idx" ON "_pages_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_timeline_locale_idx" ON "_pages_v_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_items_order_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_items_parent_id_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_items_locale_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_items_image_idx" ON "_pages_v_blocks_gallery_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_locale_idx" ON "_pages_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_newsletter_order_idx" ON "_pages_v_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_newsletter_parent_id_idx" ON "_pages_v_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_newsletter_path_idx" ON "_pages_v_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_newsletter_locale_idx" ON "_pages_v_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_channels_order_idx" ON "_pages_v_blocks_contact_channels" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_channels_parent_id_idx" ON "_pages_v_blocks_contact_channels" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_channels_locale_idx" ON "_pages_v_blocks_contact_channels" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_offices_order_idx" ON "_pages_v_blocks_contact_offices" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_offices_parent_id_idx" ON "_pages_v_blocks_contact_offices" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_offices_locale_idx" ON "_pages_v_blocks_contact_offices" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_form_fields_order_idx" ON "_pages_v_blocks_contact_form_fields" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_form_fields_parent_id_idx" ON "_pages_v_blocks_contact_form_fields" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_form_fields_locale_idx" ON "_pages_v_blocks_contact_form_fields" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_order_idx" ON "_pages_v_blocks_contact" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_parent_id_idx" ON "_pages_v_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_path_idx" ON "_pages_v_blocks_contact" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_locale_idx" ON "_pages_v_blocks_contact" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_breadcrumb_items_order_idx" ON "_pages_v_blocks_breadcrumb_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_breadcrumb_items_parent_id_idx" ON "_pages_v_blocks_breadcrumb_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_breadcrumb_items_locale_idx" ON "_pages_v_blocks_breadcrumb_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_breadcrumb_order_idx" ON "_pages_v_blocks_breadcrumb" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_breadcrumb_parent_id_idx" ON "_pages_v_blocks_breadcrumb" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_breadcrumb_path_idx" ON "_pages_v_blocks_breadcrumb" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_breadcrumb_locale_idx" ON "_pages_v_blocks_breadcrumb" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_tabs_section_panels_order_idx" ON "_pages_v_blocks_tabs_section_panels" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tabs_section_panels_parent_id_idx" ON "_pages_v_blocks_tabs_section_panels" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tabs_section_panels_locale_idx" ON "_pages_v_blocks_tabs_section_panels" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_tabs_section_panels_image_idx" ON "_pages_v_blocks_tabs_section_panels" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_tabs_section_order_idx" ON "_pages_v_blocks_tabs_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tabs_section_parent_id_idx" ON "_pages_v_blocks_tabs_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tabs_section_path_idx" ON "_pages_v_blocks_tabs_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_tabs_section_locale_idx" ON "_pages_v_blocks_tabs_section" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_steps_items_order_idx" ON "_pages_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_items_parent_id_idx" ON "_pages_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_items_locale_idx" ON "_pages_v_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_steps_items_image_idx" ON "_pages_v_blocks_steps_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_steps_order_idx" ON "_pages_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_parent_id_idx" ON "_pages_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_path_idx" ON "_pages_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_steps_locale_idx" ON "_pages_v_blocks_steps" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_banner_order_idx" ON "_pages_v_blocks_banner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_banner_parent_id_idx" ON "_pages_v_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_banner_path_idx" ON "_pages_v_blocks_banner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_banner_locale_idx" ON "_pages_v_blocks_banner" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_seo_keywords_order_idx" ON "_pages_v_version_seo_keywords" USING btree ("_order");
  CREATE INDEX "_pages_v_version_seo_keywords_parent_id_idx" ON "_pages_v_version_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_tenant_id_idx" ON "_pages_v" USING btree ("version_tenant_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_parent_idx" ON "_pages_v" USING btree ("version_parent_id");
  CREATE INDEX "_pages_v_version_seo_version_seo_og_image_idx" ON "_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "shop_pages_blocks_hero_ctas_order_idx" ON "shop_pages_blocks_hero_ctas" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_hero_ctas_parent_id_idx" ON "shop_pages_blocks_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_hero_ctas_locale_idx" ON "shop_pages_blocks_hero_ctas" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_hero_order_idx" ON "shop_pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_hero_parent_id_idx" ON "shop_pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_hero_path_idx" ON "shop_pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_hero_locale_idx" ON "shop_pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_hero_image_idx" ON "shop_pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "shop_pages_blocks_header_links_order_idx" ON "shop_pages_blocks_header_links" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_header_links_parent_id_idx" ON "shop_pages_blocks_header_links" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_header_links_locale_idx" ON "shop_pages_blocks_header_links" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_header_order_idx" ON "shop_pages_blocks_header" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_header_parent_id_idx" ON "shop_pages_blocks_header" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_header_path_idx" ON "shop_pages_blocks_header" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_header_locale_idx" ON "shop_pages_blocks_header" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_header_logo_idx" ON "shop_pages_blocks_header" USING btree ("logo_id");
  CREATE INDEX "shop_pages_blocks_footer_columns_links_order_idx" ON "shop_pages_blocks_footer_columns_links" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_footer_columns_links_parent_id_idx" ON "shop_pages_blocks_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_footer_columns_links_locale_idx" ON "shop_pages_blocks_footer_columns_links" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_footer_columns_order_idx" ON "shop_pages_blocks_footer_columns" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_footer_columns_parent_id_idx" ON "shop_pages_blocks_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_footer_columns_locale_idx" ON "shop_pages_blocks_footer_columns" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_footer_social_links_order_idx" ON "shop_pages_blocks_footer_social_links" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_footer_social_links_parent_id_idx" ON "shop_pages_blocks_footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_footer_social_links_locale_idx" ON "shop_pages_blocks_footer_social_links" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_footer_order_idx" ON "shop_pages_blocks_footer" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_footer_parent_id_idx" ON "shop_pages_blocks_footer" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_footer_path_idx" ON "shop_pages_blocks_footer" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_footer_locale_idx" ON "shop_pages_blocks_footer" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_footer_logo_idx" ON "shop_pages_blocks_footer" USING btree ("logo_id");
  CREATE INDEX "shop_pages_blocks_features_grid_items_order_idx" ON "shop_pages_blocks_features_grid_items" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_features_grid_items_parent_id_idx" ON "shop_pages_blocks_features_grid_items" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_features_grid_items_locale_idx" ON "shop_pages_blocks_features_grid_items" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_features_grid_items_image_idx" ON "shop_pages_blocks_features_grid_items" USING btree ("image_id");
  CREATE INDEX "shop_pages_blocks_features_grid_order_idx" ON "shop_pages_blocks_features_grid" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_features_grid_parent_id_idx" ON "shop_pages_blocks_features_grid" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_features_grid_path_idx" ON "shop_pages_blocks_features_grid" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_features_grid_locale_idx" ON "shop_pages_blocks_features_grid" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_stats_items_order_idx" ON "shop_pages_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_stats_items_parent_id_idx" ON "shop_pages_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_stats_items_locale_idx" ON "shop_pages_blocks_stats_items" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_stats_order_idx" ON "shop_pages_blocks_stats" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_stats_parent_id_idx" ON "shop_pages_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_stats_path_idx" ON "shop_pages_blocks_stats" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_stats_locale_idx" ON "shop_pages_blocks_stats" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_testimonials_items_order_idx" ON "shop_pages_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_testimonials_items_parent_id_idx" ON "shop_pages_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_testimonials_items_locale_idx" ON "shop_pages_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_testimonials_items_avatar_idx" ON "shop_pages_blocks_testimonials_items" USING btree ("avatar_id");
  CREATE INDEX "shop_pages_blocks_testimonials_order_idx" ON "shop_pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_testimonials_parent_id_idx" ON "shop_pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_testimonials_path_idx" ON "shop_pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_testimonials_locale_idx" ON "shop_pages_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_cta_ctas_order_idx" ON "shop_pages_blocks_cta_ctas" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_cta_ctas_parent_id_idx" ON "shop_pages_blocks_cta_ctas" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_cta_ctas_locale_idx" ON "shop_pages_blocks_cta_ctas" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_cta_order_idx" ON "shop_pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_cta_parent_id_idx" ON "shop_pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_cta_path_idx" ON "shop_pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_cta_locale_idx" ON "shop_pages_blocks_cta" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_faq_items_order_idx" ON "shop_pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_faq_items_parent_id_idx" ON "shop_pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_faq_items_locale_idx" ON "shop_pages_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_faq_order_idx" ON "shop_pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_faq_parent_id_idx" ON "shop_pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_faq_path_idx" ON "shop_pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_faq_locale_idx" ON "shop_pages_blocks_faq" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_logo_cloud_items_order_idx" ON "shop_pages_blocks_logo_cloud_items" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_logo_cloud_items_parent_id_idx" ON "shop_pages_blocks_logo_cloud_items" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_logo_cloud_items_locale_idx" ON "shop_pages_blocks_logo_cloud_items" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_logo_cloud_items_image_idx" ON "shop_pages_blocks_logo_cloud_items" USING btree ("image_id");
  CREATE INDEX "shop_pages_blocks_logo_cloud_order_idx" ON "shop_pages_blocks_logo_cloud" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_logo_cloud_parent_id_idx" ON "shop_pages_blocks_logo_cloud" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_logo_cloud_path_idx" ON "shop_pages_blocks_logo_cloud" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_logo_cloud_locale_idx" ON "shop_pages_blocks_logo_cloud" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_content_section_order_idx" ON "shop_pages_blocks_content_section" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_content_section_parent_id_idx" ON "shop_pages_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_content_section_path_idx" ON "shop_pages_blocks_content_section" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_content_section_locale_idx" ON "shop_pages_blocks_content_section" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_content_section_image_idx" ON "shop_pages_blocks_content_section" USING btree ("image_id");
  CREATE INDEX "shop_pages_blocks_pricing_table_tiers_features_order_idx" ON "shop_pages_blocks_pricing_table_tiers_features" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_pricing_table_tiers_features_parent_id_idx" ON "shop_pages_blocks_pricing_table_tiers_features" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_pricing_table_tiers_features_locale_idx" ON "shop_pages_blocks_pricing_table_tiers_features" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_pricing_table_tiers_order_idx" ON "shop_pages_blocks_pricing_table_tiers" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_pricing_table_tiers_parent_id_idx" ON "shop_pages_blocks_pricing_table_tiers" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_pricing_table_tiers_locale_idx" ON "shop_pages_blocks_pricing_table_tiers" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_pricing_table_order_idx" ON "shop_pages_blocks_pricing_table" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_pricing_table_parent_id_idx" ON "shop_pages_blocks_pricing_table" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_pricing_table_path_idx" ON "shop_pages_blocks_pricing_table" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_pricing_table_locale_idx" ON "shop_pages_blocks_pricing_table" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_team_members_social_links_order_idx" ON "shop_pages_blocks_team_members_social_links" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_team_members_social_links_parent_id_idx" ON "shop_pages_blocks_team_members_social_links" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_team_members_social_links_locale_idx" ON "shop_pages_blocks_team_members_social_links" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_team_members_order_idx" ON "shop_pages_blocks_team_members" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_team_members_parent_id_idx" ON "shop_pages_blocks_team_members" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_team_members_locale_idx" ON "shop_pages_blocks_team_members" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_team_members_photo_idx" ON "shop_pages_blocks_team_members" USING btree ("photo_id");
  CREATE INDEX "shop_pages_blocks_team_order_idx" ON "shop_pages_blocks_team" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_team_parent_id_idx" ON "shop_pages_blocks_team" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_team_path_idx" ON "shop_pages_blocks_team" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_team_locale_idx" ON "shop_pages_blocks_team" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_timeline_items_order_idx" ON "shop_pages_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_timeline_items_parent_id_idx" ON "shop_pages_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_timeline_items_locale_idx" ON "shop_pages_blocks_timeline_items" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_timeline_order_idx" ON "shop_pages_blocks_timeline" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_timeline_parent_id_idx" ON "shop_pages_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_timeline_path_idx" ON "shop_pages_blocks_timeline" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_timeline_locale_idx" ON "shop_pages_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_gallery_items_order_idx" ON "shop_pages_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_gallery_items_parent_id_idx" ON "shop_pages_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_gallery_items_locale_idx" ON "shop_pages_blocks_gallery_items" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_gallery_items_image_idx" ON "shop_pages_blocks_gallery_items" USING btree ("image_id");
  CREATE INDEX "shop_pages_blocks_gallery_order_idx" ON "shop_pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_gallery_parent_id_idx" ON "shop_pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_gallery_path_idx" ON "shop_pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_gallery_locale_idx" ON "shop_pages_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_newsletter_order_idx" ON "shop_pages_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_newsletter_parent_id_idx" ON "shop_pages_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_newsletter_path_idx" ON "shop_pages_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_newsletter_locale_idx" ON "shop_pages_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_contact_channels_order_idx" ON "shop_pages_blocks_contact_channels" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_contact_channels_parent_id_idx" ON "shop_pages_blocks_contact_channels" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_contact_channels_locale_idx" ON "shop_pages_blocks_contact_channels" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_contact_offices_order_idx" ON "shop_pages_blocks_contact_offices" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_contact_offices_parent_id_idx" ON "shop_pages_blocks_contact_offices" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_contact_offices_locale_idx" ON "shop_pages_blocks_contact_offices" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_contact_form_fields_order_idx" ON "shop_pages_blocks_contact_form_fields" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_contact_form_fields_parent_id_idx" ON "shop_pages_blocks_contact_form_fields" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_contact_form_fields_locale_idx" ON "shop_pages_blocks_contact_form_fields" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_contact_order_idx" ON "shop_pages_blocks_contact" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_contact_parent_id_idx" ON "shop_pages_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_contact_path_idx" ON "shop_pages_blocks_contact" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_contact_locale_idx" ON "shop_pages_blocks_contact" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_breadcrumb_items_order_idx" ON "shop_pages_blocks_breadcrumb_items" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_breadcrumb_items_parent_id_idx" ON "shop_pages_blocks_breadcrumb_items" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_breadcrumb_items_locale_idx" ON "shop_pages_blocks_breadcrumb_items" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_breadcrumb_order_idx" ON "shop_pages_blocks_breadcrumb" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_breadcrumb_parent_id_idx" ON "shop_pages_blocks_breadcrumb" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_breadcrumb_path_idx" ON "shop_pages_blocks_breadcrumb" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_breadcrumb_locale_idx" ON "shop_pages_blocks_breadcrumb" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_tabs_section_panels_order_idx" ON "shop_pages_blocks_tabs_section_panels" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_tabs_section_panels_parent_id_idx" ON "shop_pages_blocks_tabs_section_panels" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_tabs_section_panels_locale_idx" ON "shop_pages_blocks_tabs_section_panels" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_tabs_section_panels_image_idx" ON "shop_pages_blocks_tabs_section_panels" USING btree ("image_id");
  CREATE INDEX "shop_pages_blocks_tabs_section_order_idx" ON "shop_pages_blocks_tabs_section" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_tabs_section_parent_id_idx" ON "shop_pages_blocks_tabs_section" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_tabs_section_path_idx" ON "shop_pages_blocks_tabs_section" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_tabs_section_locale_idx" ON "shop_pages_blocks_tabs_section" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_steps_items_order_idx" ON "shop_pages_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_steps_items_parent_id_idx" ON "shop_pages_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_steps_items_locale_idx" ON "shop_pages_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_steps_items_image_idx" ON "shop_pages_blocks_steps_items" USING btree ("image_id");
  CREATE INDEX "shop_pages_blocks_steps_order_idx" ON "shop_pages_blocks_steps" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_steps_parent_id_idx" ON "shop_pages_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_steps_path_idx" ON "shop_pages_blocks_steps" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_steps_locale_idx" ON "shop_pages_blocks_steps" USING btree ("_locale");
  CREATE INDEX "shop_pages_blocks_banner_order_idx" ON "shop_pages_blocks_banner" USING btree ("_order");
  CREATE INDEX "shop_pages_blocks_banner_parent_id_idx" ON "shop_pages_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_blocks_banner_path_idx" ON "shop_pages_blocks_banner" USING btree ("_path");
  CREATE INDEX "shop_pages_blocks_banner_locale_idx" ON "shop_pages_blocks_banner" USING btree ("_locale");
  CREATE INDEX "shop_pages_seo_keywords_order_idx" ON "shop_pages_seo_keywords" USING btree ("_order");
  CREATE INDEX "shop_pages_seo_keywords_parent_id_idx" ON "shop_pages_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "shop_pages_tenant_id_idx" ON "shop_pages" USING btree ("tenant_id");
  CREATE INDEX "shop_pages_slug_idx" ON "shop_pages" USING btree ("slug");
  CREATE INDEX "shop_pages_product_idx" ON "shop_pages" USING btree ("product_id");
  CREATE INDEX "shop_pages_seo_seo_og_image_idx" ON "shop_pages" USING btree ("seo_og_image_id");
  CREATE INDEX "shop_pages_updated_at_idx" ON "shop_pages" USING btree ("updated_at");
  CREATE INDEX "shop_pages_created_at_idx" ON "shop_pages" USING btree ("created_at");
  CREATE INDEX "shop_pages__status_idx" ON "shop_pages" USING btree ("_status");
  CREATE UNIQUE INDEX "shop_pages_locales_locale_parent_id_unique" ON "shop_pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_hero_ctas_order_idx" ON "_shop_pages_v_blocks_hero_ctas" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_hero_ctas_parent_id_idx" ON "_shop_pages_v_blocks_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_hero_ctas_locale_idx" ON "_shop_pages_v_blocks_hero_ctas" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_hero_order_idx" ON "_shop_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_hero_parent_id_idx" ON "_shop_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_hero_path_idx" ON "_shop_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_hero_locale_idx" ON "_shop_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_hero_image_idx" ON "_shop_pages_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_shop_pages_v_blocks_header_links_order_idx" ON "_shop_pages_v_blocks_header_links" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_header_links_parent_id_idx" ON "_shop_pages_v_blocks_header_links" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_header_links_locale_idx" ON "_shop_pages_v_blocks_header_links" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_header_order_idx" ON "_shop_pages_v_blocks_header" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_header_parent_id_idx" ON "_shop_pages_v_blocks_header" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_header_path_idx" ON "_shop_pages_v_blocks_header" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_header_locale_idx" ON "_shop_pages_v_blocks_header" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_header_logo_idx" ON "_shop_pages_v_blocks_header" USING btree ("logo_id");
  CREATE INDEX "_shop_pages_v_blocks_footer_columns_links_order_idx" ON "_shop_pages_v_blocks_footer_columns_links" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_footer_columns_links_parent_id_idx" ON "_shop_pages_v_blocks_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_footer_columns_links_locale_idx" ON "_shop_pages_v_blocks_footer_columns_links" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_footer_columns_order_idx" ON "_shop_pages_v_blocks_footer_columns" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_footer_columns_parent_id_idx" ON "_shop_pages_v_blocks_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_footer_columns_locale_idx" ON "_shop_pages_v_blocks_footer_columns" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_footer_social_links_order_idx" ON "_shop_pages_v_blocks_footer_social_links" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_footer_social_links_parent_id_idx" ON "_shop_pages_v_blocks_footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_footer_social_links_locale_idx" ON "_shop_pages_v_blocks_footer_social_links" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_footer_order_idx" ON "_shop_pages_v_blocks_footer" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_footer_parent_id_idx" ON "_shop_pages_v_blocks_footer" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_footer_path_idx" ON "_shop_pages_v_blocks_footer" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_footer_locale_idx" ON "_shop_pages_v_blocks_footer" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_footer_logo_idx" ON "_shop_pages_v_blocks_footer" USING btree ("logo_id");
  CREATE INDEX "_shop_pages_v_blocks_features_grid_items_order_idx" ON "_shop_pages_v_blocks_features_grid_items" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_features_grid_items_parent_id_idx" ON "_shop_pages_v_blocks_features_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_features_grid_items_locale_idx" ON "_shop_pages_v_blocks_features_grid_items" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_features_grid_items_image_idx" ON "_shop_pages_v_blocks_features_grid_items" USING btree ("image_id");
  CREATE INDEX "_shop_pages_v_blocks_features_grid_order_idx" ON "_shop_pages_v_blocks_features_grid" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_features_grid_parent_id_idx" ON "_shop_pages_v_blocks_features_grid" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_features_grid_path_idx" ON "_shop_pages_v_blocks_features_grid" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_features_grid_locale_idx" ON "_shop_pages_v_blocks_features_grid" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_stats_items_order_idx" ON "_shop_pages_v_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_stats_items_parent_id_idx" ON "_shop_pages_v_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_stats_items_locale_idx" ON "_shop_pages_v_blocks_stats_items" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_stats_order_idx" ON "_shop_pages_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_stats_parent_id_idx" ON "_shop_pages_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_stats_path_idx" ON "_shop_pages_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_stats_locale_idx" ON "_shop_pages_v_blocks_stats" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_testimonials_items_order_idx" ON "_shop_pages_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_testimonials_items_parent_id_idx" ON "_shop_pages_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_testimonials_items_locale_idx" ON "_shop_pages_v_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_testimonials_items_avatar_idx" ON "_shop_pages_v_blocks_testimonials_items" USING btree ("avatar_id");
  CREATE INDEX "_shop_pages_v_blocks_testimonials_order_idx" ON "_shop_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_testimonials_parent_id_idx" ON "_shop_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_testimonials_path_idx" ON "_shop_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_testimonials_locale_idx" ON "_shop_pages_v_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_cta_ctas_order_idx" ON "_shop_pages_v_blocks_cta_ctas" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_cta_ctas_parent_id_idx" ON "_shop_pages_v_blocks_cta_ctas" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_cta_ctas_locale_idx" ON "_shop_pages_v_blocks_cta_ctas" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_cta_order_idx" ON "_shop_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_cta_parent_id_idx" ON "_shop_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_cta_path_idx" ON "_shop_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_cta_locale_idx" ON "_shop_pages_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_faq_items_order_idx" ON "_shop_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_faq_items_parent_id_idx" ON "_shop_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_faq_items_locale_idx" ON "_shop_pages_v_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_faq_order_idx" ON "_shop_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_faq_parent_id_idx" ON "_shop_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_faq_path_idx" ON "_shop_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_faq_locale_idx" ON "_shop_pages_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_logo_cloud_items_order_idx" ON "_shop_pages_v_blocks_logo_cloud_items" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_logo_cloud_items_parent_id_idx" ON "_shop_pages_v_blocks_logo_cloud_items" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_logo_cloud_items_locale_idx" ON "_shop_pages_v_blocks_logo_cloud_items" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_logo_cloud_items_image_idx" ON "_shop_pages_v_blocks_logo_cloud_items" USING btree ("image_id");
  CREATE INDEX "_shop_pages_v_blocks_logo_cloud_order_idx" ON "_shop_pages_v_blocks_logo_cloud" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_logo_cloud_parent_id_idx" ON "_shop_pages_v_blocks_logo_cloud" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_logo_cloud_path_idx" ON "_shop_pages_v_blocks_logo_cloud" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_logo_cloud_locale_idx" ON "_shop_pages_v_blocks_logo_cloud" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_content_section_order_idx" ON "_shop_pages_v_blocks_content_section" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_content_section_parent_id_idx" ON "_shop_pages_v_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_content_section_path_idx" ON "_shop_pages_v_blocks_content_section" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_content_section_locale_idx" ON "_shop_pages_v_blocks_content_section" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_content_section_image_idx" ON "_shop_pages_v_blocks_content_section" USING btree ("image_id");
  CREATE INDEX "_shop_pages_v_blocks_pricing_table_tiers_features_order_idx" ON "_shop_pages_v_blocks_pricing_table_tiers_features" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_pricing_table_tiers_features_parent_id_idx" ON "_shop_pages_v_blocks_pricing_table_tiers_features" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_pricing_table_tiers_features_locale_idx" ON "_shop_pages_v_blocks_pricing_table_tiers_features" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_pricing_table_tiers_order_idx" ON "_shop_pages_v_blocks_pricing_table_tiers" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_pricing_table_tiers_parent_id_idx" ON "_shop_pages_v_blocks_pricing_table_tiers" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_pricing_table_tiers_locale_idx" ON "_shop_pages_v_blocks_pricing_table_tiers" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_pricing_table_order_idx" ON "_shop_pages_v_blocks_pricing_table" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_pricing_table_parent_id_idx" ON "_shop_pages_v_blocks_pricing_table" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_pricing_table_path_idx" ON "_shop_pages_v_blocks_pricing_table" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_pricing_table_locale_idx" ON "_shop_pages_v_blocks_pricing_table" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_team_members_social_links_order_idx" ON "_shop_pages_v_blocks_team_members_social_links" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_team_members_social_links_parent_id_idx" ON "_shop_pages_v_blocks_team_members_social_links" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_team_members_social_links_locale_idx" ON "_shop_pages_v_blocks_team_members_social_links" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_team_members_order_idx" ON "_shop_pages_v_blocks_team_members" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_team_members_parent_id_idx" ON "_shop_pages_v_blocks_team_members" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_team_members_locale_idx" ON "_shop_pages_v_blocks_team_members" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_team_members_photo_idx" ON "_shop_pages_v_blocks_team_members" USING btree ("photo_id");
  CREATE INDEX "_shop_pages_v_blocks_team_order_idx" ON "_shop_pages_v_blocks_team" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_team_parent_id_idx" ON "_shop_pages_v_blocks_team" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_team_path_idx" ON "_shop_pages_v_blocks_team" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_team_locale_idx" ON "_shop_pages_v_blocks_team" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_timeline_items_order_idx" ON "_shop_pages_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_timeline_items_parent_id_idx" ON "_shop_pages_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_timeline_items_locale_idx" ON "_shop_pages_v_blocks_timeline_items" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_timeline_order_idx" ON "_shop_pages_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_timeline_parent_id_idx" ON "_shop_pages_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_timeline_path_idx" ON "_shop_pages_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_timeline_locale_idx" ON "_shop_pages_v_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_gallery_items_order_idx" ON "_shop_pages_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_gallery_items_parent_id_idx" ON "_shop_pages_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_gallery_items_locale_idx" ON "_shop_pages_v_blocks_gallery_items" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_gallery_items_image_idx" ON "_shop_pages_v_blocks_gallery_items" USING btree ("image_id");
  CREATE INDEX "_shop_pages_v_blocks_gallery_order_idx" ON "_shop_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_gallery_parent_id_idx" ON "_shop_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_gallery_path_idx" ON "_shop_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_gallery_locale_idx" ON "_shop_pages_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_newsletter_order_idx" ON "_shop_pages_v_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_newsletter_parent_id_idx" ON "_shop_pages_v_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_newsletter_path_idx" ON "_shop_pages_v_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_newsletter_locale_idx" ON "_shop_pages_v_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_contact_channels_order_idx" ON "_shop_pages_v_blocks_contact_channels" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_contact_channels_parent_id_idx" ON "_shop_pages_v_blocks_contact_channels" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_contact_channels_locale_idx" ON "_shop_pages_v_blocks_contact_channels" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_contact_offices_order_idx" ON "_shop_pages_v_blocks_contact_offices" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_contact_offices_parent_id_idx" ON "_shop_pages_v_blocks_contact_offices" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_contact_offices_locale_idx" ON "_shop_pages_v_blocks_contact_offices" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_contact_form_fields_order_idx" ON "_shop_pages_v_blocks_contact_form_fields" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_contact_form_fields_parent_id_idx" ON "_shop_pages_v_blocks_contact_form_fields" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_contact_form_fields_locale_idx" ON "_shop_pages_v_blocks_contact_form_fields" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_contact_order_idx" ON "_shop_pages_v_blocks_contact" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_contact_parent_id_idx" ON "_shop_pages_v_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_contact_path_idx" ON "_shop_pages_v_blocks_contact" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_contact_locale_idx" ON "_shop_pages_v_blocks_contact" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_breadcrumb_items_order_idx" ON "_shop_pages_v_blocks_breadcrumb_items" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_breadcrumb_items_parent_id_idx" ON "_shop_pages_v_blocks_breadcrumb_items" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_breadcrumb_items_locale_idx" ON "_shop_pages_v_blocks_breadcrumb_items" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_breadcrumb_order_idx" ON "_shop_pages_v_blocks_breadcrumb" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_breadcrumb_parent_id_idx" ON "_shop_pages_v_blocks_breadcrumb" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_breadcrumb_path_idx" ON "_shop_pages_v_blocks_breadcrumb" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_breadcrumb_locale_idx" ON "_shop_pages_v_blocks_breadcrumb" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_tabs_section_panels_order_idx" ON "_shop_pages_v_blocks_tabs_section_panels" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_tabs_section_panels_parent_id_idx" ON "_shop_pages_v_blocks_tabs_section_panels" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_tabs_section_panels_locale_idx" ON "_shop_pages_v_blocks_tabs_section_panels" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_tabs_section_panels_image_idx" ON "_shop_pages_v_blocks_tabs_section_panels" USING btree ("image_id");
  CREATE INDEX "_shop_pages_v_blocks_tabs_section_order_idx" ON "_shop_pages_v_blocks_tabs_section" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_tabs_section_parent_id_idx" ON "_shop_pages_v_blocks_tabs_section" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_tabs_section_path_idx" ON "_shop_pages_v_blocks_tabs_section" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_tabs_section_locale_idx" ON "_shop_pages_v_blocks_tabs_section" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_steps_items_order_idx" ON "_shop_pages_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_steps_items_parent_id_idx" ON "_shop_pages_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_steps_items_locale_idx" ON "_shop_pages_v_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_steps_items_image_idx" ON "_shop_pages_v_blocks_steps_items" USING btree ("image_id");
  CREATE INDEX "_shop_pages_v_blocks_steps_order_idx" ON "_shop_pages_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_steps_parent_id_idx" ON "_shop_pages_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_steps_path_idx" ON "_shop_pages_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_steps_locale_idx" ON "_shop_pages_v_blocks_steps" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_blocks_banner_order_idx" ON "_shop_pages_v_blocks_banner" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_blocks_banner_parent_id_idx" ON "_shop_pages_v_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_blocks_banner_path_idx" ON "_shop_pages_v_blocks_banner" USING btree ("_path");
  CREATE INDEX "_shop_pages_v_blocks_banner_locale_idx" ON "_shop_pages_v_blocks_banner" USING btree ("_locale");
  CREATE INDEX "_shop_pages_v_version_seo_keywords_order_idx" ON "_shop_pages_v_version_seo_keywords" USING btree ("_order");
  CREATE INDEX "_shop_pages_v_version_seo_keywords_parent_id_idx" ON "_shop_pages_v_version_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "_shop_pages_v_parent_idx" ON "_shop_pages_v" USING btree ("parent_id");
  CREATE INDEX "_shop_pages_v_version_version_tenant_id_idx" ON "_shop_pages_v" USING btree ("version_tenant_id");
  CREATE INDEX "_shop_pages_v_version_version_slug_idx" ON "_shop_pages_v" USING btree ("version_slug");
  CREATE INDEX "_shop_pages_v_version_version_product_idx" ON "_shop_pages_v" USING btree ("version_product_id");
  CREATE INDEX "_shop_pages_v_version_seo_version_seo_og_image_idx" ON "_shop_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_shop_pages_v_version_version_updated_at_idx" ON "_shop_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_shop_pages_v_version_version_created_at_idx" ON "_shop_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_shop_pages_v_version_version__status_idx" ON "_shop_pages_v" USING btree ("version__status");
  CREATE INDEX "_shop_pages_v_created_at_idx" ON "_shop_pages_v" USING btree ("created_at");
  CREATE INDEX "_shop_pages_v_updated_at_idx" ON "_shop_pages_v" USING btree ("updated_at");
  CREATE INDEX "_shop_pages_v_snapshot_idx" ON "_shop_pages_v" USING btree ("snapshot");
  CREATE INDEX "_shop_pages_v_published_locale_idx" ON "_shop_pages_v" USING btree ("published_locale");
  CREATE INDEX "_shop_pages_v_latest_idx" ON "_shop_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_shop_pages_v_locales_locale_parent_id_unique" ON "_shop_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "course_pages_blocks_hero_ctas_order_idx" ON "course_pages_blocks_hero_ctas" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_hero_ctas_parent_id_idx" ON "course_pages_blocks_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_hero_ctas_locale_idx" ON "course_pages_blocks_hero_ctas" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_hero_order_idx" ON "course_pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_hero_parent_id_idx" ON "course_pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_hero_path_idx" ON "course_pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_hero_locale_idx" ON "course_pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_hero_image_idx" ON "course_pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "course_pages_blocks_header_links_order_idx" ON "course_pages_blocks_header_links" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_header_links_parent_id_idx" ON "course_pages_blocks_header_links" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_header_links_locale_idx" ON "course_pages_blocks_header_links" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_header_order_idx" ON "course_pages_blocks_header" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_header_parent_id_idx" ON "course_pages_blocks_header" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_header_path_idx" ON "course_pages_blocks_header" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_header_locale_idx" ON "course_pages_blocks_header" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_header_logo_idx" ON "course_pages_blocks_header" USING btree ("logo_id");
  CREATE INDEX "course_pages_blocks_footer_columns_links_order_idx" ON "course_pages_blocks_footer_columns_links" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_footer_columns_links_parent_id_idx" ON "course_pages_blocks_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_footer_columns_links_locale_idx" ON "course_pages_blocks_footer_columns_links" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_footer_columns_order_idx" ON "course_pages_blocks_footer_columns" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_footer_columns_parent_id_idx" ON "course_pages_blocks_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_footer_columns_locale_idx" ON "course_pages_blocks_footer_columns" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_footer_social_links_order_idx" ON "course_pages_blocks_footer_social_links" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_footer_social_links_parent_id_idx" ON "course_pages_blocks_footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_footer_social_links_locale_idx" ON "course_pages_blocks_footer_social_links" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_footer_order_idx" ON "course_pages_blocks_footer" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_footer_parent_id_idx" ON "course_pages_blocks_footer" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_footer_path_idx" ON "course_pages_blocks_footer" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_footer_locale_idx" ON "course_pages_blocks_footer" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_footer_logo_idx" ON "course_pages_blocks_footer" USING btree ("logo_id");
  CREATE INDEX "course_pages_blocks_features_grid_items_order_idx" ON "course_pages_blocks_features_grid_items" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_features_grid_items_parent_id_idx" ON "course_pages_blocks_features_grid_items" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_features_grid_items_locale_idx" ON "course_pages_blocks_features_grid_items" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_features_grid_items_image_idx" ON "course_pages_blocks_features_grid_items" USING btree ("image_id");
  CREATE INDEX "course_pages_blocks_features_grid_order_idx" ON "course_pages_blocks_features_grid" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_features_grid_parent_id_idx" ON "course_pages_blocks_features_grid" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_features_grid_path_idx" ON "course_pages_blocks_features_grid" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_features_grid_locale_idx" ON "course_pages_blocks_features_grid" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_stats_items_order_idx" ON "course_pages_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_stats_items_parent_id_idx" ON "course_pages_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_stats_items_locale_idx" ON "course_pages_blocks_stats_items" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_stats_order_idx" ON "course_pages_blocks_stats" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_stats_parent_id_idx" ON "course_pages_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_stats_path_idx" ON "course_pages_blocks_stats" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_stats_locale_idx" ON "course_pages_blocks_stats" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_testimonials_items_order_idx" ON "course_pages_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_testimonials_items_parent_id_idx" ON "course_pages_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_testimonials_items_locale_idx" ON "course_pages_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_testimonials_items_avatar_idx" ON "course_pages_blocks_testimonials_items" USING btree ("avatar_id");
  CREATE INDEX "course_pages_blocks_testimonials_order_idx" ON "course_pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_testimonials_parent_id_idx" ON "course_pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_testimonials_path_idx" ON "course_pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_testimonials_locale_idx" ON "course_pages_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_cta_ctas_order_idx" ON "course_pages_blocks_cta_ctas" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_cta_ctas_parent_id_idx" ON "course_pages_blocks_cta_ctas" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_cta_ctas_locale_idx" ON "course_pages_blocks_cta_ctas" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_cta_order_idx" ON "course_pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_cta_parent_id_idx" ON "course_pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_cta_path_idx" ON "course_pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_cta_locale_idx" ON "course_pages_blocks_cta" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_faq_items_order_idx" ON "course_pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_faq_items_parent_id_idx" ON "course_pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_faq_items_locale_idx" ON "course_pages_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_faq_order_idx" ON "course_pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_faq_parent_id_idx" ON "course_pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_faq_path_idx" ON "course_pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_faq_locale_idx" ON "course_pages_blocks_faq" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_logo_cloud_items_order_idx" ON "course_pages_blocks_logo_cloud_items" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_logo_cloud_items_parent_id_idx" ON "course_pages_blocks_logo_cloud_items" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_logo_cloud_items_locale_idx" ON "course_pages_blocks_logo_cloud_items" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_logo_cloud_items_image_idx" ON "course_pages_blocks_logo_cloud_items" USING btree ("image_id");
  CREATE INDEX "course_pages_blocks_logo_cloud_order_idx" ON "course_pages_blocks_logo_cloud" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_logo_cloud_parent_id_idx" ON "course_pages_blocks_logo_cloud" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_logo_cloud_path_idx" ON "course_pages_blocks_logo_cloud" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_logo_cloud_locale_idx" ON "course_pages_blocks_logo_cloud" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_content_section_order_idx" ON "course_pages_blocks_content_section" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_content_section_parent_id_idx" ON "course_pages_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_content_section_path_idx" ON "course_pages_blocks_content_section" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_content_section_locale_idx" ON "course_pages_blocks_content_section" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_content_section_image_idx" ON "course_pages_blocks_content_section" USING btree ("image_id");
  CREATE INDEX "course_pages_blocks_pricing_table_tiers_features_order_idx" ON "course_pages_blocks_pricing_table_tiers_features" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_pricing_table_tiers_features_parent_id_idx" ON "course_pages_blocks_pricing_table_tiers_features" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_pricing_table_tiers_features_locale_idx" ON "course_pages_blocks_pricing_table_tiers_features" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_pricing_table_tiers_order_idx" ON "course_pages_blocks_pricing_table_tiers" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_pricing_table_tiers_parent_id_idx" ON "course_pages_blocks_pricing_table_tiers" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_pricing_table_tiers_locale_idx" ON "course_pages_blocks_pricing_table_tiers" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_pricing_table_order_idx" ON "course_pages_blocks_pricing_table" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_pricing_table_parent_id_idx" ON "course_pages_blocks_pricing_table" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_pricing_table_path_idx" ON "course_pages_blocks_pricing_table" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_pricing_table_locale_idx" ON "course_pages_blocks_pricing_table" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_team_members_social_links_order_idx" ON "course_pages_blocks_team_members_social_links" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_team_members_social_links_parent_id_idx" ON "course_pages_blocks_team_members_social_links" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_team_members_social_links_locale_idx" ON "course_pages_blocks_team_members_social_links" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_team_members_order_idx" ON "course_pages_blocks_team_members" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_team_members_parent_id_idx" ON "course_pages_blocks_team_members" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_team_members_locale_idx" ON "course_pages_blocks_team_members" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_team_members_photo_idx" ON "course_pages_blocks_team_members" USING btree ("photo_id");
  CREATE INDEX "course_pages_blocks_team_order_idx" ON "course_pages_blocks_team" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_team_parent_id_idx" ON "course_pages_blocks_team" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_team_path_idx" ON "course_pages_blocks_team" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_team_locale_idx" ON "course_pages_blocks_team" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_timeline_items_order_idx" ON "course_pages_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_timeline_items_parent_id_idx" ON "course_pages_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_timeline_items_locale_idx" ON "course_pages_blocks_timeline_items" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_timeline_order_idx" ON "course_pages_blocks_timeline" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_timeline_parent_id_idx" ON "course_pages_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_timeline_path_idx" ON "course_pages_blocks_timeline" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_timeline_locale_idx" ON "course_pages_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_gallery_items_order_idx" ON "course_pages_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_gallery_items_parent_id_idx" ON "course_pages_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_gallery_items_locale_idx" ON "course_pages_blocks_gallery_items" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_gallery_items_image_idx" ON "course_pages_blocks_gallery_items" USING btree ("image_id");
  CREATE INDEX "course_pages_blocks_gallery_order_idx" ON "course_pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_gallery_parent_id_idx" ON "course_pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_gallery_path_idx" ON "course_pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_gallery_locale_idx" ON "course_pages_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_newsletter_order_idx" ON "course_pages_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_newsletter_parent_id_idx" ON "course_pages_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_newsletter_path_idx" ON "course_pages_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_newsletter_locale_idx" ON "course_pages_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_contact_channels_order_idx" ON "course_pages_blocks_contact_channels" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_contact_channels_parent_id_idx" ON "course_pages_blocks_contact_channels" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_contact_channels_locale_idx" ON "course_pages_blocks_contact_channels" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_contact_offices_order_idx" ON "course_pages_blocks_contact_offices" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_contact_offices_parent_id_idx" ON "course_pages_blocks_contact_offices" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_contact_offices_locale_idx" ON "course_pages_blocks_contact_offices" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_contact_form_fields_order_idx" ON "course_pages_blocks_contact_form_fields" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_contact_form_fields_parent_id_idx" ON "course_pages_blocks_contact_form_fields" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_contact_form_fields_locale_idx" ON "course_pages_blocks_contact_form_fields" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_contact_order_idx" ON "course_pages_blocks_contact" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_contact_parent_id_idx" ON "course_pages_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_contact_path_idx" ON "course_pages_blocks_contact" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_contact_locale_idx" ON "course_pages_blocks_contact" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_breadcrumb_items_order_idx" ON "course_pages_blocks_breadcrumb_items" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_breadcrumb_items_parent_id_idx" ON "course_pages_blocks_breadcrumb_items" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_breadcrumb_items_locale_idx" ON "course_pages_blocks_breadcrumb_items" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_breadcrumb_order_idx" ON "course_pages_blocks_breadcrumb" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_breadcrumb_parent_id_idx" ON "course_pages_blocks_breadcrumb" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_breadcrumb_path_idx" ON "course_pages_blocks_breadcrumb" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_breadcrumb_locale_idx" ON "course_pages_blocks_breadcrumb" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_tabs_section_panels_order_idx" ON "course_pages_blocks_tabs_section_panels" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_tabs_section_panels_parent_id_idx" ON "course_pages_blocks_tabs_section_panels" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_tabs_section_panels_locale_idx" ON "course_pages_blocks_tabs_section_panels" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_tabs_section_panels_image_idx" ON "course_pages_blocks_tabs_section_panels" USING btree ("image_id");
  CREATE INDEX "course_pages_blocks_tabs_section_order_idx" ON "course_pages_blocks_tabs_section" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_tabs_section_parent_id_idx" ON "course_pages_blocks_tabs_section" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_tabs_section_path_idx" ON "course_pages_blocks_tabs_section" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_tabs_section_locale_idx" ON "course_pages_blocks_tabs_section" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_steps_items_order_idx" ON "course_pages_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_steps_items_parent_id_idx" ON "course_pages_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_steps_items_locale_idx" ON "course_pages_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_steps_items_image_idx" ON "course_pages_blocks_steps_items" USING btree ("image_id");
  CREATE INDEX "course_pages_blocks_steps_order_idx" ON "course_pages_blocks_steps" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_steps_parent_id_idx" ON "course_pages_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_steps_path_idx" ON "course_pages_blocks_steps" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_steps_locale_idx" ON "course_pages_blocks_steps" USING btree ("_locale");
  CREATE INDEX "course_pages_blocks_banner_order_idx" ON "course_pages_blocks_banner" USING btree ("_order");
  CREATE INDEX "course_pages_blocks_banner_parent_id_idx" ON "course_pages_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "course_pages_blocks_banner_path_idx" ON "course_pages_blocks_banner" USING btree ("_path");
  CREATE INDEX "course_pages_blocks_banner_locale_idx" ON "course_pages_blocks_banner" USING btree ("_locale");
  CREATE INDEX "course_pages_seo_keywords_order_idx" ON "course_pages_seo_keywords" USING btree ("_order");
  CREATE INDEX "course_pages_seo_keywords_parent_id_idx" ON "course_pages_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "course_pages_tenant_id_idx" ON "course_pages" USING btree ("tenant_id");
  CREATE INDEX "course_pages_slug_idx" ON "course_pages" USING btree ("slug");
  CREATE INDEX "course_pages_course_idx" ON "course_pages" USING btree ("course_id");
  CREATE INDEX "course_pages_seo_seo_og_image_idx" ON "course_pages" USING btree ("seo_og_image_id");
  CREATE INDEX "course_pages_updated_at_idx" ON "course_pages" USING btree ("updated_at");
  CREATE INDEX "course_pages_created_at_idx" ON "course_pages" USING btree ("created_at");
  CREATE INDEX "course_pages__status_idx" ON "course_pages" USING btree ("_status");
  CREATE UNIQUE INDEX "course_pages_locales_locale_parent_id_unique" ON "course_pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_course_pages_v_blocks_hero_ctas_order_idx" ON "_course_pages_v_blocks_hero_ctas" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_hero_ctas_parent_id_idx" ON "_course_pages_v_blocks_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_hero_ctas_locale_idx" ON "_course_pages_v_blocks_hero_ctas" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_hero_order_idx" ON "_course_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_hero_parent_id_idx" ON "_course_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_hero_path_idx" ON "_course_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_hero_locale_idx" ON "_course_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_hero_image_idx" ON "_course_pages_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_course_pages_v_blocks_header_links_order_idx" ON "_course_pages_v_blocks_header_links" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_header_links_parent_id_idx" ON "_course_pages_v_blocks_header_links" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_header_links_locale_idx" ON "_course_pages_v_blocks_header_links" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_header_order_idx" ON "_course_pages_v_blocks_header" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_header_parent_id_idx" ON "_course_pages_v_blocks_header" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_header_path_idx" ON "_course_pages_v_blocks_header" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_header_locale_idx" ON "_course_pages_v_blocks_header" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_header_logo_idx" ON "_course_pages_v_blocks_header" USING btree ("logo_id");
  CREATE INDEX "_course_pages_v_blocks_footer_columns_links_order_idx" ON "_course_pages_v_blocks_footer_columns_links" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_footer_columns_links_parent_id_idx" ON "_course_pages_v_blocks_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_footer_columns_links_locale_idx" ON "_course_pages_v_blocks_footer_columns_links" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_footer_columns_order_idx" ON "_course_pages_v_blocks_footer_columns" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_footer_columns_parent_id_idx" ON "_course_pages_v_blocks_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_footer_columns_locale_idx" ON "_course_pages_v_blocks_footer_columns" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_footer_social_links_order_idx" ON "_course_pages_v_blocks_footer_social_links" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_footer_social_links_parent_id_idx" ON "_course_pages_v_blocks_footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_footer_social_links_locale_idx" ON "_course_pages_v_blocks_footer_social_links" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_footer_order_idx" ON "_course_pages_v_blocks_footer" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_footer_parent_id_idx" ON "_course_pages_v_blocks_footer" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_footer_path_idx" ON "_course_pages_v_blocks_footer" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_footer_locale_idx" ON "_course_pages_v_blocks_footer" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_footer_logo_idx" ON "_course_pages_v_blocks_footer" USING btree ("logo_id");
  CREATE INDEX "_course_pages_v_blocks_features_grid_items_order_idx" ON "_course_pages_v_blocks_features_grid_items" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_features_grid_items_parent_id_idx" ON "_course_pages_v_blocks_features_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_features_grid_items_locale_idx" ON "_course_pages_v_blocks_features_grid_items" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_features_grid_items_image_idx" ON "_course_pages_v_blocks_features_grid_items" USING btree ("image_id");
  CREATE INDEX "_course_pages_v_blocks_features_grid_order_idx" ON "_course_pages_v_blocks_features_grid" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_features_grid_parent_id_idx" ON "_course_pages_v_blocks_features_grid" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_features_grid_path_idx" ON "_course_pages_v_blocks_features_grid" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_features_grid_locale_idx" ON "_course_pages_v_blocks_features_grid" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_stats_items_order_idx" ON "_course_pages_v_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_stats_items_parent_id_idx" ON "_course_pages_v_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_stats_items_locale_idx" ON "_course_pages_v_blocks_stats_items" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_stats_order_idx" ON "_course_pages_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_stats_parent_id_idx" ON "_course_pages_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_stats_path_idx" ON "_course_pages_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_stats_locale_idx" ON "_course_pages_v_blocks_stats" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_testimonials_items_order_idx" ON "_course_pages_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_testimonials_items_parent_id_idx" ON "_course_pages_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_testimonials_items_locale_idx" ON "_course_pages_v_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_testimonials_items_avatar_idx" ON "_course_pages_v_blocks_testimonials_items" USING btree ("avatar_id");
  CREATE INDEX "_course_pages_v_blocks_testimonials_order_idx" ON "_course_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_testimonials_parent_id_idx" ON "_course_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_testimonials_path_idx" ON "_course_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_testimonials_locale_idx" ON "_course_pages_v_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_cta_ctas_order_idx" ON "_course_pages_v_blocks_cta_ctas" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_cta_ctas_parent_id_idx" ON "_course_pages_v_blocks_cta_ctas" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_cta_ctas_locale_idx" ON "_course_pages_v_blocks_cta_ctas" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_cta_order_idx" ON "_course_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_cta_parent_id_idx" ON "_course_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_cta_path_idx" ON "_course_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_cta_locale_idx" ON "_course_pages_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_faq_items_order_idx" ON "_course_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_faq_items_parent_id_idx" ON "_course_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_faq_items_locale_idx" ON "_course_pages_v_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_faq_order_idx" ON "_course_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_faq_parent_id_idx" ON "_course_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_faq_path_idx" ON "_course_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_faq_locale_idx" ON "_course_pages_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_logo_cloud_items_order_idx" ON "_course_pages_v_blocks_logo_cloud_items" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_logo_cloud_items_parent_id_idx" ON "_course_pages_v_blocks_logo_cloud_items" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_logo_cloud_items_locale_idx" ON "_course_pages_v_blocks_logo_cloud_items" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_logo_cloud_items_image_idx" ON "_course_pages_v_blocks_logo_cloud_items" USING btree ("image_id");
  CREATE INDEX "_course_pages_v_blocks_logo_cloud_order_idx" ON "_course_pages_v_blocks_logo_cloud" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_logo_cloud_parent_id_idx" ON "_course_pages_v_blocks_logo_cloud" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_logo_cloud_path_idx" ON "_course_pages_v_blocks_logo_cloud" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_logo_cloud_locale_idx" ON "_course_pages_v_blocks_logo_cloud" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_content_section_order_idx" ON "_course_pages_v_blocks_content_section" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_content_section_parent_id_idx" ON "_course_pages_v_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_content_section_path_idx" ON "_course_pages_v_blocks_content_section" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_content_section_locale_idx" ON "_course_pages_v_blocks_content_section" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_content_section_image_idx" ON "_course_pages_v_blocks_content_section" USING btree ("image_id");
  CREATE INDEX "_course_pages_v_blocks_pricing_table_tiers_features_order_idx" ON "_course_pages_v_blocks_pricing_table_tiers_features" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_pricing_table_tiers_features_parent_id_idx" ON "_course_pages_v_blocks_pricing_table_tiers_features" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_pricing_table_tiers_features_locale_idx" ON "_course_pages_v_blocks_pricing_table_tiers_features" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_pricing_table_tiers_order_idx" ON "_course_pages_v_blocks_pricing_table_tiers" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_pricing_table_tiers_parent_id_idx" ON "_course_pages_v_blocks_pricing_table_tiers" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_pricing_table_tiers_locale_idx" ON "_course_pages_v_blocks_pricing_table_tiers" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_pricing_table_order_idx" ON "_course_pages_v_blocks_pricing_table" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_pricing_table_parent_id_idx" ON "_course_pages_v_blocks_pricing_table" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_pricing_table_path_idx" ON "_course_pages_v_blocks_pricing_table" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_pricing_table_locale_idx" ON "_course_pages_v_blocks_pricing_table" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_team_members_social_links_order_idx" ON "_course_pages_v_blocks_team_members_social_links" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_team_members_social_links_parent_id_idx" ON "_course_pages_v_blocks_team_members_social_links" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_team_members_social_links_locale_idx" ON "_course_pages_v_blocks_team_members_social_links" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_team_members_order_idx" ON "_course_pages_v_blocks_team_members" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_team_members_parent_id_idx" ON "_course_pages_v_blocks_team_members" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_team_members_locale_idx" ON "_course_pages_v_blocks_team_members" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_team_members_photo_idx" ON "_course_pages_v_blocks_team_members" USING btree ("photo_id");
  CREATE INDEX "_course_pages_v_blocks_team_order_idx" ON "_course_pages_v_blocks_team" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_team_parent_id_idx" ON "_course_pages_v_blocks_team" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_team_path_idx" ON "_course_pages_v_blocks_team" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_team_locale_idx" ON "_course_pages_v_blocks_team" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_timeline_items_order_idx" ON "_course_pages_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_timeline_items_parent_id_idx" ON "_course_pages_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_timeline_items_locale_idx" ON "_course_pages_v_blocks_timeline_items" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_timeline_order_idx" ON "_course_pages_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_timeline_parent_id_idx" ON "_course_pages_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_timeline_path_idx" ON "_course_pages_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_timeline_locale_idx" ON "_course_pages_v_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_gallery_items_order_idx" ON "_course_pages_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_gallery_items_parent_id_idx" ON "_course_pages_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_gallery_items_locale_idx" ON "_course_pages_v_blocks_gallery_items" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_gallery_items_image_idx" ON "_course_pages_v_blocks_gallery_items" USING btree ("image_id");
  CREATE INDEX "_course_pages_v_blocks_gallery_order_idx" ON "_course_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_gallery_parent_id_idx" ON "_course_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_gallery_path_idx" ON "_course_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_gallery_locale_idx" ON "_course_pages_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_newsletter_order_idx" ON "_course_pages_v_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_newsletter_parent_id_idx" ON "_course_pages_v_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_newsletter_path_idx" ON "_course_pages_v_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_newsletter_locale_idx" ON "_course_pages_v_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_contact_channels_order_idx" ON "_course_pages_v_blocks_contact_channels" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_contact_channels_parent_id_idx" ON "_course_pages_v_blocks_contact_channels" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_contact_channels_locale_idx" ON "_course_pages_v_blocks_contact_channels" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_contact_offices_order_idx" ON "_course_pages_v_blocks_contact_offices" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_contact_offices_parent_id_idx" ON "_course_pages_v_blocks_contact_offices" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_contact_offices_locale_idx" ON "_course_pages_v_blocks_contact_offices" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_contact_form_fields_order_idx" ON "_course_pages_v_blocks_contact_form_fields" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_contact_form_fields_parent_id_idx" ON "_course_pages_v_blocks_contact_form_fields" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_contact_form_fields_locale_idx" ON "_course_pages_v_blocks_contact_form_fields" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_contact_order_idx" ON "_course_pages_v_blocks_contact" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_contact_parent_id_idx" ON "_course_pages_v_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_contact_path_idx" ON "_course_pages_v_blocks_contact" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_contact_locale_idx" ON "_course_pages_v_blocks_contact" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_breadcrumb_items_order_idx" ON "_course_pages_v_blocks_breadcrumb_items" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_breadcrumb_items_parent_id_idx" ON "_course_pages_v_blocks_breadcrumb_items" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_breadcrumb_items_locale_idx" ON "_course_pages_v_blocks_breadcrumb_items" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_breadcrumb_order_idx" ON "_course_pages_v_blocks_breadcrumb" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_breadcrumb_parent_id_idx" ON "_course_pages_v_blocks_breadcrumb" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_breadcrumb_path_idx" ON "_course_pages_v_blocks_breadcrumb" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_breadcrumb_locale_idx" ON "_course_pages_v_blocks_breadcrumb" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_tabs_section_panels_order_idx" ON "_course_pages_v_blocks_tabs_section_panels" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_tabs_section_panels_parent_id_idx" ON "_course_pages_v_blocks_tabs_section_panels" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_tabs_section_panels_locale_idx" ON "_course_pages_v_blocks_tabs_section_panels" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_tabs_section_panels_image_idx" ON "_course_pages_v_blocks_tabs_section_panels" USING btree ("image_id");
  CREATE INDEX "_course_pages_v_blocks_tabs_section_order_idx" ON "_course_pages_v_blocks_tabs_section" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_tabs_section_parent_id_idx" ON "_course_pages_v_blocks_tabs_section" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_tabs_section_path_idx" ON "_course_pages_v_blocks_tabs_section" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_tabs_section_locale_idx" ON "_course_pages_v_blocks_tabs_section" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_steps_items_order_idx" ON "_course_pages_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_steps_items_parent_id_idx" ON "_course_pages_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_steps_items_locale_idx" ON "_course_pages_v_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_steps_items_image_idx" ON "_course_pages_v_blocks_steps_items" USING btree ("image_id");
  CREATE INDEX "_course_pages_v_blocks_steps_order_idx" ON "_course_pages_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_steps_parent_id_idx" ON "_course_pages_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_steps_path_idx" ON "_course_pages_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_steps_locale_idx" ON "_course_pages_v_blocks_steps" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_blocks_banner_order_idx" ON "_course_pages_v_blocks_banner" USING btree ("_order");
  CREATE INDEX "_course_pages_v_blocks_banner_parent_id_idx" ON "_course_pages_v_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_blocks_banner_path_idx" ON "_course_pages_v_blocks_banner" USING btree ("_path");
  CREATE INDEX "_course_pages_v_blocks_banner_locale_idx" ON "_course_pages_v_blocks_banner" USING btree ("_locale");
  CREATE INDEX "_course_pages_v_version_seo_keywords_order_idx" ON "_course_pages_v_version_seo_keywords" USING btree ("_order");
  CREATE INDEX "_course_pages_v_version_seo_keywords_parent_id_idx" ON "_course_pages_v_version_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "_course_pages_v_parent_idx" ON "_course_pages_v" USING btree ("parent_id");
  CREATE INDEX "_course_pages_v_version_version_tenant_id_idx" ON "_course_pages_v" USING btree ("version_tenant_id");
  CREATE INDEX "_course_pages_v_version_version_slug_idx" ON "_course_pages_v" USING btree ("version_slug");
  CREATE INDEX "_course_pages_v_version_version_course_idx" ON "_course_pages_v" USING btree ("version_course_id");
  CREATE INDEX "_course_pages_v_version_seo_version_seo_og_image_idx" ON "_course_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_course_pages_v_version_version_updated_at_idx" ON "_course_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_course_pages_v_version_version_created_at_idx" ON "_course_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_course_pages_v_version_version__status_idx" ON "_course_pages_v" USING btree ("version__status");
  CREATE INDEX "_course_pages_v_created_at_idx" ON "_course_pages_v" USING btree ("created_at");
  CREATE INDEX "_course_pages_v_updated_at_idx" ON "_course_pages_v" USING btree ("updated_at");
  CREATE INDEX "_course_pages_v_snapshot_idx" ON "_course_pages_v" USING btree ("snapshot");
  CREATE INDEX "_course_pages_v_published_locale_idx" ON "_course_pages_v" USING btree ("published_locale");
  CREATE INDEX "_course_pages_v_latest_idx" ON "_course_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_course_pages_v_locales_locale_parent_id_unique" ON "_course_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_blocks_hero_ctas_order_idx" ON "posts_blocks_hero_ctas" USING btree ("_order");
  CREATE INDEX "posts_blocks_hero_ctas_parent_id_idx" ON "posts_blocks_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_hero_ctas_locale_idx" ON "posts_blocks_hero_ctas" USING btree ("_locale");
  CREATE INDEX "posts_blocks_hero_order_idx" ON "posts_blocks_hero" USING btree ("_order");
  CREATE INDEX "posts_blocks_hero_parent_id_idx" ON "posts_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_hero_path_idx" ON "posts_blocks_hero" USING btree ("_path");
  CREATE INDEX "posts_blocks_hero_locale_idx" ON "posts_blocks_hero" USING btree ("_locale");
  CREATE INDEX "posts_blocks_hero_image_idx" ON "posts_blocks_hero" USING btree ("image_id");
  CREATE INDEX "posts_blocks_header_links_order_idx" ON "posts_blocks_header_links" USING btree ("_order");
  CREATE INDEX "posts_blocks_header_links_parent_id_idx" ON "posts_blocks_header_links" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_header_links_locale_idx" ON "posts_blocks_header_links" USING btree ("_locale");
  CREATE INDEX "posts_blocks_header_order_idx" ON "posts_blocks_header" USING btree ("_order");
  CREATE INDEX "posts_blocks_header_parent_id_idx" ON "posts_blocks_header" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_header_path_idx" ON "posts_blocks_header" USING btree ("_path");
  CREATE INDEX "posts_blocks_header_locale_idx" ON "posts_blocks_header" USING btree ("_locale");
  CREATE INDEX "posts_blocks_header_logo_idx" ON "posts_blocks_header" USING btree ("logo_id");
  CREATE INDEX "posts_blocks_footer_columns_links_order_idx" ON "posts_blocks_footer_columns_links" USING btree ("_order");
  CREATE INDEX "posts_blocks_footer_columns_links_parent_id_idx" ON "posts_blocks_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_footer_columns_links_locale_idx" ON "posts_blocks_footer_columns_links" USING btree ("_locale");
  CREATE INDEX "posts_blocks_footer_columns_order_idx" ON "posts_blocks_footer_columns" USING btree ("_order");
  CREATE INDEX "posts_blocks_footer_columns_parent_id_idx" ON "posts_blocks_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_footer_columns_locale_idx" ON "posts_blocks_footer_columns" USING btree ("_locale");
  CREATE INDEX "posts_blocks_footer_social_links_order_idx" ON "posts_blocks_footer_social_links" USING btree ("_order");
  CREATE INDEX "posts_blocks_footer_social_links_parent_id_idx" ON "posts_blocks_footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_footer_social_links_locale_idx" ON "posts_blocks_footer_social_links" USING btree ("_locale");
  CREATE INDEX "posts_blocks_footer_order_idx" ON "posts_blocks_footer" USING btree ("_order");
  CREATE INDEX "posts_blocks_footer_parent_id_idx" ON "posts_blocks_footer" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_footer_path_idx" ON "posts_blocks_footer" USING btree ("_path");
  CREATE INDEX "posts_blocks_footer_locale_idx" ON "posts_blocks_footer" USING btree ("_locale");
  CREATE INDEX "posts_blocks_footer_logo_idx" ON "posts_blocks_footer" USING btree ("logo_id");
  CREATE INDEX "posts_blocks_features_grid_items_order_idx" ON "posts_blocks_features_grid_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_features_grid_items_parent_id_idx" ON "posts_blocks_features_grid_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_features_grid_items_locale_idx" ON "posts_blocks_features_grid_items" USING btree ("_locale");
  CREATE INDEX "posts_blocks_features_grid_items_image_idx" ON "posts_blocks_features_grid_items" USING btree ("image_id");
  CREATE INDEX "posts_blocks_features_grid_order_idx" ON "posts_blocks_features_grid" USING btree ("_order");
  CREATE INDEX "posts_blocks_features_grid_parent_id_idx" ON "posts_blocks_features_grid" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_features_grid_path_idx" ON "posts_blocks_features_grid" USING btree ("_path");
  CREATE INDEX "posts_blocks_features_grid_locale_idx" ON "posts_blocks_features_grid" USING btree ("_locale");
  CREATE INDEX "posts_blocks_stats_items_order_idx" ON "posts_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_stats_items_parent_id_idx" ON "posts_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_stats_items_locale_idx" ON "posts_blocks_stats_items" USING btree ("_locale");
  CREATE INDEX "posts_blocks_stats_order_idx" ON "posts_blocks_stats" USING btree ("_order");
  CREATE INDEX "posts_blocks_stats_parent_id_idx" ON "posts_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_stats_path_idx" ON "posts_blocks_stats" USING btree ("_path");
  CREATE INDEX "posts_blocks_stats_locale_idx" ON "posts_blocks_stats" USING btree ("_locale");
  CREATE INDEX "posts_blocks_testimonials_items_order_idx" ON "posts_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_testimonials_items_parent_id_idx" ON "posts_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_testimonials_items_locale_idx" ON "posts_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "posts_blocks_testimonials_items_avatar_idx" ON "posts_blocks_testimonials_items" USING btree ("avatar_id");
  CREATE INDEX "posts_blocks_testimonials_order_idx" ON "posts_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "posts_blocks_testimonials_parent_id_idx" ON "posts_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_testimonials_path_idx" ON "posts_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "posts_blocks_testimonials_locale_idx" ON "posts_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "posts_blocks_cta_ctas_order_idx" ON "posts_blocks_cta_ctas" USING btree ("_order");
  CREATE INDEX "posts_blocks_cta_ctas_parent_id_idx" ON "posts_blocks_cta_ctas" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_cta_ctas_locale_idx" ON "posts_blocks_cta_ctas" USING btree ("_locale");
  CREATE INDEX "posts_blocks_cta_order_idx" ON "posts_blocks_cta" USING btree ("_order");
  CREATE INDEX "posts_blocks_cta_parent_id_idx" ON "posts_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_cta_path_idx" ON "posts_blocks_cta" USING btree ("_path");
  CREATE INDEX "posts_blocks_cta_locale_idx" ON "posts_blocks_cta" USING btree ("_locale");
  CREATE INDEX "posts_blocks_faq_items_order_idx" ON "posts_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_faq_items_parent_id_idx" ON "posts_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_faq_items_locale_idx" ON "posts_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "posts_blocks_faq_order_idx" ON "posts_blocks_faq" USING btree ("_order");
  CREATE INDEX "posts_blocks_faq_parent_id_idx" ON "posts_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_faq_path_idx" ON "posts_blocks_faq" USING btree ("_path");
  CREATE INDEX "posts_blocks_faq_locale_idx" ON "posts_blocks_faq" USING btree ("_locale");
  CREATE INDEX "posts_blocks_logo_cloud_items_order_idx" ON "posts_blocks_logo_cloud_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_logo_cloud_items_parent_id_idx" ON "posts_blocks_logo_cloud_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_logo_cloud_items_locale_idx" ON "posts_blocks_logo_cloud_items" USING btree ("_locale");
  CREATE INDEX "posts_blocks_logo_cloud_items_image_idx" ON "posts_blocks_logo_cloud_items" USING btree ("image_id");
  CREATE INDEX "posts_blocks_logo_cloud_order_idx" ON "posts_blocks_logo_cloud" USING btree ("_order");
  CREATE INDEX "posts_blocks_logo_cloud_parent_id_idx" ON "posts_blocks_logo_cloud" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_logo_cloud_path_idx" ON "posts_blocks_logo_cloud" USING btree ("_path");
  CREATE INDEX "posts_blocks_logo_cloud_locale_idx" ON "posts_blocks_logo_cloud" USING btree ("_locale");
  CREATE INDEX "posts_blocks_content_section_order_idx" ON "posts_blocks_content_section" USING btree ("_order");
  CREATE INDEX "posts_blocks_content_section_parent_id_idx" ON "posts_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_content_section_path_idx" ON "posts_blocks_content_section" USING btree ("_path");
  CREATE INDEX "posts_blocks_content_section_locale_idx" ON "posts_blocks_content_section" USING btree ("_locale");
  CREATE INDEX "posts_blocks_content_section_image_idx" ON "posts_blocks_content_section" USING btree ("image_id");
  CREATE INDEX "posts_blocks_pricing_table_tiers_features_order_idx" ON "posts_blocks_pricing_table_tiers_features" USING btree ("_order");
  CREATE INDEX "posts_blocks_pricing_table_tiers_features_parent_id_idx" ON "posts_blocks_pricing_table_tiers_features" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_pricing_table_tiers_features_locale_idx" ON "posts_blocks_pricing_table_tiers_features" USING btree ("_locale");
  CREATE INDEX "posts_blocks_pricing_table_tiers_order_idx" ON "posts_blocks_pricing_table_tiers" USING btree ("_order");
  CREATE INDEX "posts_blocks_pricing_table_tiers_parent_id_idx" ON "posts_blocks_pricing_table_tiers" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_pricing_table_tiers_locale_idx" ON "posts_blocks_pricing_table_tiers" USING btree ("_locale");
  CREATE INDEX "posts_blocks_pricing_table_order_idx" ON "posts_blocks_pricing_table" USING btree ("_order");
  CREATE INDEX "posts_blocks_pricing_table_parent_id_idx" ON "posts_blocks_pricing_table" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_pricing_table_path_idx" ON "posts_blocks_pricing_table" USING btree ("_path");
  CREATE INDEX "posts_blocks_pricing_table_locale_idx" ON "posts_blocks_pricing_table" USING btree ("_locale");
  CREATE INDEX "posts_blocks_team_members_social_links_order_idx" ON "posts_blocks_team_members_social_links" USING btree ("_order");
  CREATE INDEX "posts_blocks_team_members_social_links_parent_id_idx" ON "posts_blocks_team_members_social_links" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_team_members_social_links_locale_idx" ON "posts_blocks_team_members_social_links" USING btree ("_locale");
  CREATE INDEX "posts_blocks_team_members_order_idx" ON "posts_blocks_team_members" USING btree ("_order");
  CREATE INDEX "posts_blocks_team_members_parent_id_idx" ON "posts_blocks_team_members" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_team_members_locale_idx" ON "posts_blocks_team_members" USING btree ("_locale");
  CREATE INDEX "posts_blocks_team_members_photo_idx" ON "posts_blocks_team_members" USING btree ("photo_id");
  CREATE INDEX "posts_blocks_team_order_idx" ON "posts_blocks_team" USING btree ("_order");
  CREATE INDEX "posts_blocks_team_parent_id_idx" ON "posts_blocks_team" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_team_path_idx" ON "posts_blocks_team" USING btree ("_path");
  CREATE INDEX "posts_blocks_team_locale_idx" ON "posts_blocks_team" USING btree ("_locale");
  CREATE INDEX "posts_blocks_timeline_items_order_idx" ON "posts_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_timeline_items_parent_id_idx" ON "posts_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_timeline_items_locale_idx" ON "posts_blocks_timeline_items" USING btree ("_locale");
  CREATE INDEX "posts_blocks_timeline_order_idx" ON "posts_blocks_timeline" USING btree ("_order");
  CREATE INDEX "posts_blocks_timeline_parent_id_idx" ON "posts_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_timeline_path_idx" ON "posts_blocks_timeline" USING btree ("_path");
  CREATE INDEX "posts_blocks_timeline_locale_idx" ON "posts_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "posts_blocks_gallery_items_order_idx" ON "posts_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_gallery_items_parent_id_idx" ON "posts_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_gallery_items_locale_idx" ON "posts_blocks_gallery_items" USING btree ("_locale");
  CREATE INDEX "posts_blocks_gallery_items_image_idx" ON "posts_blocks_gallery_items" USING btree ("image_id");
  CREATE INDEX "posts_blocks_gallery_order_idx" ON "posts_blocks_gallery" USING btree ("_order");
  CREATE INDEX "posts_blocks_gallery_parent_id_idx" ON "posts_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_gallery_path_idx" ON "posts_blocks_gallery" USING btree ("_path");
  CREATE INDEX "posts_blocks_gallery_locale_idx" ON "posts_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "posts_blocks_newsletter_order_idx" ON "posts_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "posts_blocks_newsletter_parent_id_idx" ON "posts_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_newsletter_path_idx" ON "posts_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "posts_blocks_newsletter_locale_idx" ON "posts_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "posts_blocks_contact_channels_order_idx" ON "posts_blocks_contact_channels" USING btree ("_order");
  CREATE INDEX "posts_blocks_contact_channels_parent_id_idx" ON "posts_blocks_contact_channels" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_contact_channels_locale_idx" ON "posts_blocks_contact_channels" USING btree ("_locale");
  CREATE INDEX "posts_blocks_contact_offices_order_idx" ON "posts_blocks_contact_offices" USING btree ("_order");
  CREATE INDEX "posts_blocks_contact_offices_parent_id_idx" ON "posts_blocks_contact_offices" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_contact_offices_locale_idx" ON "posts_blocks_contact_offices" USING btree ("_locale");
  CREATE INDEX "posts_blocks_contact_form_fields_order_idx" ON "posts_blocks_contact_form_fields" USING btree ("_order");
  CREATE INDEX "posts_blocks_contact_form_fields_parent_id_idx" ON "posts_blocks_contact_form_fields" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_contact_form_fields_locale_idx" ON "posts_blocks_contact_form_fields" USING btree ("_locale");
  CREATE INDEX "posts_blocks_contact_order_idx" ON "posts_blocks_contact" USING btree ("_order");
  CREATE INDEX "posts_blocks_contact_parent_id_idx" ON "posts_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_contact_path_idx" ON "posts_blocks_contact" USING btree ("_path");
  CREATE INDEX "posts_blocks_contact_locale_idx" ON "posts_blocks_contact" USING btree ("_locale");
  CREATE INDEX "posts_blocks_breadcrumb_items_order_idx" ON "posts_blocks_breadcrumb_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_breadcrumb_items_parent_id_idx" ON "posts_blocks_breadcrumb_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_breadcrumb_items_locale_idx" ON "posts_blocks_breadcrumb_items" USING btree ("_locale");
  CREATE INDEX "posts_blocks_breadcrumb_order_idx" ON "posts_blocks_breadcrumb" USING btree ("_order");
  CREATE INDEX "posts_blocks_breadcrumb_parent_id_idx" ON "posts_blocks_breadcrumb" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_breadcrumb_path_idx" ON "posts_blocks_breadcrumb" USING btree ("_path");
  CREATE INDEX "posts_blocks_breadcrumb_locale_idx" ON "posts_blocks_breadcrumb" USING btree ("_locale");
  CREATE INDEX "posts_blocks_tabs_section_panels_order_idx" ON "posts_blocks_tabs_section_panels" USING btree ("_order");
  CREATE INDEX "posts_blocks_tabs_section_panels_parent_id_idx" ON "posts_blocks_tabs_section_panels" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_tabs_section_panels_locale_idx" ON "posts_blocks_tabs_section_panels" USING btree ("_locale");
  CREATE INDEX "posts_blocks_tabs_section_panels_image_idx" ON "posts_blocks_tabs_section_panels" USING btree ("image_id");
  CREATE INDEX "posts_blocks_tabs_section_order_idx" ON "posts_blocks_tabs_section" USING btree ("_order");
  CREATE INDEX "posts_blocks_tabs_section_parent_id_idx" ON "posts_blocks_tabs_section" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_tabs_section_path_idx" ON "posts_blocks_tabs_section" USING btree ("_path");
  CREATE INDEX "posts_blocks_tabs_section_locale_idx" ON "posts_blocks_tabs_section" USING btree ("_locale");
  CREATE INDEX "posts_blocks_steps_items_order_idx" ON "posts_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_steps_items_parent_id_idx" ON "posts_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_steps_items_locale_idx" ON "posts_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "posts_blocks_steps_items_image_idx" ON "posts_blocks_steps_items" USING btree ("image_id");
  CREATE INDEX "posts_blocks_steps_order_idx" ON "posts_blocks_steps" USING btree ("_order");
  CREATE INDEX "posts_blocks_steps_parent_id_idx" ON "posts_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_steps_path_idx" ON "posts_blocks_steps" USING btree ("_path");
  CREATE INDEX "posts_blocks_steps_locale_idx" ON "posts_blocks_steps" USING btree ("_locale");
  CREATE INDEX "posts_blocks_banner_order_idx" ON "posts_blocks_banner" USING btree ("_order");
  CREATE INDEX "posts_blocks_banner_parent_id_idx" ON "posts_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_banner_path_idx" ON "posts_blocks_banner" USING btree ("_path");
  CREATE INDEX "posts_blocks_banner_locale_idx" ON "posts_blocks_banner" USING btree ("_locale");
  CREATE INDEX "posts_seo_keywords_order_idx" ON "posts_seo_keywords" USING btree ("_order");
  CREATE INDEX "posts_seo_keywords_parent_id_idx" ON "posts_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "posts_tenant_id_idx" ON "posts" USING btree ("tenant_id");
  CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_featured_image_idx" ON "posts" USING btree ("featured_image_id");
  CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE INDEX "posts_series_idx" ON "posts" USING btree ("series_id");
  CREATE INDEX "posts_seo_seo_og_image_idx" ON "posts" USING btree ("seo_og_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_tags_id_idx" ON "posts_rels" USING btree ("tags_id");
  CREATE INDEX "posts_rels_authors_id_idx" ON "posts_rels" USING btree ("authors_id");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_blocks_hero_ctas_order_idx" ON "_posts_v_blocks_hero_ctas" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_hero_ctas_parent_id_idx" ON "_posts_v_blocks_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_hero_ctas_locale_idx" ON "_posts_v_blocks_hero_ctas" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_hero_order_idx" ON "_posts_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_hero_parent_id_idx" ON "_posts_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_hero_path_idx" ON "_posts_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_hero_locale_idx" ON "_posts_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_hero_image_idx" ON "_posts_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_posts_v_blocks_header_links_order_idx" ON "_posts_v_blocks_header_links" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_header_links_parent_id_idx" ON "_posts_v_blocks_header_links" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_header_links_locale_idx" ON "_posts_v_blocks_header_links" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_header_order_idx" ON "_posts_v_blocks_header" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_header_parent_id_idx" ON "_posts_v_blocks_header" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_header_path_idx" ON "_posts_v_blocks_header" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_header_locale_idx" ON "_posts_v_blocks_header" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_header_logo_idx" ON "_posts_v_blocks_header" USING btree ("logo_id");
  CREATE INDEX "_posts_v_blocks_footer_columns_links_order_idx" ON "_posts_v_blocks_footer_columns_links" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_footer_columns_links_parent_id_idx" ON "_posts_v_blocks_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_footer_columns_links_locale_idx" ON "_posts_v_blocks_footer_columns_links" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_footer_columns_order_idx" ON "_posts_v_blocks_footer_columns" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_footer_columns_parent_id_idx" ON "_posts_v_blocks_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_footer_columns_locale_idx" ON "_posts_v_blocks_footer_columns" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_footer_social_links_order_idx" ON "_posts_v_blocks_footer_social_links" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_footer_social_links_parent_id_idx" ON "_posts_v_blocks_footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_footer_social_links_locale_idx" ON "_posts_v_blocks_footer_social_links" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_footer_order_idx" ON "_posts_v_blocks_footer" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_footer_parent_id_idx" ON "_posts_v_blocks_footer" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_footer_path_idx" ON "_posts_v_blocks_footer" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_footer_locale_idx" ON "_posts_v_blocks_footer" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_footer_logo_idx" ON "_posts_v_blocks_footer" USING btree ("logo_id");
  CREATE INDEX "_posts_v_blocks_features_grid_items_order_idx" ON "_posts_v_blocks_features_grid_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_features_grid_items_parent_id_idx" ON "_posts_v_blocks_features_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_features_grid_items_locale_idx" ON "_posts_v_blocks_features_grid_items" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_features_grid_items_image_idx" ON "_posts_v_blocks_features_grid_items" USING btree ("image_id");
  CREATE INDEX "_posts_v_blocks_features_grid_order_idx" ON "_posts_v_blocks_features_grid" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_features_grid_parent_id_idx" ON "_posts_v_blocks_features_grid" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_features_grid_path_idx" ON "_posts_v_blocks_features_grid" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_features_grid_locale_idx" ON "_posts_v_blocks_features_grid" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_stats_items_order_idx" ON "_posts_v_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_stats_items_parent_id_idx" ON "_posts_v_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_stats_items_locale_idx" ON "_posts_v_blocks_stats_items" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_stats_order_idx" ON "_posts_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_stats_parent_id_idx" ON "_posts_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_stats_path_idx" ON "_posts_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_stats_locale_idx" ON "_posts_v_blocks_stats" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_testimonials_items_order_idx" ON "_posts_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_testimonials_items_parent_id_idx" ON "_posts_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_testimonials_items_locale_idx" ON "_posts_v_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_testimonials_items_avatar_idx" ON "_posts_v_blocks_testimonials_items" USING btree ("avatar_id");
  CREATE INDEX "_posts_v_blocks_testimonials_order_idx" ON "_posts_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_testimonials_parent_id_idx" ON "_posts_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_testimonials_path_idx" ON "_posts_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_testimonials_locale_idx" ON "_posts_v_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_cta_ctas_order_idx" ON "_posts_v_blocks_cta_ctas" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_cta_ctas_parent_id_idx" ON "_posts_v_blocks_cta_ctas" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_cta_ctas_locale_idx" ON "_posts_v_blocks_cta_ctas" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_cta_order_idx" ON "_posts_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_cta_parent_id_idx" ON "_posts_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_cta_path_idx" ON "_posts_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_cta_locale_idx" ON "_posts_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_faq_items_order_idx" ON "_posts_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_faq_items_parent_id_idx" ON "_posts_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_faq_items_locale_idx" ON "_posts_v_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_faq_order_idx" ON "_posts_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_faq_parent_id_idx" ON "_posts_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_faq_path_idx" ON "_posts_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_faq_locale_idx" ON "_posts_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_logo_cloud_items_order_idx" ON "_posts_v_blocks_logo_cloud_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_logo_cloud_items_parent_id_idx" ON "_posts_v_blocks_logo_cloud_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_logo_cloud_items_locale_idx" ON "_posts_v_blocks_logo_cloud_items" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_logo_cloud_items_image_idx" ON "_posts_v_blocks_logo_cloud_items" USING btree ("image_id");
  CREATE INDEX "_posts_v_blocks_logo_cloud_order_idx" ON "_posts_v_blocks_logo_cloud" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_logo_cloud_parent_id_idx" ON "_posts_v_blocks_logo_cloud" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_logo_cloud_path_idx" ON "_posts_v_blocks_logo_cloud" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_logo_cloud_locale_idx" ON "_posts_v_blocks_logo_cloud" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_content_section_order_idx" ON "_posts_v_blocks_content_section" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_content_section_parent_id_idx" ON "_posts_v_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_content_section_path_idx" ON "_posts_v_blocks_content_section" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_content_section_locale_idx" ON "_posts_v_blocks_content_section" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_content_section_image_idx" ON "_posts_v_blocks_content_section" USING btree ("image_id");
  CREATE INDEX "_posts_v_blocks_pricing_table_tiers_features_order_idx" ON "_posts_v_blocks_pricing_table_tiers_features" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_pricing_table_tiers_features_parent_id_idx" ON "_posts_v_blocks_pricing_table_tiers_features" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_pricing_table_tiers_features_locale_idx" ON "_posts_v_blocks_pricing_table_tiers_features" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_pricing_table_tiers_order_idx" ON "_posts_v_blocks_pricing_table_tiers" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_pricing_table_tiers_parent_id_idx" ON "_posts_v_blocks_pricing_table_tiers" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_pricing_table_tiers_locale_idx" ON "_posts_v_blocks_pricing_table_tiers" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_pricing_table_order_idx" ON "_posts_v_blocks_pricing_table" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_pricing_table_parent_id_idx" ON "_posts_v_blocks_pricing_table" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_pricing_table_path_idx" ON "_posts_v_blocks_pricing_table" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_pricing_table_locale_idx" ON "_posts_v_blocks_pricing_table" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_team_members_social_links_order_idx" ON "_posts_v_blocks_team_members_social_links" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_team_members_social_links_parent_id_idx" ON "_posts_v_blocks_team_members_social_links" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_team_members_social_links_locale_idx" ON "_posts_v_blocks_team_members_social_links" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_team_members_order_idx" ON "_posts_v_blocks_team_members" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_team_members_parent_id_idx" ON "_posts_v_blocks_team_members" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_team_members_locale_idx" ON "_posts_v_blocks_team_members" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_team_members_photo_idx" ON "_posts_v_blocks_team_members" USING btree ("photo_id");
  CREATE INDEX "_posts_v_blocks_team_order_idx" ON "_posts_v_blocks_team" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_team_parent_id_idx" ON "_posts_v_blocks_team" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_team_path_idx" ON "_posts_v_blocks_team" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_team_locale_idx" ON "_posts_v_blocks_team" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_timeline_items_order_idx" ON "_posts_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_timeline_items_parent_id_idx" ON "_posts_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_timeline_items_locale_idx" ON "_posts_v_blocks_timeline_items" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_timeline_order_idx" ON "_posts_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_timeline_parent_id_idx" ON "_posts_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_timeline_path_idx" ON "_posts_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_timeline_locale_idx" ON "_posts_v_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_gallery_items_order_idx" ON "_posts_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_gallery_items_parent_id_idx" ON "_posts_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_gallery_items_locale_idx" ON "_posts_v_blocks_gallery_items" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_gallery_items_image_idx" ON "_posts_v_blocks_gallery_items" USING btree ("image_id");
  CREATE INDEX "_posts_v_blocks_gallery_order_idx" ON "_posts_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_gallery_parent_id_idx" ON "_posts_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_gallery_path_idx" ON "_posts_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_gallery_locale_idx" ON "_posts_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_newsletter_order_idx" ON "_posts_v_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_newsletter_parent_id_idx" ON "_posts_v_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_newsletter_path_idx" ON "_posts_v_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_newsletter_locale_idx" ON "_posts_v_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_contact_channels_order_idx" ON "_posts_v_blocks_contact_channels" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_contact_channels_parent_id_idx" ON "_posts_v_blocks_contact_channels" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_contact_channels_locale_idx" ON "_posts_v_blocks_contact_channels" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_contact_offices_order_idx" ON "_posts_v_blocks_contact_offices" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_contact_offices_parent_id_idx" ON "_posts_v_blocks_contact_offices" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_contact_offices_locale_idx" ON "_posts_v_blocks_contact_offices" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_contact_form_fields_order_idx" ON "_posts_v_blocks_contact_form_fields" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_contact_form_fields_parent_id_idx" ON "_posts_v_blocks_contact_form_fields" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_contact_form_fields_locale_idx" ON "_posts_v_blocks_contact_form_fields" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_contact_order_idx" ON "_posts_v_blocks_contact" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_contact_parent_id_idx" ON "_posts_v_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_contact_path_idx" ON "_posts_v_blocks_contact" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_contact_locale_idx" ON "_posts_v_blocks_contact" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_breadcrumb_items_order_idx" ON "_posts_v_blocks_breadcrumb_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_breadcrumb_items_parent_id_idx" ON "_posts_v_blocks_breadcrumb_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_breadcrumb_items_locale_idx" ON "_posts_v_blocks_breadcrumb_items" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_breadcrumb_order_idx" ON "_posts_v_blocks_breadcrumb" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_breadcrumb_parent_id_idx" ON "_posts_v_blocks_breadcrumb" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_breadcrumb_path_idx" ON "_posts_v_blocks_breadcrumb" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_breadcrumb_locale_idx" ON "_posts_v_blocks_breadcrumb" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_tabs_section_panels_order_idx" ON "_posts_v_blocks_tabs_section_panels" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_tabs_section_panels_parent_id_idx" ON "_posts_v_blocks_tabs_section_panels" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_tabs_section_panels_locale_idx" ON "_posts_v_blocks_tabs_section_panels" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_tabs_section_panels_image_idx" ON "_posts_v_blocks_tabs_section_panels" USING btree ("image_id");
  CREATE INDEX "_posts_v_blocks_tabs_section_order_idx" ON "_posts_v_blocks_tabs_section" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_tabs_section_parent_id_idx" ON "_posts_v_blocks_tabs_section" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_tabs_section_path_idx" ON "_posts_v_blocks_tabs_section" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_tabs_section_locale_idx" ON "_posts_v_blocks_tabs_section" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_steps_items_order_idx" ON "_posts_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_steps_items_parent_id_idx" ON "_posts_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_steps_items_locale_idx" ON "_posts_v_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_steps_items_image_idx" ON "_posts_v_blocks_steps_items" USING btree ("image_id");
  CREATE INDEX "_posts_v_blocks_steps_order_idx" ON "_posts_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_steps_parent_id_idx" ON "_posts_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_steps_path_idx" ON "_posts_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_steps_locale_idx" ON "_posts_v_blocks_steps" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_banner_order_idx" ON "_posts_v_blocks_banner" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_banner_parent_id_idx" ON "_posts_v_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_banner_path_idx" ON "_posts_v_blocks_banner" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_banner_locale_idx" ON "_posts_v_blocks_banner" USING btree ("_locale");
  CREATE INDEX "_posts_v_version_seo_keywords_order_idx" ON "_posts_v_version_seo_keywords" USING btree ("_order");
  CREATE INDEX "_posts_v_version_seo_keywords_parent_id_idx" ON "_posts_v_version_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_tenant_id_idx" ON "_posts_v" USING btree ("version_tenant_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_featured_image_idx" ON "_posts_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_posts_v_version_version_category_idx" ON "_posts_v" USING btree ("version_category_id");
  CREATE INDEX "_posts_v_version_version_author_idx" ON "_posts_v" USING btree ("version_author_id");
  CREATE INDEX "_posts_v_version_version_series_idx" ON "_posts_v" USING btree ("version_series_id");
  CREATE INDEX "_posts_v_version_seo_version_seo_og_image_idx" ON "_posts_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_tags_id_idx" ON "_posts_v_rels" USING btree ("tags_id");
  CREATE INDEX "_posts_v_rels_authors_id_idx" ON "_posts_v_rels" USING btree ("authors_id");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE INDEX "forms_tenant_id_idx" ON "forms" USING btree ("tenant_id");
  CREATE INDEX "forms_slug_idx" ON "forms" USING btree ("slug");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE INDEX "form_submissions_spam_reasons_order_idx" ON "form_submissions_spam_reasons" USING btree ("_order");
  CREATE INDEX "form_submissions_spam_reasons_parent_id_idx" ON "form_submissions_spam_reasons" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_tenant_id_idx" ON "form_submissions" USING btree ("tenant_id");
  CREATE INDEX "form_submissions_form_id_idx" ON "form_submissions" USING btree ("form_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "faq_categories_tenant_id_idx" ON "faq_categories" USING btree ("tenant_id");
  CREATE INDEX "faq_categories_slug_idx" ON "faq_categories" USING btree ("slug");
  CREATE INDEX "faq_categories_updated_at_idx" ON "faq_categories" USING btree ("updated_at");
  CREATE INDEX "faq_categories_created_at_idx" ON "faq_categories" USING btree ("created_at");
  CREATE INDEX "faq_items_tenant_id_idx" ON "faq_items" USING btree ("tenant_id");
  CREATE INDEX "faq_items_category_idx" ON "faq_items" USING btree ("category_id");
  CREATE INDEX "faq_items_updated_at_idx" ON "faq_items" USING btree ("updated_at");
  CREATE INDEX "faq_items_created_at_idx" ON "faq_items" USING btree ("created_at");
  CREATE INDEX "comments_spam_reasons_order_idx" ON "comments_spam_reasons" USING btree ("_order");
  CREATE INDEX "comments_spam_reasons_parent_id_idx" ON "comments_spam_reasons" USING btree ("_parent_id");
  CREATE INDEX "comments_tenant_id_idx" ON "comments" USING btree ("tenant_id");
  CREATE INDEX "comments_post_id_idx" ON "comments" USING btree ("post_id");
  CREATE INDEX "comments_updated_at_idx" ON "comments" USING btree ("updated_at");
  CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");
  CREATE INDEX "cta_blocks_tenant_id_idx" ON "cta_blocks" USING btree ("tenant_id");
  CREATE INDEX "cta_blocks_updated_at_idx" ON "cta_blocks" USING btree ("updated_at");
  CREATE INDEX "cta_blocks_created_at_idx" ON "cta_blocks" USING btree ("created_at");
  CREATE INDEX "cta_blocks_rels_order_idx" ON "cta_blocks_rels" USING btree ("order");
  CREATE INDEX "cta_blocks_rels_parent_idx" ON "cta_blocks_rels" USING btree ("parent_id");
  CREATE INDEX "cta_blocks_rels_path_idx" ON "cta_blocks_rels" USING btree ("path");
  CREATE INDEX "cta_blocks_rels_categories_id_idx" ON "cta_blocks_rels" USING btree ("categories_id");
  CREATE INDEX "cta_blocks_rels_tags_id_idx" ON "cta_blocks_rels" USING btree ("tags_id");
  CREATE INDEX "lead_magnets_tenant_id_idx" ON "lead_magnets" USING btree ("tenant_id");
  CREATE INDEX "lead_magnets_slug_idx" ON "lead_magnets" USING btree ("slug");
  CREATE INDEX "lead_magnets_updated_at_idx" ON "lead_magnets" USING btree ("updated_at");
  CREATE INDEX "lead_magnets_created_at_idx" ON "lead_magnets" USING btree ("created_at");
  CREATE INDEX "lead_captures_tenant_id_idx" ON "lead_captures" USING btree ("tenant_id");
  CREATE INDEX "lead_captures_magnet_id_idx" ON "lead_captures" USING btree ("magnet_id");
  CREATE INDEX "lead_captures_updated_at_idx" ON "lead_captures" USING btree ("updated_at");
  CREATE INDEX "lead_captures_created_at_idx" ON "lead_captures" USING btree ("created_at");
  CREATE INDEX "newsletter_subscribers_tenant_id_idx" ON "newsletter_subscribers" USING btree ("tenant_id");
  CREATE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");
  CREATE INDEX "newsletter_subscribers_updated_at_idx" ON "newsletter_subscribers" USING btree ("updated_at");
  CREATE INDEX "newsletter_subscribers_created_at_idx" ON "newsletter_subscribers" USING btree ("created_at");
  CREATE INDEX "marketing_click_events_tenant_id_idx" ON "marketing_click_events" USING btree ("tenant_id");
  CREATE INDEX "marketing_click_events_entity_id_idx" ON "marketing_click_events" USING btree ("entity_id");
  CREATE INDEX "marketing_click_events_post_id_idx" ON "marketing_click_events" USING btree ("post_id");
  CREATE INDEX "marketing_click_events_updated_at_idx" ON "marketing_click_events" USING btree ("updated_at");
  CREATE INDEX "marketing_click_events_created_at_idx" ON "marketing_click_events" USING btree ("created_at");
  CREATE INDEX "broken_links_tenant_id_idx" ON "broken_links" USING btree ("tenant_id");
  CREATE INDEX "broken_links_updated_at_idx" ON "broken_links" USING btree ("updated_at");
  CREATE INDEX "broken_links_created_at_idx" ON "broken_links" USING btree ("created_at");
  CREATE INDEX "user_credentials_user_idx" ON "user_credentials" USING btree ("user_id");
  CREATE UNIQUE INDEX "user_credentials_credential_id_idx" ON "user_credentials" USING btree ("credential_id");
  CREATE INDEX "user_credentials_updated_at_idx" ON "user_credentials" USING btree ("updated_at");
  CREATE INDEX "user_credentials_created_at_idx" ON "user_credentials" USING btree ("created_at");
  CREATE INDEX "workflow_executions_workflow_id_idx" ON "workflow_executions" USING btree ("workflow_id");
  CREATE INDEX "workflow_executions_project_id_idx" ON "workflow_executions" USING btree ("project_id");
  CREATE INDEX "workflow_executions_status_idx" ON "workflow_executions" USING btree ("status");
  CREATE INDEX "workflow_executions_updated_at_idx" ON "workflow_executions" USING btree ("updated_at");
  CREATE INDEX "workflow_executions_created_at_idx" ON "workflow_executions" USING btree ("created_at");
  CREATE INDEX "workflow_registry_workflow_id_idx" ON "workflow_registry" USING btree ("workflow_id");
  CREATE INDEX "workflow_registry_project_id_idx" ON "workflow_registry" USING btree ("project_id");
  CREATE INDEX "workflow_registry_updated_at_idx" ON "workflow_registry" USING btree ("updated_at");
  CREATE INDEX "workflow_registry_created_at_idx" ON "workflow_registry" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_post_series_id_idx" ON "payload_locked_documents_rels" USING btree ("post_series_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_course_chapters_id_idx" ON "payload_locked_documents_rels" USING btree ("course_chapters_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_shop_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("shop_pages_id");
  CREATE INDEX "payload_locked_documents_rels_course_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("course_pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_faq_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("faq_categories_id");
  CREATE INDEX "payload_locked_documents_rels_faq_items_id_idx" ON "payload_locked_documents_rels" USING btree ("faq_items_id");
  CREATE INDEX "payload_locked_documents_rels_comments_id_idx" ON "payload_locked_documents_rels" USING btree ("comments_id");
  CREATE INDEX "payload_locked_documents_rels_cta_blocks_id_idx" ON "payload_locked_documents_rels" USING btree ("cta_blocks_id");
  CREATE INDEX "payload_locked_documents_rels_lead_magnets_id_idx" ON "payload_locked_documents_rels" USING btree ("lead_magnets_id");
  CREATE INDEX "payload_locked_documents_rels_lead_captures_id_idx" ON "payload_locked_documents_rels" USING btree ("lead_captures_id");
  CREATE INDEX "payload_locked_documents_rels_newsletter_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_marketing_click_events_id_idx" ON "payload_locked_documents_rels" USING btree ("marketing_click_events_id");
  CREATE INDEX "payload_locked_documents_rels_broken_links_id_idx" ON "payload_locked_documents_rels" USING btree ("broken_links_id");
  CREATE INDEX "payload_locked_documents_rels_user_credentials_id_idx" ON "payload_locked_documents_rels" USING btree ("user_credentials_id");
  CREATE INDEX "payload_locked_documents_rels_workflow_executions_id_idx" ON "payload_locked_documents_rels" USING btree ("workflow_executions_id");
  CREATE INDEX "payload_locked_documents_rels_workflow_registry_id_idx" ON "payload_locked_documents_rels" USING btree ("workflow_registry_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "authors_social" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "post_series" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "course_chapters" CASCADE;
  DROP TABLE "pages_blocks_hero_ctas" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_header_links" CASCADE;
  DROP TABLE "pages_blocks_header" CASCADE;
  DROP TABLE "pages_blocks_footer_columns_links" CASCADE;
  DROP TABLE "pages_blocks_footer_columns" CASCADE;
  DROP TABLE "pages_blocks_footer_social_links" CASCADE;
  DROP TABLE "pages_blocks_footer" CASCADE;
  DROP TABLE "pages_blocks_features_grid_items" CASCADE;
  DROP TABLE "pages_blocks_features_grid" CASCADE;
  DROP TABLE "pages_blocks_stats_items" CASCADE;
  DROP TABLE "pages_blocks_stats" CASCADE;
  DROP TABLE "pages_blocks_testimonials_items" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_blocks_cta_ctas" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_logo_cloud_items" CASCADE;
  DROP TABLE "pages_blocks_logo_cloud" CASCADE;
  DROP TABLE "pages_blocks_content_section" CASCADE;
  DROP TABLE "pages_blocks_pricing_table_tiers_features" CASCADE;
  DROP TABLE "pages_blocks_pricing_table_tiers" CASCADE;
  DROP TABLE "pages_blocks_pricing_table" CASCADE;
  DROP TABLE "pages_blocks_team_members_social_links" CASCADE;
  DROP TABLE "pages_blocks_team_members" CASCADE;
  DROP TABLE "pages_blocks_team" CASCADE;
  DROP TABLE "pages_blocks_timeline_items" CASCADE;
  DROP TABLE "pages_blocks_timeline" CASCADE;
  DROP TABLE "pages_blocks_gallery_items" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_newsletter" CASCADE;
  DROP TABLE "pages_blocks_contact_channels" CASCADE;
  DROP TABLE "pages_blocks_contact_offices" CASCADE;
  DROP TABLE "pages_blocks_contact_form_fields" CASCADE;
  DROP TABLE "pages_blocks_contact" CASCADE;
  DROP TABLE "pages_blocks_breadcrumb_items" CASCADE;
  DROP TABLE "pages_blocks_breadcrumb" CASCADE;
  DROP TABLE "pages_blocks_tabs_section_panels" CASCADE;
  DROP TABLE "pages_blocks_tabs_section" CASCADE;
  DROP TABLE "pages_blocks_steps_items" CASCADE;
  DROP TABLE "pages_blocks_steps" CASCADE;
  DROP TABLE "pages_blocks_banner" CASCADE;
  DROP TABLE "pages_seo_keywords" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_ctas" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_header_links" CASCADE;
  DROP TABLE "_pages_v_blocks_header" CASCADE;
  DROP TABLE "_pages_v_blocks_footer_columns_links" CASCADE;
  DROP TABLE "_pages_v_blocks_footer_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_footer_social_links" CASCADE;
  DROP TABLE "_pages_v_blocks_footer" CASCADE;
  DROP TABLE "_pages_v_blocks_features_grid_items" CASCADE;
  DROP TABLE "_pages_v_blocks_features_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_items" CASCADE;
  DROP TABLE "_pages_v_blocks_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_ctas" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_logo_cloud_items" CASCADE;
  DROP TABLE "_pages_v_blocks_logo_cloud" CASCADE;
  DROP TABLE "_pages_v_blocks_content_section" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_table_tiers_features" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_table_tiers" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_table" CASCADE;
  DROP TABLE "_pages_v_blocks_team_members_social_links" CASCADE;
  DROP TABLE "_pages_v_blocks_team_members" CASCADE;
  DROP TABLE "_pages_v_blocks_team" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_newsletter" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_channels" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_offices" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_form_fields" CASCADE;
  DROP TABLE "_pages_v_blocks_contact" CASCADE;
  DROP TABLE "_pages_v_blocks_breadcrumb_items" CASCADE;
  DROP TABLE "_pages_v_blocks_breadcrumb" CASCADE;
  DROP TABLE "_pages_v_blocks_tabs_section_panels" CASCADE;
  DROP TABLE "_pages_v_blocks_tabs_section" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_items" CASCADE;
  DROP TABLE "_pages_v_blocks_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_banner" CASCADE;
  DROP TABLE "_pages_v_version_seo_keywords" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "shop_pages_blocks_hero_ctas" CASCADE;
  DROP TABLE "shop_pages_blocks_hero" CASCADE;
  DROP TABLE "shop_pages_blocks_header_links" CASCADE;
  DROP TABLE "shop_pages_blocks_header" CASCADE;
  DROP TABLE "shop_pages_blocks_footer_columns_links" CASCADE;
  DROP TABLE "shop_pages_blocks_footer_columns" CASCADE;
  DROP TABLE "shop_pages_blocks_footer_social_links" CASCADE;
  DROP TABLE "shop_pages_blocks_footer" CASCADE;
  DROP TABLE "shop_pages_blocks_features_grid_items" CASCADE;
  DROP TABLE "shop_pages_blocks_features_grid" CASCADE;
  DROP TABLE "shop_pages_blocks_stats_items" CASCADE;
  DROP TABLE "shop_pages_blocks_stats" CASCADE;
  DROP TABLE "shop_pages_blocks_testimonials_items" CASCADE;
  DROP TABLE "shop_pages_blocks_testimonials" CASCADE;
  DROP TABLE "shop_pages_blocks_cta_ctas" CASCADE;
  DROP TABLE "shop_pages_blocks_cta" CASCADE;
  DROP TABLE "shop_pages_blocks_faq_items" CASCADE;
  DROP TABLE "shop_pages_blocks_faq" CASCADE;
  DROP TABLE "shop_pages_blocks_logo_cloud_items" CASCADE;
  DROP TABLE "shop_pages_blocks_logo_cloud" CASCADE;
  DROP TABLE "shop_pages_blocks_content_section" CASCADE;
  DROP TABLE "shop_pages_blocks_pricing_table_tiers_features" CASCADE;
  DROP TABLE "shop_pages_blocks_pricing_table_tiers" CASCADE;
  DROP TABLE "shop_pages_blocks_pricing_table" CASCADE;
  DROP TABLE "shop_pages_blocks_team_members_social_links" CASCADE;
  DROP TABLE "shop_pages_blocks_team_members" CASCADE;
  DROP TABLE "shop_pages_blocks_team" CASCADE;
  DROP TABLE "shop_pages_blocks_timeline_items" CASCADE;
  DROP TABLE "shop_pages_blocks_timeline" CASCADE;
  DROP TABLE "shop_pages_blocks_gallery_items" CASCADE;
  DROP TABLE "shop_pages_blocks_gallery" CASCADE;
  DROP TABLE "shop_pages_blocks_newsletter" CASCADE;
  DROP TABLE "shop_pages_blocks_contact_channels" CASCADE;
  DROP TABLE "shop_pages_blocks_contact_offices" CASCADE;
  DROP TABLE "shop_pages_blocks_contact_form_fields" CASCADE;
  DROP TABLE "shop_pages_blocks_contact" CASCADE;
  DROP TABLE "shop_pages_blocks_breadcrumb_items" CASCADE;
  DROP TABLE "shop_pages_blocks_breadcrumb" CASCADE;
  DROP TABLE "shop_pages_blocks_tabs_section_panels" CASCADE;
  DROP TABLE "shop_pages_blocks_tabs_section" CASCADE;
  DROP TABLE "shop_pages_blocks_steps_items" CASCADE;
  DROP TABLE "shop_pages_blocks_steps" CASCADE;
  DROP TABLE "shop_pages_blocks_banner" CASCADE;
  DROP TABLE "shop_pages_seo_keywords" CASCADE;
  DROP TABLE "shop_pages" CASCADE;
  DROP TABLE "shop_pages_locales" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_hero_ctas" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_header_links" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_header" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_footer_columns_links" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_footer_columns" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_footer_social_links" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_footer" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_features_grid_items" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_features_grid" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_stats_items" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_stats" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_cta_ctas" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_logo_cloud_items" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_logo_cloud" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_content_section" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_pricing_table_tiers_features" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_pricing_table_tiers" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_pricing_table" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_team_members_social_links" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_team_members" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_team" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_timeline" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_newsletter" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_contact_channels" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_contact_offices" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_contact_form_fields" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_contact" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_breadcrumb_items" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_breadcrumb" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_tabs_section_panels" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_tabs_section" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_steps_items" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_steps" CASCADE;
  DROP TABLE "_shop_pages_v_blocks_banner" CASCADE;
  DROP TABLE "_shop_pages_v_version_seo_keywords" CASCADE;
  DROP TABLE "_shop_pages_v" CASCADE;
  DROP TABLE "_shop_pages_v_locales" CASCADE;
  DROP TABLE "course_pages_blocks_hero_ctas" CASCADE;
  DROP TABLE "course_pages_blocks_hero" CASCADE;
  DROP TABLE "course_pages_blocks_header_links" CASCADE;
  DROP TABLE "course_pages_blocks_header" CASCADE;
  DROP TABLE "course_pages_blocks_footer_columns_links" CASCADE;
  DROP TABLE "course_pages_blocks_footer_columns" CASCADE;
  DROP TABLE "course_pages_blocks_footer_social_links" CASCADE;
  DROP TABLE "course_pages_blocks_footer" CASCADE;
  DROP TABLE "course_pages_blocks_features_grid_items" CASCADE;
  DROP TABLE "course_pages_blocks_features_grid" CASCADE;
  DROP TABLE "course_pages_blocks_stats_items" CASCADE;
  DROP TABLE "course_pages_blocks_stats" CASCADE;
  DROP TABLE "course_pages_blocks_testimonials_items" CASCADE;
  DROP TABLE "course_pages_blocks_testimonials" CASCADE;
  DROP TABLE "course_pages_blocks_cta_ctas" CASCADE;
  DROP TABLE "course_pages_blocks_cta" CASCADE;
  DROP TABLE "course_pages_blocks_faq_items" CASCADE;
  DROP TABLE "course_pages_blocks_faq" CASCADE;
  DROP TABLE "course_pages_blocks_logo_cloud_items" CASCADE;
  DROP TABLE "course_pages_blocks_logo_cloud" CASCADE;
  DROP TABLE "course_pages_blocks_content_section" CASCADE;
  DROP TABLE "course_pages_blocks_pricing_table_tiers_features" CASCADE;
  DROP TABLE "course_pages_blocks_pricing_table_tiers" CASCADE;
  DROP TABLE "course_pages_blocks_pricing_table" CASCADE;
  DROP TABLE "course_pages_blocks_team_members_social_links" CASCADE;
  DROP TABLE "course_pages_blocks_team_members" CASCADE;
  DROP TABLE "course_pages_blocks_team" CASCADE;
  DROP TABLE "course_pages_blocks_timeline_items" CASCADE;
  DROP TABLE "course_pages_blocks_timeline" CASCADE;
  DROP TABLE "course_pages_blocks_gallery_items" CASCADE;
  DROP TABLE "course_pages_blocks_gallery" CASCADE;
  DROP TABLE "course_pages_blocks_newsletter" CASCADE;
  DROP TABLE "course_pages_blocks_contact_channels" CASCADE;
  DROP TABLE "course_pages_blocks_contact_offices" CASCADE;
  DROP TABLE "course_pages_blocks_contact_form_fields" CASCADE;
  DROP TABLE "course_pages_blocks_contact" CASCADE;
  DROP TABLE "course_pages_blocks_breadcrumb_items" CASCADE;
  DROP TABLE "course_pages_blocks_breadcrumb" CASCADE;
  DROP TABLE "course_pages_blocks_tabs_section_panels" CASCADE;
  DROP TABLE "course_pages_blocks_tabs_section" CASCADE;
  DROP TABLE "course_pages_blocks_steps_items" CASCADE;
  DROP TABLE "course_pages_blocks_steps" CASCADE;
  DROP TABLE "course_pages_blocks_banner" CASCADE;
  DROP TABLE "course_pages_seo_keywords" CASCADE;
  DROP TABLE "course_pages" CASCADE;
  DROP TABLE "course_pages_locales" CASCADE;
  DROP TABLE "_course_pages_v_blocks_hero_ctas" CASCADE;
  DROP TABLE "_course_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_course_pages_v_blocks_header_links" CASCADE;
  DROP TABLE "_course_pages_v_blocks_header" CASCADE;
  DROP TABLE "_course_pages_v_blocks_footer_columns_links" CASCADE;
  DROP TABLE "_course_pages_v_blocks_footer_columns" CASCADE;
  DROP TABLE "_course_pages_v_blocks_footer_social_links" CASCADE;
  DROP TABLE "_course_pages_v_blocks_footer" CASCADE;
  DROP TABLE "_course_pages_v_blocks_features_grid_items" CASCADE;
  DROP TABLE "_course_pages_v_blocks_features_grid" CASCADE;
  DROP TABLE "_course_pages_v_blocks_stats_items" CASCADE;
  DROP TABLE "_course_pages_v_blocks_stats" CASCADE;
  DROP TABLE "_course_pages_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_course_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_course_pages_v_blocks_cta_ctas" CASCADE;
  DROP TABLE "_course_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_course_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_course_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_course_pages_v_blocks_logo_cloud_items" CASCADE;
  DROP TABLE "_course_pages_v_blocks_logo_cloud" CASCADE;
  DROP TABLE "_course_pages_v_blocks_content_section" CASCADE;
  DROP TABLE "_course_pages_v_blocks_pricing_table_tiers_features" CASCADE;
  DROP TABLE "_course_pages_v_blocks_pricing_table_tiers" CASCADE;
  DROP TABLE "_course_pages_v_blocks_pricing_table" CASCADE;
  DROP TABLE "_course_pages_v_blocks_team_members_social_links" CASCADE;
  DROP TABLE "_course_pages_v_blocks_team_members" CASCADE;
  DROP TABLE "_course_pages_v_blocks_team" CASCADE;
  DROP TABLE "_course_pages_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_course_pages_v_blocks_timeline" CASCADE;
  DROP TABLE "_course_pages_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_course_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_course_pages_v_blocks_newsletter" CASCADE;
  DROP TABLE "_course_pages_v_blocks_contact_channels" CASCADE;
  DROP TABLE "_course_pages_v_blocks_contact_offices" CASCADE;
  DROP TABLE "_course_pages_v_blocks_contact_form_fields" CASCADE;
  DROP TABLE "_course_pages_v_blocks_contact" CASCADE;
  DROP TABLE "_course_pages_v_blocks_breadcrumb_items" CASCADE;
  DROP TABLE "_course_pages_v_blocks_breadcrumb" CASCADE;
  DROP TABLE "_course_pages_v_blocks_tabs_section_panels" CASCADE;
  DROP TABLE "_course_pages_v_blocks_tabs_section" CASCADE;
  DROP TABLE "_course_pages_v_blocks_steps_items" CASCADE;
  DROP TABLE "_course_pages_v_blocks_steps" CASCADE;
  DROP TABLE "_course_pages_v_blocks_banner" CASCADE;
  DROP TABLE "_course_pages_v_version_seo_keywords" CASCADE;
  DROP TABLE "_course_pages_v" CASCADE;
  DROP TABLE "_course_pages_v_locales" CASCADE;
  DROP TABLE "posts_blocks_hero_ctas" CASCADE;
  DROP TABLE "posts_blocks_hero" CASCADE;
  DROP TABLE "posts_blocks_header_links" CASCADE;
  DROP TABLE "posts_blocks_header" CASCADE;
  DROP TABLE "posts_blocks_footer_columns_links" CASCADE;
  DROP TABLE "posts_blocks_footer_columns" CASCADE;
  DROP TABLE "posts_blocks_footer_social_links" CASCADE;
  DROP TABLE "posts_blocks_footer" CASCADE;
  DROP TABLE "posts_blocks_features_grid_items" CASCADE;
  DROP TABLE "posts_blocks_features_grid" CASCADE;
  DROP TABLE "posts_blocks_stats_items" CASCADE;
  DROP TABLE "posts_blocks_stats" CASCADE;
  DROP TABLE "posts_blocks_testimonials_items" CASCADE;
  DROP TABLE "posts_blocks_testimonials" CASCADE;
  DROP TABLE "posts_blocks_cta_ctas" CASCADE;
  DROP TABLE "posts_blocks_cta" CASCADE;
  DROP TABLE "posts_blocks_faq_items" CASCADE;
  DROP TABLE "posts_blocks_faq" CASCADE;
  DROP TABLE "posts_blocks_logo_cloud_items" CASCADE;
  DROP TABLE "posts_blocks_logo_cloud" CASCADE;
  DROP TABLE "posts_blocks_content_section" CASCADE;
  DROP TABLE "posts_blocks_pricing_table_tiers_features" CASCADE;
  DROP TABLE "posts_blocks_pricing_table_tiers" CASCADE;
  DROP TABLE "posts_blocks_pricing_table" CASCADE;
  DROP TABLE "posts_blocks_team_members_social_links" CASCADE;
  DROP TABLE "posts_blocks_team_members" CASCADE;
  DROP TABLE "posts_blocks_team" CASCADE;
  DROP TABLE "posts_blocks_timeline_items" CASCADE;
  DROP TABLE "posts_blocks_timeline" CASCADE;
  DROP TABLE "posts_blocks_gallery_items" CASCADE;
  DROP TABLE "posts_blocks_gallery" CASCADE;
  DROP TABLE "posts_blocks_newsletter" CASCADE;
  DROP TABLE "posts_blocks_contact_channels" CASCADE;
  DROP TABLE "posts_blocks_contact_offices" CASCADE;
  DROP TABLE "posts_blocks_contact_form_fields" CASCADE;
  DROP TABLE "posts_blocks_contact" CASCADE;
  DROP TABLE "posts_blocks_breadcrumb_items" CASCADE;
  DROP TABLE "posts_blocks_breadcrumb" CASCADE;
  DROP TABLE "posts_blocks_tabs_section_panels" CASCADE;
  DROP TABLE "posts_blocks_tabs_section" CASCADE;
  DROP TABLE "posts_blocks_steps_items" CASCADE;
  DROP TABLE "posts_blocks_steps" CASCADE;
  DROP TABLE "posts_blocks_banner" CASCADE;
  DROP TABLE "posts_seo_keywords" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_blocks_hero_ctas" CASCADE;
  DROP TABLE "_posts_v_blocks_hero" CASCADE;
  DROP TABLE "_posts_v_blocks_header_links" CASCADE;
  DROP TABLE "_posts_v_blocks_header" CASCADE;
  DROP TABLE "_posts_v_blocks_footer_columns_links" CASCADE;
  DROP TABLE "_posts_v_blocks_footer_columns" CASCADE;
  DROP TABLE "_posts_v_blocks_footer_social_links" CASCADE;
  DROP TABLE "_posts_v_blocks_footer" CASCADE;
  DROP TABLE "_posts_v_blocks_features_grid_items" CASCADE;
  DROP TABLE "_posts_v_blocks_features_grid" CASCADE;
  DROP TABLE "_posts_v_blocks_stats_items" CASCADE;
  DROP TABLE "_posts_v_blocks_stats" CASCADE;
  DROP TABLE "_posts_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_posts_v_blocks_testimonials" CASCADE;
  DROP TABLE "_posts_v_blocks_cta_ctas" CASCADE;
  DROP TABLE "_posts_v_blocks_cta" CASCADE;
  DROP TABLE "_posts_v_blocks_faq_items" CASCADE;
  DROP TABLE "_posts_v_blocks_faq" CASCADE;
  DROP TABLE "_posts_v_blocks_logo_cloud_items" CASCADE;
  DROP TABLE "_posts_v_blocks_logo_cloud" CASCADE;
  DROP TABLE "_posts_v_blocks_content_section" CASCADE;
  DROP TABLE "_posts_v_blocks_pricing_table_tiers_features" CASCADE;
  DROP TABLE "_posts_v_blocks_pricing_table_tiers" CASCADE;
  DROP TABLE "_posts_v_blocks_pricing_table" CASCADE;
  DROP TABLE "_posts_v_blocks_team_members_social_links" CASCADE;
  DROP TABLE "_posts_v_blocks_team_members" CASCADE;
  DROP TABLE "_posts_v_blocks_team" CASCADE;
  DROP TABLE "_posts_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_posts_v_blocks_timeline" CASCADE;
  DROP TABLE "_posts_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_posts_v_blocks_gallery" CASCADE;
  DROP TABLE "_posts_v_blocks_newsletter" CASCADE;
  DROP TABLE "_posts_v_blocks_contact_channels" CASCADE;
  DROP TABLE "_posts_v_blocks_contact_offices" CASCADE;
  DROP TABLE "_posts_v_blocks_contact_form_fields" CASCADE;
  DROP TABLE "_posts_v_blocks_contact" CASCADE;
  DROP TABLE "_posts_v_blocks_breadcrumb_items" CASCADE;
  DROP TABLE "_posts_v_blocks_breadcrumb" CASCADE;
  DROP TABLE "_posts_v_blocks_tabs_section_panels" CASCADE;
  DROP TABLE "_posts_v_blocks_tabs_section" CASCADE;
  DROP TABLE "_posts_v_blocks_steps_items" CASCADE;
  DROP TABLE "_posts_v_blocks_steps" CASCADE;
  DROP TABLE "_posts_v_blocks_banner" CASCADE;
  DROP TABLE "_posts_v_version_seo_keywords" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "form_submissions_spam_reasons" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "faq_categories" CASCADE;
  DROP TABLE "faq_items" CASCADE;
  DROP TABLE "comments_spam_reasons" CASCADE;
  DROP TABLE "comments" CASCADE;
  DROP TABLE "cta_blocks" CASCADE;
  DROP TABLE "cta_blocks_rels" CASCADE;
  DROP TABLE "lead_magnets" CASCADE;
  DROP TABLE "lead_captures" CASCADE;
  DROP TABLE "newsletter_subscribers" CASCADE;
  DROP TABLE "marketing_click_events" CASCADE;
  DROP TABLE "broken_links" CASCADE;
  DROP TABLE "user_credentials" CASCADE;
  DROP TABLE "workflow_executions" CASCADE;
  DROP TABLE "workflow_registry" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_pages_blocks_hero_ctas_variant";
  DROP TYPE "public"."enum_pages_blocks_hero_variant";
  DROP TYPE "public"."enum_pages_blocks_hero_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_hero_motion_level";
  DROP TYPE "public"."enum_pages_blocks_header_variant";
  DROP TYPE "public"."enum_pages_blocks_header_cta_variant";
  DROP TYPE "public"."enum_pages_blocks_header_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_header_motion_level";
  DROP TYPE "public"."enum_pages_blocks_footer_variant";
  DROP TYPE "public"."enum_pages_blocks_footer_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_footer_motion_level";
  DROP TYPE "public"."enum_pages_blocks_features_grid_variant";
  DROP TYPE "public"."enum_pages_blocks_features_grid_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_features_grid_motion_level";
  DROP TYPE "public"."enum_pages_blocks_stats_variant";
  DROP TYPE "public"."enum_pages_blocks_stats_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_stats_motion_level";
  DROP TYPE "public"."enum_pages_blocks_testimonials_variant";
  DROP TYPE "public"."enum_pages_blocks_testimonials_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_testimonials_motion_level";
  DROP TYPE "public"."enum_pages_blocks_cta_ctas_variant";
  DROP TYPE "public"."enum_pages_blocks_cta_variant";
  DROP TYPE "public"."enum_pages_blocks_cta_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_cta_motion_level";
  DROP TYPE "public"."enum_pages_blocks_faq_variant";
  DROP TYPE "public"."enum_pages_blocks_faq_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_faq_motion_level";
  DROP TYPE "public"."enum_pages_blocks_logo_cloud_variant";
  DROP TYPE "public"."enum_pages_blocks_logo_cloud_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_logo_cloud_motion_level";
  DROP TYPE "public"."enum_pages_blocks_content_section_variant";
  DROP TYPE "public"."enum_pages_blocks_content_section_cta_variant";
  DROP TYPE "public"."enum_pages_blocks_content_section_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_content_section_motion_level";
  DROP TYPE "public"."enum_pages_blocks_pricing_table_tiers_cta_variant";
  DROP TYPE "public"."enum_pages_blocks_pricing_table_variant";
  DROP TYPE "public"."enum_pages_blocks_pricing_table_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_pricing_table_motion_level";
  DROP TYPE "public"."enum_pages_blocks_team_variant";
  DROP TYPE "public"."enum_pages_blocks_team_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_team_motion_level";
  DROP TYPE "public"."enum_pages_blocks_timeline_variant";
  DROP TYPE "public"."enum_pages_blocks_timeline_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_timeline_motion_level";
  DROP TYPE "public"."enum_pages_blocks_gallery_variant";
  DROP TYPE "public"."enum_pages_blocks_gallery_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_gallery_motion_level";
  DROP TYPE "public"."enum_pages_blocks_newsletter_variant";
  DROP TYPE "public"."enum_pages_blocks_newsletter_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_newsletter_motion_level";
  DROP TYPE "public"."enum_pages_blocks_contact_channels_type";
  DROP TYPE "public"."enum_pages_blocks_contact_form_fields_value";
  DROP TYPE "public"."enum_pages_blocks_contact_variant";
  DROP TYPE "public"."enum_pages_blocks_contact_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_contact_motion_level";
  DROP TYPE "public"."enum_pages_blocks_breadcrumb_variant";
  DROP TYPE "public"."enum_pages_blocks_breadcrumb_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_breadcrumb_motion_level";
  DROP TYPE "public"."enum_pages_blocks_tabs_section_variant";
  DROP TYPE "public"."enum_pages_blocks_tabs_section_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_tabs_section_motion_level";
  DROP TYPE "public"."enum_pages_blocks_steps_variant";
  DROP TYPE "public"."enum_pages_blocks_steps_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_steps_motion_level";
  DROP TYPE "public"."enum_pages_blocks_banner_variant";
  DROP TYPE "public"."enum_pages_blocks_banner_cta_variant";
  DROP TYPE "public"."enum_pages_blocks_banner_tone";
  DROP TYPE "public"."enum_pages_blocks_banner_motion_variant";
  DROP TYPE "public"."enum_pages_blocks_banner_motion_level";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_hero_ctas_variant";
  DROP TYPE "public"."enum__pages_v_blocks_hero_variant";
  DROP TYPE "public"."enum__pages_v_blocks_hero_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_hero_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_header_variant";
  DROP TYPE "public"."enum__pages_v_blocks_header_cta_variant";
  DROP TYPE "public"."enum__pages_v_blocks_header_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_header_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_footer_variant";
  DROP TYPE "public"."enum__pages_v_blocks_footer_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_footer_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_features_grid_variant";
  DROP TYPE "public"."enum__pages_v_blocks_features_grid_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_features_grid_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_stats_variant";
  DROP TYPE "public"."enum__pages_v_blocks_stats_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_stats_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_variant";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_cta_ctas_variant";
  DROP TYPE "public"."enum__pages_v_blocks_cta_variant";
  DROP TYPE "public"."enum__pages_v_blocks_cta_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_cta_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_faq_variant";
  DROP TYPE "public"."enum__pages_v_blocks_faq_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_faq_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_logo_cloud_variant";
  DROP TYPE "public"."enum__pages_v_blocks_logo_cloud_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_logo_cloud_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_variant";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_cta_variant";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_table_tiers_cta_variant";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_table_variant";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_table_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_table_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_team_variant";
  DROP TYPE "public"."enum__pages_v_blocks_team_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_team_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_timeline_variant";
  DROP TYPE "public"."enum__pages_v_blocks_timeline_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_timeline_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_variant";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_variant";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_contact_channels_type";
  DROP TYPE "public"."enum__pages_v_blocks_contact_form_fields_value";
  DROP TYPE "public"."enum__pages_v_blocks_contact_variant";
  DROP TYPE "public"."enum__pages_v_blocks_contact_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_contact_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_breadcrumb_variant";
  DROP TYPE "public"."enum__pages_v_blocks_breadcrumb_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_breadcrumb_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_section_variant";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_section_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_section_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_steps_variant";
  DROP TYPE "public"."enum__pages_v_blocks_steps_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_steps_motion_level";
  DROP TYPE "public"."enum__pages_v_blocks_banner_variant";
  DROP TYPE "public"."enum__pages_v_blocks_banner_cta_variant";
  DROP TYPE "public"."enum__pages_v_blocks_banner_tone";
  DROP TYPE "public"."enum__pages_v_blocks_banner_motion_variant";
  DROP TYPE "public"."enum__pages_v_blocks_banner_motion_level";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_shop_pages_blocks_hero_ctas_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_hero_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_hero_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_hero_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_header_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_header_cta_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_header_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_header_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_footer_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_footer_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_footer_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_features_grid_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_features_grid_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_features_grid_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_stats_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_stats_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_stats_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_testimonials_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_testimonials_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_testimonials_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_cta_ctas_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_cta_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_cta_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_cta_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_faq_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_faq_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_faq_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_logo_cloud_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_logo_cloud_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_logo_cloud_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_content_section_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_content_section_cta_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_content_section_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_content_section_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_pricing_table_tiers_cta_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_pricing_table_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_pricing_table_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_pricing_table_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_team_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_team_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_team_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_timeline_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_timeline_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_timeline_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_gallery_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_gallery_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_gallery_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_newsletter_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_newsletter_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_newsletter_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_contact_channels_type";
  DROP TYPE "public"."enum_shop_pages_blocks_contact_form_fields_value";
  DROP TYPE "public"."enum_shop_pages_blocks_contact_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_contact_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_contact_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_breadcrumb_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_breadcrumb_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_breadcrumb_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_tabs_section_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_tabs_section_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_tabs_section_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_steps_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_steps_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_steps_motion_level";
  DROP TYPE "public"."enum_shop_pages_blocks_banner_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_banner_cta_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_banner_tone";
  DROP TYPE "public"."enum_shop_pages_blocks_banner_motion_variant";
  DROP TYPE "public"."enum_shop_pages_blocks_banner_motion_level";
  DROP TYPE "public"."enum_shop_pages_status";
  DROP TYPE "public"."enum__shop_pages_v_blocks_hero_ctas_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_hero_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_hero_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_hero_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_header_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_header_cta_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_header_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_header_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_footer_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_footer_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_footer_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_features_grid_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_features_grid_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_features_grid_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_stats_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_stats_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_stats_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_testimonials_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_testimonials_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_testimonials_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_cta_ctas_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_cta_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_cta_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_cta_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_faq_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_faq_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_faq_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_logo_cloud_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_logo_cloud_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_logo_cloud_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_content_section_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_content_section_cta_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_content_section_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_content_section_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_pricing_table_tiers_cta_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_pricing_table_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_pricing_table_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_pricing_table_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_team_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_team_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_team_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_timeline_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_timeline_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_timeline_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_gallery_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_gallery_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_gallery_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_newsletter_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_newsletter_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_newsletter_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_contact_channels_type";
  DROP TYPE "public"."enum__shop_pages_v_blocks_contact_form_fields_value";
  DROP TYPE "public"."enum__shop_pages_v_blocks_contact_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_contact_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_contact_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_breadcrumb_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_breadcrumb_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_breadcrumb_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_tabs_section_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_tabs_section_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_tabs_section_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_steps_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_steps_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_steps_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_blocks_banner_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_banner_cta_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_banner_tone";
  DROP TYPE "public"."enum__shop_pages_v_blocks_banner_motion_variant";
  DROP TYPE "public"."enum__shop_pages_v_blocks_banner_motion_level";
  DROP TYPE "public"."enum__shop_pages_v_version_status";
  DROP TYPE "public"."enum__shop_pages_v_published_locale";
  DROP TYPE "public"."enum_course_pages_blocks_hero_ctas_variant";
  DROP TYPE "public"."enum_course_pages_blocks_hero_variant";
  DROP TYPE "public"."enum_course_pages_blocks_hero_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_hero_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_header_variant";
  DROP TYPE "public"."enum_course_pages_blocks_header_cta_variant";
  DROP TYPE "public"."enum_course_pages_blocks_header_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_header_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_footer_variant";
  DROP TYPE "public"."enum_course_pages_blocks_footer_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_footer_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_features_grid_variant";
  DROP TYPE "public"."enum_course_pages_blocks_features_grid_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_features_grid_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_stats_variant";
  DROP TYPE "public"."enum_course_pages_blocks_stats_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_stats_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_testimonials_variant";
  DROP TYPE "public"."enum_course_pages_blocks_testimonials_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_testimonials_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_cta_ctas_variant";
  DROP TYPE "public"."enum_course_pages_blocks_cta_variant";
  DROP TYPE "public"."enum_course_pages_blocks_cta_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_cta_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_faq_variant";
  DROP TYPE "public"."enum_course_pages_blocks_faq_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_faq_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_logo_cloud_variant";
  DROP TYPE "public"."enum_course_pages_blocks_logo_cloud_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_logo_cloud_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_content_section_variant";
  DROP TYPE "public"."enum_course_pages_blocks_content_section_cta_variant";
  DROP TYPE "public"."enum_course_pages_blocks_content_section_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_content_section_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_pricing_table_tiers_cta_variant";
  DROP TYPE "public"."enum_course_pages_blocks_pricing_table_variant";
  DROP TYPE "public"."enum_course_pages_blocks_pricing_table_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_pricing_table_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_team_variant";
  DROP TYPE "public"."enum_course_pages_blocks_team_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_team_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_timeline_variant";
  DROP TYPE "public"."enum_course_pages_blocks_timeline_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_timeline_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_gallery_variant";
  DROP TYPE "public"."enum_course_pages_blocks_gallery_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_gallery_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_newsletter_variant";
  DROP TYPE "public"."enum_course_pages_blocks_newsletter_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_newsletter_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_contact_channels_type";
  DROP TYPE "public"."enum_course_pages_blocks_contact_form_fields_value";
  DROP TYPE "public"."enum_course_pages_blocks_contact_variant";
  DROP TYPE "public"."enum_course_pages_blocks_contact_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_contact_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_breadcrumb_variant";
  DROP TYPE "public"."enum_course_pages_blocks_breadcrumb_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_breadcrumb_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_tabs_section_variant";
  DROP TYPE "public"."enum_course_pages_blocks_tabs_section_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_tabs_section_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_steps_variant";
  DROP TYPE "public"."enum_course_pages_blocks_steps_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_steps_motion_level";
  DROP TYPE "public"."enum_course_pages_blocks_banner_variant";
  DROP TYPE "public"."enum_course_pages_blocks_banner_cta_variant";
  DROP TYPE "public"."enum_course_pages_blocks_banner_tone";
  DROP TYPE "public"."enum_course_pages_blocks_banner_motion_variant";
  DROP TYPE "public"."enum_course_pages_blocks_banner_motion_level";
  DROP TYPE "public"."enum_course_pages_status";
  DROP TYPE "public"."enum__course_pages_v_blocks_hero_ctas_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_hero_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_hero_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_hero_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_header_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_header_cta_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_header_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_header_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_footer_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_footer_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_footer_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_features_grid_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_features_grid_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_features_grid_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_stats_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_stats_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_stats_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_testimonials_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_testimonials_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_testimonials_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_cta_ctas_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_cta_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_cta_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_cta_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_faq_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_faq_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_faq_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_logo_cloud_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_logo_cloud_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_logo_cloud_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_content_section_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_content_section_cta_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_content_section_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_content_section_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_pricing_table_tiers_cta_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_pricing_table_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_pricing_table_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_pricing_table_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_team_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_team_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_team_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_timeline_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_timeline_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_timeline_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_gallery_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_gallery_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_gallery_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_newsletter_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_newsletter_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_newsletter_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_contact_channels_type";
  DROP TYPE "public"."enum__course_pages_v_blocks_contact_form_fields_value";
  DROP TYPE "public"."enum__course_pages_v_blocks_contact_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_contact_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_contact_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_breadcrumb_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_breadcrumb_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_breadcrumb_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_tabs_section_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_tabs_section_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_tabs_section_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_steps_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_steps_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_steps_motion_level";
  DROP TYPE "public"."enum__course_pages_v_blocks_banner_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_banner_cta_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_banner_tone";
  DROP TYPE "public"."enum__course_pages_v_blocks_banner_motion_variant";
  DROP TYPE "public"."enum__course_pages_v_blocks_banner_motion_level";
  DROP TYPE "public"."enum__course_pages_v_version_status";
  DROP TYPE "public"."enum__course_pages_v_published_locale";
  DROP TYPE "public"."enum_posts_blocks_hero_ctas_variant";
  DROP TYPE "public"."enum_posts_blocks_hero_variant";
  DROP TYPE "public"."enum_posts_blocks_hero_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_hero_motion_level";
  DROP TYPE "public"."enum_posts_blocks_header_variant";
  DROP TYPE "public"."enum_posts_blocks_header_cta_variant";
  DROP TYPE "public"."enum_posts_blocks_header_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_header_motion_level";
  DROP TYPE "public"."enum_posts_blocks_footer_variant";
  DROP TYPE "public"."enum_posts_blocks_footer_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_footer_motion_level";
  DROP TYPE "public"."enum_posts_blocks_features_grid_variant";
  DROP TYPE "public"."enum_posts_blocks_features_grid_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_features_grid_motion_level";
  DROP TYPE "public"."enum_posts_blocks_stats_variant";
  DROP TYPE "public"."enum_posts_blocks_stats_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_stats_motion_level";
  DROP TYPE "public"."enum_posts_blocks_testimonials_variant";
  DROP TYPE "public"."enum_posts_blocks_testimonials_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_testimonials_motion_level";
  DROP TYPE "public"."enum_posts_blocks_cta_ctas_variant";
  DROP TYPE "public"."enum_posts_blocks_cta_variant";
  DROP TYPE "public"."enum_posts_blocks_cta_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_cta_motion_level";
  DROP TYPE "public"."enum_posts_blocks_faq_variant";
  DROP TYPE "public"."enum_posts_blocks_faq_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_faq_motion_level";
  DROP TYPE "public"."enum_posts_blocks_logo_cloud_variant";
  DROP TYPE "public"."enum_posts_blocks_logo_cloud_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_logo_cloud_motion_level";
  DROP TYPE "public"."enum_posts_blocks_content_section_variant";
  DROP TYPE "public"."enum_posts_blocks_content_section_cta_variant";
  DROP TYPE "public"."enum_posts_blocks_content_section_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_content_section_motion_level";
  DROP TYPE "public"."enum_posts_blocks_pricing_table_tiers_cta_variant";
  DROP TYPE "public"."enum_posts_blocks_pricing_table_variant";
  DROP TYPE "public"."enum_posts_blocks_pricing_table_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_pricing_table_motion_level";
  DROP TYPE "public"."enum_posts_blocks_team_variant";
  DROP TYPE "public"."enum_posts_blocks_team_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_team_motion_level";
  DROP TYPE "public"."enum_posts_blocks_timeline_variant";
  DROP TYPE "public"."enum_posts_blocks_timeline_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_timeline_motion_level";
  DROP TYPE "public"."enum_posts_blocks_gallery_variant";
  DROP TYPE "public"."enum_posts_blocks_gallery_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_gallery_motion_level";
  DROP TYPE "public"."enum_posts_blocks_newsletter_variant";
  DROP TYPE "public"."enum_posts_blocks_newsletter_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_newsletter_motion_level";
  DROP TYPE "public"."enum_posts_blocks_contact_channels_type";
  DROP TYPE "public"."enum_posts_blocks_contact_form_fields_value";
  DROP TYPE "public"."enum_posts_blocks_contact_variant";
  DROP TYPE "public"."enum_posts_blocks_contact_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_contact_motion_level";
  DROP TYPE "public"."enum_posts_blocks_breadcrumb_variant";
  DROP TYPE "public"."enum_posts_blocks_breadcrumb_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_breadcrumb_motion_level";
  DROP TYPE "public"."enum_posts_blocks_tabs_section_variant";
  DROP TYPE "public"."enum_posts_blocks_tabs_section_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_tabs_section_motion_level";
  DROP TYPE "public"."enum_posts_blocks_steps_variant";
  DROP TYPE "public"."enum_posts_blocks_steps_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_steps_motion_level";
  DROP TYPE "public"."enum_posts_blocks_banner_variant";
  DROP TYPE "public"."enum_posts_blocks_banner_cta_variant";
  DROP TYPE "public"."enum_posts_blocks_banner_tone";
  DROP TYPE "public"."enum_posts_blocks_banner_motion_variant";
  DROP TYPE "public"."enum_posts_blocks_banner_motion_level";
  DROP TYPE "public"."enum_posts_comment_source";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_blocks_hero_ctas_variant";
  DROP TYPE "public"."enum__posts_v_blocks_hero_variant";
  DROP TYPE "public"."enum__posts_v_blocks_hero_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_hero_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_header_variant";
  DROP TYPE "public"."enum__posts_v_blocks_header_cta_variant";
  DROP TYPE "public"."enum__posts_v_blocks_header_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_header_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_footer_variant";
  DROP TYPE "public"."enum__posts_v_blocks_footer_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_footer_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_features_grid_variant";
  DROP TYPE "public"."enum__posts_v_blocks_features_grid_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_features_grid_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_stats_variant";
  DROP TYPE "public"."enum__posts_v_blocks_stats_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_stats_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_testimonials_variant";
  DROP TYPE "public"."enum__posts_v_blocks_testimonials_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_testimonials_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_cta_ctas_variant";
  DROP TYPE "public"."enum__posts_v_blocks_cta_variant";
  DROP TYPE "public"."enum__posts_v_blocks_cta_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_cta_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_faq_variant";
  DROP TYPE "public"."enum__posts_v_blocks_faq_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_faq_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_logo_cloud_variant";
  DROP TYPE "public"."enum__posts_v_blocks_logo_cloud_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_logo_cloud_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_content_section_variant";
  DROP TYPE "public"."enum__posts_v_blocks_content_section_cta_variant";
  DROP TYPE "public"."enum__posts_v_blocks_content_section_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_content_section_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_pricing_table_tiers_cta_variant";
  DROP TYPE "public"."enum__posts_v_blocks_pricing_table_variant";
  DROP TYPE "public"."enum__posts_v_blocks_pricing_table_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_pricing_table_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_team_variant";
  DROP TYPE "public"."enum__posts_v_blocks_team_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_team_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_timeline_variant";
  DROP TYPE "public"."enum__posts_v_blocks_timeline_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_timeline_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_gallery_variant";
  DROP TYPE "public"."enum__posts_v_blocks_gallery_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_gallery_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_newsletter_variant";
  DROP TYPE "public"."enum__posts_v_blocks_newsletter_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_newsletter_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_contact_channels_type";
  DROP TYPE "public"."enum__posts_v_blocks_contact_form_fields_value";
  DROP TYPE "public"."enum__posts_v_blocks_contact_variant";
  DROP TYPE "public"."enum__posts_v_blocks_contact_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_contact_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_breadcrumb_variant";
  DROP TYPE "public"."enum__posts_v_blocks_breadcrumb_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_breadcrumb_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_tabs_section_variant";
  DROP TYPE "public"."enum__posts_v_blocks_tabs_section_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_tabs_section_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_steps_variant";
  DROP TYPE "public"."enum__posts_v_blocks_steps_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_steps_motion_level";
  DROP TYPE "public"."enum__posts_v_blocks_banner_variant";
  DROP TYPE "public"."enum__posts_v_blocks_banner_cta_variant";
  DROP TYPE "public"."enum__posts_v_blocks_banner_tone";
  DROP TYPE "public"."enum__posts_v_blocks_banner_motion_variant";
  DROP TYPE "public"."enum__posts_v_blocks_banner_motion_level";
  DROP TYPE "public"."enum__posts_v_version_comment_source";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum_comments_status";
  DROP TYPE "public"."enum_cta_blocks_placement";
  DROP TYPE "public"."enum_marketing_click_events_source";
  DROP TYPE "public"."enum_workflow_executions_status";
  DROP TYPE "public"."enum_workflow_executions_trigger_kind";
  DROP TYPE "public"."enum_workflow_registry_status";`)
}
