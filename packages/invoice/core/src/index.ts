/**
 * @saas-factory/invoice-core
 *
 * 台灣電子發票模組核心：型別、collection、service。
 * goal 02 §10 接收所有權；後續 goal 03 / 04 / 05 只 consume。
 */

export type {
  AllowanceResult,
  InvoiceCarrier,
  InvoiceCarrierType,
  InvoiceCategory,
  InvoiceIssueMode,
  InvoiceItem,
  InvoiceProvider,
  InvoiceResult,
  InvoiceTaxType,
  IssueAllowanceParams,
  IssueInvoiceParams,
  VoidInvoiceParams,
} from './types.js';

export {
  InvoicesCollection,
  InvoiceAllowancesCollection,
  InvoiceLogsCollection,
} from './collections.js';

export { InvoiceService } from './service.js';
export type { InvoiceEventEmit, InvoiceServiceDeps } from './service.js';

export { validateCarrier, isValidTaxId } from './validators.js';
