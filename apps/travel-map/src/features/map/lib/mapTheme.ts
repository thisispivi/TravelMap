import type { StyleSpecification } from "maplibre-gl";

import { Design } from "@/shared/lib/design";

/**
 * Colors shared by every layer in one map theme.
 * @property {string} ocean - The ocean fill color
 * @property {string} land - The land fill color
 * @property {string} border - The country border color
 * @property {string} countryLabel - The country label color
 * @property {string} countryLabelHalo - The country label halo color
 * @property {string} cityLabel - The city label color
 * @property {string} cityLabelHalo - The city label halo color
 * @property {number} countryStrength - How much of a visited country's own
 * colour shows through the land tone, from 0 (none) to 1 (as authored)
 * @property {string} [countryInk] - When set, every visited country is printed
 * in this one `hsla(…)` ink instead of its own colour
 */
export interface MapTheme {
  ocean: string;
  land: string;
  border: string;
  countryLabel: string;
  countryLabelHalo: string;
  cityLabel: string;
  cityLabelHalo: string;
  countryStrength: number;
  countryInk?: string;
}

/**
 * An RGB color represented by red, green, and blue channels.
 */
type RgbColor = [number, number, number];

const GLYPHS_URL = "/glyphs/{fontstack}/{range}.pbf";

export const MAP_THEMES: Record<Design, Record<"dark" | "light", MapTheme>> = {
  classic: {
    dark: {
      ocean: "#18191a",
      land: "#242526",
      border: "rgba(255, 255, 255, 0.14)",
      countryLabel: "#8a8d91",
      countryLabelHalo: "#18191a",
      cityLabel: "#e4e6eb",
      cityLabelHalo: "rgba(24, 25, 26, 0.94)",
      countryStrength: 1,
    },
    light: {
      ocean: "#eef1f5",
      land: "#dfe3ea",
      border: "rgba(60, 70, 90, 0.16)",
      countryLabel: "#676b7d",
      countryLabelHalo: "#e7e8ec",
      cityLabel: "#1a1a2e",
      cityLabelHalo: "rgba(240, 242, 245, 0.96)",
      countryStrength: 1,
    },
  },
  passport: {
    dark: {
      ocean: "#0c1322",
      land: "#182235",
      border: "rgba(201, 165, 74, 0.3)",
      countryLabel: "#9a917a",
      countryLabelHalo: "#0c1322",
      cityLabel: "#efe6cf",
      cityLabelHalo: "rgba(12, 19, 34, 0.94)",
      countryStrength: 0.45,
    },
    light: {
      ocean: "#d7e4df",
      land: "#f3efe2",
      border: "rgba(31, 42, 68, 0.3)",
      countryLabel: "#6b6a5c",
      countryLabelHalo: "#f3efe2",
      cityLabel: "#1f2a44",
      cityLabelHalo: "rgba(243, 239, 226, 0.96)",
      countryStrength: 0.45,
    },
  },
  risograph: {
    dark: {
      ocean: "#141414",
      land: "#232323",
      border: "rgba(255, 232, 0, 0.35)",
      countryLabel: "#8f887b",
      countryLabelHalo: "#141414",
      cityLabel: "#f4efe4",
      cityLabelHalo: "rgba(20, 20, 20, 0.94)",
      countryStrength: 1,
      countryInk: "hsla(326, 100%, 64%, 0.6)",
    },
    light: {
      ocean: "#cfe3ee",
      land: "#f2ece0",
      border: "rgba(0, 120, 191, 0.45)",
      countryLabel: "#4f5a96",
      countryLabelHalo: "#f2ece0",
      cityLabel: "#1d2a6b",
      cityLabelHalo: "rgba(242, 236, 224, 0.96)",
      countryStrength: 1,
      countryInk: "hsla(326, 100%, 64%, 0.55)",
    },
  },
  softness: {
    dark: {
      ocean: "#1a1722",
      land: "#262130",
      border: "rgba(255, 255, 255, 0.08)",
      countryLabel: "#8c8296",
      countryLabelHalo: "#1a1722",
      cityLabel: "#efe8f2",
      cityLabelHalo: "rgba(26, 23, 34, 0.94)",
      countryStrength: 0.5,
    },
    light: {
      ocean: "#e8eef0",
      land: "#f7f2ec",
      border: "rgba(120, 100, 110, 0.14)",
      countryLabel: "#8a7f88",
      countryLabelHalo: "#f7f2ec",
      cityLabel: "#3d3540",
      cityLabelHalo: "rgba(247, 242, 236, 0.96)",
      countryStrength: 0.55,
    },
  },
  "neo-brutalism": {
    dark: {
      ocean: "#121212",
      land: "#262626",
      border: "rgba(244, 241, 234, 0.4)",
      countryLabel: "#9a958a",
      countryLabelHalo: "#121212",
      cityLabel: "#f4f1ea",
      cityLabelHalo: "rgba(18, 18, 18, 0.94)",
      countryStrength: 0.9,
    },
    light: {
      ocean: "#a8d8ff",
      land: "#fff4e0",
      border: "rgba(17, 17, 17, 0.6)",
      countryLabel: "#4a4a4a",
      countryLabelHalo: "#fff4e0",
      cityLabel: "#111111",
      cityLabelHalo: "rgba(255, 244, 224, 0.96)",
      countryStrength: 1,
    },
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
 * @param {number} strength - Scales the fill's own opacity, so a theme can
 * mute the dataset's colours without editing them
 * @returns {string} The composited opaque RGB color
 */
export function toOpaqueFill(
  hsla: string,
  baseHex: string,
  strength: number,
): string {
  const [hue, saturation, lightness, opacity = 1] = hsla
    .replace(/hsla?\(|\)|%/g, "")
    .split(",")
    .map(Number);
  const foreground = hslToRgb(hue, saturation, lightness);
  const background = hexToRgb(baseHex);
  const [red, green, blue] = foreground.map((channel, index) =>
    Math.round(
      channel * opacity * strength +
        background[index] * (1 - opacity * strength),
    ),
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
