import { ColorData } from "@travelmap/core";

/* WCAG AA for text; the stamp's small lines are read at this contrast. */
const MIN_CONTRAST = 4.5;
const LIGHTNESS_STEP = 2;

/**
 * Converts HSL channels to red, green and blue.
 * @param {ColorData} color - The colour
 * @param {number} color.h - The hue
 * @param {number} color.s - The saturation
 * @param {number} color.l - The lightness
 * @returns {number[]} The channels, from zero to one
 */
function toRgb({ h, s, l }: ColorData): number[] {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = saturation * Math.min(lightness, 1 - lightness);
  return [0, 8, 4].map((offset) => {
    const k = (offset + h / 30) % 12;
    return lightness - chroma * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  });
}

/**
 * Reads a colour's relative luminance, as WCAG defines it.
 * @param {number[]} rgb - The channels, from zero to one
 * @returns {number} The luminance, from zero to one
 */
function luminance(rgb: number[]): number {
  const [red = 0, green = 0, blue = 0] = rgb.map((channel) =>
    channel <= 0.039_28 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * Reads a `#rrggbb` colour's channels.
 * @param {string} hex - The colour
 * @returns {number[]} The channels, from zero to one
 */
function hexToRgb(hex: string): number[] {
  return [1, 3, 5].map(
    (start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255,
  );
}

/**
 * Measures the contrast of a colour against a page.
 * @param {ColorData} color - The colour
 * @param {string} paper - The page's `#rrggbb` colour
 * @returns {number} The WCAG contrast ratio
 */
export function contrastOn(color: ColorData, paper: string): number {
  const first = luminance(toRgb(color));
  const second = luminance(hexToRgb(paper));
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/**
 * Finds the ink a country's colour becomes on a page: the same hue, darkened on
 * pale paper and lightened on dark paper only as far as legibility asks, so
 * stamps stay as different from each other as the countries' colours are.
 * @param {ColorData} color - The country's colour
 * @param {string} paper - The page's `#rrggbb` colour
 * @returns {ColorData} The ink
 */
export function inkFor(color: ColorData, paper: string): ColorData {
  const direction = luminance(hexToRgb(paper)) > 0.18 ? -1 : 1;
  let { l } = color;
  while (contrastOn({ ...color, l }, paper) < MIN_CONTRAST && l > 0 && l < 100)
    l += direction * LIGHTNESS_STEP;
  return { ...color, l: Math.max(0, Math.min(100, l)) };
}
