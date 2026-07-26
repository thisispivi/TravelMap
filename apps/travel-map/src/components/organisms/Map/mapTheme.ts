import type { StyleSpecification } from "maplibre-gl";

/**
 * Colors shared by every layer in one map theme.
 * @property {string} ocean - The ocean fill color
 * @property {string} land - The land fill color
 * @property {string} border - The country border color
 * @property {string} countryLabel - The country label color
 * @property {string} countryLabelHalo - The country label halo color
 * @property {string} cityLabel - The city label color
 * @property {string} cityLabelHalo - The city label halo color
 */
export interface MapTheme {
  ocean: string;
  land: string;
  border: string;
  countryLabel: string;
  countryLabelHalo: string;
  cityLabel: string;
  cityLabelHalo: string;
}

/**
 * An RGB color represented by red, green, and blue channels.
 */
type RgbColor = [number, number, number];

const GLYPHS_URL = "/glyphs/{fontstack}/{range}.pbf";

export const MAP_THEMES: Record<"dark" | "light", MapTheme> = {
  dark: {
    ocean: "#0a0a12",
    land: "#181a26",
    border: "rgba(138, 142, 164, 0.22)",
    countryLabel: "#8a8ea4",
    countryLabelHalo: "#11131c",
    cityLabel: "#e4e6f0",
    cityLabelHalo: "rgba(10, 10, 18, 0.94)",
  },
  light: {
    ocean: "#eef1f5",
    land: "#dfe3ea",
    border: "rgba(60, 70, 90, 0.16)",
    countryLabel: "#676b7d",
    countryLabelHalo: "#e7e8ec",
    cityLabel: "#1a1a2e",
    cityLabelHalo: "rgba(240, 242, 245, 0.96)",
  },
};

/**
 * Converts a hexadecimal color to RGB channels.
 * @param {string} hex - The hexadecimal color
 * @returns {RgbColor} The red, green, and blue channels
 */
function hexToRgb(hex: string): RgbColor {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/**
 * Converts HSL channels to RGB channels.
 * @param {number} hue - The hue in degrees
 * @param {number} saturation - The saturation percentage
 * @param {number} lightness - The lightness percentage
 * @returns {RgbColor} The red, green, and blue channels
 */
function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number,
): RgbColor {
  const normalizedSaturation = saturation / 100;
  const normalizedLightness = lightness / 100;
  const chroma =
    (1 - Math.abs(2 * normalizedLightness - 1)) * normalizedSaturation;
  const hueSegment = hue / 60;
  const secondaryChannel = chroma * (1 - Math.abs((hueSegment % 2) - 1));
  const [red, green, blue] = (
    hueSegment < 1
      ? [chroma, secondaryChannel, 0]
      : hueSegment < 2
        ? [secondaryChannel, chroma, 0]
        : hueSegment < 3
          ? [0, chroma, secondaryChannel]
          : hueSegment < 4
            ? [0, secondaryChannel, chroma]
            : hueSegment < 5
              ? [secondaryChannel, 0, chroma]
              : [chroma, 0, secondaryChannel]
  ) as RgbColor;
  const channelOffset = normalizedLightness - chroma / 2;

  return [red, green, blue].map((channel) =>
    Math.round((channel + channelOffset) * 255),
  ) as RgbColor;
}

/**
 * Alpha-composites a translucent country fill over the land tone. Opaque
 * GeoJSON fills prevent internal tile seams from appearing as hairlines.
 * @param {string} hsla - A country fill color such as `hsla(210, 60%, 50%, 0.6)`
 * @param {string} baseHex - The hexadecimal land color beneath the fill
 * @returns {string} The composited opaque RGB color
 */
export function toOpaqueFill(hsla: string, baseHex: string): string {
  const [hue, saturation, lightness, opacity = 1] = hsla
    .replace(/hsla?\(|\)|%/g, "")
    .split(",")
    .map(Number);
  const foreground = hslToRgb(hue, saturation, lightness);
  const background = hexToRgb(baseHex);
  const [red, green, blue] = foreground.map((channel, index) =>
    Math.round(channel * opacity + background[index] * (1 - opacity)),
  );

  return `rgb(${red}, ${green}, ${blue})`;
}

/**
 * Creates the minimal MapLibre style used beneath the custom data layers.
 * @param {MapTheme} theme - The active map theme
 * @returns {StyleSpecification} The MapLibre base style
 */
export function createMapStyle(theme: MapTheme): StyleSpecification {
  return {
    version: 8,
    glyphs: GLYPHS_URL,
    sources: {},
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": theme.ocean },
      },
    ],
  };
}
