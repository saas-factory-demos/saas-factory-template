/**
 * TOTP session cookie 的純常數，與 node:crypto 解耦，
 * 讓 edge middleware 可以 import 而不會把 node:crypto bundle 進去。
 */

export const TOTP_SESSION_COOKIE_NAME = 'sf-totp-session';
export const TOTP_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
