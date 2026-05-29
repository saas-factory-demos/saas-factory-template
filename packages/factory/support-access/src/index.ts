/**
 * `@saas-factory/factory-support-access` — Factory ↔ Template 維修通道 client / verify。
 *
 * 詳見 ADR-0100 / goal-11。
 */

export * from './types.js';
export {
  SUPPORT_ACCESS_BASE_PATH,
  SUPPORT_ACCESS_HEADERS,
  createSupportAccessClient,
  type SupportAccessClient,
  type SupportAccessResult,
  type CreateSupportAccessClientOptions,
} from './client.js';
export {
  SUPPORT_ACCESS_ACTIONS,
  verifySupportAccessRequest,
  type SupportAccessVerifyOk,
  type SupportAccessVerifyError,
  type VerifySupportAccessRequestInput,
} from './verify.js';
