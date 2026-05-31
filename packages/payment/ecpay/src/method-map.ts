import type { PaymentMethod } from '@saas-factory/payment-core';

/**
 * 將內部 PaymentMethod 對應至綠界 ChoosePayment 欄位。
 * 與藍新不同：綠界用單一 ChoosePayment 而非多旗標。
 */
export function methodToEcpayChoosePayment(method: PaymentMethod): string {
  switch (method) {
    case 'credit':
    case 'credit-installment':
      return 'Credit';
    case 'atm':
      return 'ATM';
    case 'cvs':
      return 'CVS';
    case 'cvs-barcode':
      return 'BARCODE';
    case 'webatm':
      return 'WebATM';
    case 'applepay':
      return 'ApplePay';
    case 'googlepay':
      return 'GooglePay';
    case 'taiwanpay':
      return 'TWQR';
    default:
      return 'ALL'; // 顯示全部由用戶選
  }
}
