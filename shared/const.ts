export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// ─── Currency conversion (SAR pegged to USD) ─────────────────────────────────
// Single source of truth — replaces hardcoded 3.75 scattered across codebase.
export const USD_TO_SAR_RATE = 3.75;
export const usdToSar = (usd: number): number => usd * USD_TO_SAR_RATE;
export const sarToUsd = (sar: number): number => sar / USD_TO_SAR_RATE;

