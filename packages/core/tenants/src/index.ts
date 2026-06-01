export { TenantsCollection } from './collection.js';
export {
  GLOBAL_COLLECTIONS,
  isGlobalCollection,
} from './global-collections.js';
export type { GlobalCollectionSlug } from './global-collections.js';
export {
  canBypassTenant,
  getCurrentTenantId,
  tenantScoped,
} from './scope.js';
