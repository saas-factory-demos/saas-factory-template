import * as migration_20260526_004340 from './20260526_004340';
import * as migration_20260528_114427_goal_11_support_access from './20260528_114427_goal_11_support_access';

export const migrations = [
  {
    up: migration_20260526_004340.up,
    down: migration_20260526_004340.down,
    name: '20260526_004340',
  },
  {
    up: migration_20260528_114427_goal_11_support_access.up,
    down: migration_20260528_114427_goal_11_support_access.down,
    name: '20260528_114427_goal_11_support_access'
  },
];
