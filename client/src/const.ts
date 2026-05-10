export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Custom login URL — points to the branded Go Umrah login page (no Manus OAuth)
export const getLoginUrl = (returnPath?: string) => {
  const base = "/login";
  if (returnPath) return `${base}?returnTo=${encodeURIComponent(returnPath)}`;
  return base;
};
