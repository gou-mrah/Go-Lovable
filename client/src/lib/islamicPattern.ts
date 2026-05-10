/**
 * Islamic 8-Pointed Star Pattern (Khatam)
 * Official decorative pattern for Go Umrah platform.
 *
 * The pattern consists of:
 * - 8-pointed stars (polygon with 16 vertices alternating outer/inner radii)
 * - Circular arcs connecting star tips
 * - Small cross/plus shapes at interstitial spaces
 *
 * Usage:
 *   import { PATTERN_GOLD_ON_DARK, PATTERN_TEAL_ON_LIGHT } from "@/lib/islamicPattern";
 *   style={{ backgroundImage: PATTERN_GOLD_ON_DARK, backgroundSize: "200px 200px" }}
 */

const STAR_SVG = (strokeColor: string, strokeWidth: number) =>
  `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><g fill='none' stroke='${strokeColor}' stroke-width='${strokeWidth}'><polygon points="100.00,58.00 108.42,79.67 129.70,70.30 120.33,91.58 142.00,100.00 120.33,108.42 129.70,129.70 108.42,120.33 100.00,142.00 91.58,120.33 70.30,129.70 79.67,108.42 58.00,100.00 79.67,91.58 70.30,70.30 91.58,79.67"/><circle cx="100.0" cy="100.0" r="52.0"/><polygon points="0.00,-42.00 8.42,-20.33 29.70,-29.70 20.33,-8.42 42.00,0.00 20.33,8.42 29.70,29.70 8.42,20.33 0.00,42.00 -8.42,20.33 -29.70,29.70 -20.33,8.42 -42.00,0.00 -20.33,-8.42 -29.70,-29.70 -8.42,-20.33"/><circle cx="0.0" cy="0.0" r="52.0"/><polygon points="200.00,-42.00 208.42,-20.33 229.70,-29.70 220.33,-8.42 242.00,0.00 220.33,8.42 229.70,29.70 208.42,20.33 200.00,42.00 191.58,20.33 170.30,29.70 179.67,8.42 158.00,0.00 179.67,-8.42 170.30,-29.70 191.58,-20.33"/><circle cx="200.0" cy="0.0" r="52.0"/><polygon points="0.00,158.00 8.42,179.67 29.70,170.30 20.33,191.58 42.00,200.00 20.33,208.42 29.70,229.70 8.42,220.33 0.00,242.00 -8.42,220.33 -29.70,229.70 -20.33,208.42 -42.00,200.00 -20.33,191.58 -29.70,170.30 -8.42,179.67"/><circle cx="0.0" cy="200.0" r="52.0"/><polygon points="200.00,158.00 208.42,179.67 229.70,170.30 220.33,191.58 242.00,200.00 220.33,208.42 229.70,229.70 208.42,220.33 200.00,242.00 191.58,220.33 170.30,229.70 179.67,208.42 158.00,200.00 179.67,191.58 170.30,170.30 191.58,179.67"/><circle cx="200.0" cy="200.0" r="52.0"/><rect x="86.00" y="-8.00" width="28.00" height="16.00"/><rect x="92.00" y="-14.00" width="16.00" height="28.00"/><rect x="86.00" y="192.00" width="28.00" height="16.00"/><rect x="92.00" y="186.00" width="16.00" height="28.00"/><rect x="-14.00" y="92.00" width="28.00" height="16.00"/><rect x="-8.00" y="86.00" width="16.00" height="28.00"/><rect x="186.00" y="92.00" width="28.00" height="16.00"/><rect x="192.00" y="86.00" width="16.00" height="28.00"/><rect x="36.00" y="42.00" width="28.00" height="16.00"/><rect x="42.00" y="36.00" width="16.00" height="28.00"/><rect x="136.00" y="42.00" width="28.00" height="16.00"/><rect x="142.00" y="36.00" width="16.00" height="28.00"/><rect x="36.00" y="142.00" width="28.00" height="16.00"/><rect x="42.00" y="136.00" width="16.00" height="28.00"/><rect x="136.00" y="142.00" width="28.00" height="16.00"/><rect x="142.00" y="136.00" width="16.00" height="28.00"/></g></svg>`;

const encode = (svg: string) => `url("data:image/svg+xml,${svg}")`;

/** Gold on dark teal — for dark green sections (hero, CTA, footer) */
export const PATTERN_GOLD_ON_DARK = encode(STAR_SVG("%23C9A96E", 0.9));

/** Teal on light — for white/cream sections */
export const PATTERN_TEAL_ON_LIGHT = encode(STAR_SVG("%231B5E52", 0.8));

/** White on dark — for very dark overlays */
export const PATTERN_WHITE_ON_DARK = encode(STAR_SVG("%23ffffff", 0.7));

/** Gold subtle — for medium-contrast sections */
export const PATTERN_GOLD_SUBTLE = encode(STAR_SVG("%23C9A96E", 0.7));

/** Standard background-size for all patterns */
export const PATTERN_SIZE = "200px 200px";

/**
 * Convenience helper — returns style object for a pattern overlay div.
 * Usage: <div className="absolute inset-0" style={patternStyle("gold_on_dark", 0.08)} />
 */
export function patternStyle(
  variant: "gold_on_dark" | "teal_on_light" | "white_on_dark" | "gold_subtle" = "gold_on_dark",
  opacity = 0.08
): React.CSSProperties {
  const map = {
    gold_on_dark: PATTERN_GOLD_ON_DARK,
    teal_on_light: PATTERN_TEAL_ON_LIGHT,
    white_on_dark: PATTERN_WHITE_ON_DARK,
    gold_subtle: PATTERN_GOLD_SUBTLE,
  };
  return {
    backgroundImage: map[variant],
    backgroundSize: PATTERN_SIZE,
    backgroundRepeat: "repeat",
    opacity,
    pointerEvents: "none",
  };
}
