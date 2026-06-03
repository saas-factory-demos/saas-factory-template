/**
 * Payload v3 collection 定義（發票模組所有權，goal 02 §10）。
 *
 * 三個 collection：
 * - `invoices`：開立的發票
 * - `invoice-allowances`：折讓單
 * - `invoice-logs`：所有 provider 互動（issue/void/query）日誌
 *
 * 後續 goal 03 / 04 / 05 只 consume，不再擴 schema。
 */

import type { CollectionConfig } from 'payload';

/**
 * `invoices` collection：對應 InvoiceResult，並保存 issue 時的 buyer / carrier。
 */
export const InvoicesCollection: CollectionConfig = {
  slug: 'invoices',
  admin: {
    useAsTitle: 'invoiceNumber',
    defaultColumns: ['invoiceNumber', 'orderId', 'totalAmount', 'status'],
    group: '發票',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'orderId', type: 'text', required: true, index: true },
    { name: 'invoiceNumber', type: 'text', required: true, index: true },
    { name: 'provider', type: 'select', required: true, options: [
      { label: '藍新 ezPay', value: 'ezpay' },
      { label: '綠界發票', value: 'ecpay-invoice' },
    ] },
    { name: 'category', type: 'select', required: true, options: [
      { label: 'B2C 個人', value: 'B2C' },
      { label: 'B2B 公司', value: 'B2B' },
    ] },
    { name: 'issueMode', type: 'select', defaultValue: 'immediate', options: [
      { label: '即時', value: 'immediate' },
      { label: '觸發', value: 'on-trigger' },
      { label: '預約', value: 'scheduled' },
    ] },
    { name: 'scheduledAt', type: 'date' },
    { name: 'issuedAt', type: 'date', required: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'pending', options: [
      { label: '已開立', value: 'issued' },
      { label: '已作廢', value: 'voided' },
      { label: '待開立', value: 'pending' },
    ] },
    { name: 'totalAmount', type: 'number', required: true },
    { name: 'taxAmount', type: 'number' },
    { name: 'taxType', type: 'select', options: [
      { label: '應稅', value: 'taxable' },
      { label: '零稅率', value: 'zero-tax' },
      { label: '免稅', value: 'tax-free' },
      { label: '混合', value: 'mixed' },
    ] },
    { name: 'carrier', type: 'group', fields: [
      { name: 'type', type: 'select', required: true, options: [
        { label: '手機條碼', value: 'mobile-barcode' },
        { label: '自然人憑證', value: 'natural-person-cert' },
        { label: '公司統編', value: 'company-tax-id' },
        { label: '捐贈', value: 'donation' },
        { label: '會員載具', value: 'member' },
        { label: '紙本', value: 'paper' },
      ] },
      { name: 'value', type: 'text' },
      { name: 'donationCode', type: 'text' },
    ] },
    { name: 'buyer', type: 'group', fields: [
      { name: 'name', type: 'text' },
      { name: 'taxId', type: 'text' },
      { name: 'address', type: 'text' },
      { name: 'email', type: 'email' },
      { name: 'phone', type: 'text' },
    ] },
    { name: 'items', type: 'array', fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'quantity', type: 'number', required: true },
      { name: 'unitPrice', type: 'number', required: true },
      { name: 'unit', type: 'text' },
      { name: 'taxType', type: 'text' },
      { name: 'category', type: 'text' },
    ] },
    { name: 'raw', type: 'json', admin: { description: 'Provider 回傳原始資料' } },
  ],
};

/**
 * `invoice-allowances` collection：折讓單。
 */
export const InvoiceAllowancesCollection: CollectionConfig = {
  slug: 'invoice-allowances',
  admin: {
    useAsTitle: 'allowanceNumber',
    defaultColumns: ['allowanceNumber', 'invoiceId', 'amount', 'status'],
    group: '發票',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'invoiceId', type: 'text', required: true, index: true },
    { name: 'allowanceNumber', type: 'text', required: true, index: true },
    { name: 'amount', type: 'number', required: true },
    { name: 'taxAmount', type: 'number' },
    { name: 'reason', type: 'textarea' },
    { name: 'status', type: 'select', required: true, options: [
      { label: '已開立', value: 'issued' },
      { label: '失敗', value: 'failed' },
    ] },
    { name: 'items', type: 'array', fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'quantity', type: 'number', required: true },
      { name: 'unitPrice', type: 'number', required: true },
    ] },
    { name: 'raw', type: 'json' },
  ],
};

/**
 * `invoice-logs` collection：每次與 provider 互動的審計記錄。
 */
export const InvoiceLogsCollection: CollectionConfig = {
  slug: 'invoice-logs',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'orderId', 'provider', 'success', 'createdAt'],
    group: '發票',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'orderId', type: 'text', index: true },
    { name: 'invoiceId', type: 'text', index: true },
    { name: 'provider', type: 'select', required: true, options: [
      { label: '藍新 ezPay', value: 'ezpay' },
      { label: '綠界發票', value: 'ecpay-invoice' },
    ] },
    { name: 'action', type: 'select', required: true, options: [
      { label: '開立', value: 'issue' },
      { label: '折讓', value: 'issueAllowance' },
      { label: '作廢', value: 'void' },
      { label: '查詢', value: 'query' },
    ] },
    { name: 'success', type: 'checkbox', defaultValue: false },
    { name: 'error', type: 'textarea' },
    { name: 'request', type: 'json' },
    { name: 'response', type: 'json' },
  ],
};
