import type { PaymentMethod } from '@saas-factory/payment-core';

/**
 * 將內部 PaymentMethod 映射為藍新 MPG 啟用旗標。
 * 藍新 MPG 用「同時送多個旗標」的方式控制顯示哪些方式。
 * 對應旗標皆需設為 '1' 才會顯示。
 */
export type NewebPayFlags = Record<string, string>;

export function methodToNewebFlags(method: PaymentMethod): NewebPayFlags {
  switch (method) {
    case 'credit':
      return { CREDIT: '1' };
    case 'credit-installment':
      // 預設啟用 3/6/12 期，需要 18/24 時 caller 自行覆寫
      return { CREDIT: '1', InstFlag: '3,6,12' };
    case 'atm':
      return { VACC: '1' };
    case 'cvs':
      return { CVS: '1' };
    case 'cvs-barcode':
      return { BARCODE: '1' };
    case 'webatm':
      return { WEBATM: '1' };
    case 'linepay':
      return { LINEPAY: '1' };
    case 'jkopay':
      return { JKOPAY: '1' };
    case 'applepay':
      return { APPLEPAY: '1' };
    case 'googlepay':
      return { ANDROIDPAY: '1' };
    case 'samsungpay':
      return { SAMSUNGPAY: '1' };
    case 'pi-wallet':
      return { PiWallet: '1' };
    case 'easycard':
      return { EZPAY: '1' };
    case 'esun-wallet':
      return { ESUNWALLET: '1' };
    case 'taiwanpay':
      return { TAIWANPAY: '1' };
    default:
      return {};
  }
}
