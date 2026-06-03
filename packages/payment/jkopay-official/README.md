# @saas-factory/payment-jkopay-official

街口支付官方 OpenAPI。

Lock：ADR-0011 §02-01 v1 stub（藍新含街口入口；自簽合約才開）。

簽章：HMAC-SHA256(`${apiKey}${nonce}${timestamp}${body}`, secret) → hex。
