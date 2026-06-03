import * as migration_20260526_004340 from './20260526_004340';
import * as migration_20260528_114427_goal_11_support_access from './20260528_114427_goal_11_support_access';
import * as migration_20260531_234753_goal_14_orders_payments from './20260531_234753_goal_14_orders_payments';
import * as migration_20260601_014445_goal_14_audit_logs from './20260601_014445_goal_14_audit_logs';
import * as migration_20260601_030800_goal_14_products_schema from './20260601_030800_goal_14_products_schema';
import * as migration_20260601_032458_goal_14_invoices from './20260601_032458_goal_14_invoices';
import * as migration_20260601_034319_goal_14_subscriptions from './20260601_034319_goal_14_subscriptions';
import * as migration_20260603_001836_phase1_product_variants from './20260603_001836_phase1_product_variants';
import * as migration_20260603_002057_phase2_carts from './20260603_002057_phase2_carts';
import * as migration_20260603_002343_phase3_categories_tags from './20260603_002343_phase3_categories_tags';
import * as migration_20260603_003518_phase6_discount_rules from './20260603_003518_phase6_discount_rules';
import * as migration_20260603_004125_phase8_bundles_shipments from './20260603_004125_phase8_bundles_shipments';

export const migrations = [
  {
    up: migration_20260526_004340.up,
    down: migration_20260526_004340.down,
    name: '20260526_004340',
  },
  {
    up: migration_20260528_114427_goal_11_support_access.up,
    down: migration_20260528_114427_goal_11_support_access.down,
    name: '20260528_114427_goal_11_support_access',
  },
  {
    up: migration_20260531_234753_goal_14_orders_payments.up,
    down: migration_20260531_234753_goal_14_orders_payments.down,
    name: '20260531_234753_goal_14_orders_payments',
  },
  {
    up: migration_20260601_014445_goal_14_audit_logs.up,
    down: migration_20260601_014445_goal_14_audit_logs.down,
    name: '20260601_014445_goal_14_audit_logs',
  },
  {
    up: migration_20260601_030800_goal_14_products_schema.up,
    down: migration_20260601_030800_goal_14_products_schema.down,
    name: '20260601_030800_goal_14_products_schema',
  },
  {
    up: migration_20260601_032458_goal_14_invoices.up,
    down: migration_20260601_032458_goal_14_invoices.down,
    name: '20260601_032458_goal_14_invoices',
  },
  {
    up: migration_20260601_034319_goal_14_subscriptions.up,
    down: migration_20260601_034319_goal_14_subscriptions.down,
    name: '20260601_034319_goal_14_subscriptions',
  },
  {
    up: migration_20260603_001836_phase1_product_variants.up,
    down: migration_20260603_001836_phase1_product_variants.down,
    name: '20260603_001836_phase1_product_variants',
  },
  {
    up: migration_20260603_002057_phase2_carts.up,
    down: migration_20260603_002057_phase2_carts.down,
    name: '20260603_002057_phase2_carts',
  },
  {
    up: migration_20260603_002343_phase3_categories_tags.up,
    down: migration_20260603_002343_phase3_categories_tags.down,
    name: '20260603_002343_phase3_categories_tags',
  },
  {
    up: migration_20260603_003518_phase6_discount_rules.up,
    down: migration_20260603_003518_phase6_discount_rules.down,
    name: '20260603_003518_phase6_discount_rules',
  },
  {
    up: migration_20260603_004125_phase8_bundles_shipments.up,
    down: migration_20260603_004125_phase8_bundles_shipments.down,
    name: '20260603_004125_phase8_bundles_shipments',
  },
];
