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

/**
 * Reads the active design's map palette from the `--map-*` custom properties
 * its stylesheet sets on `:root`, so a design's colours have one home. MapLibre
 * paints on a canvas and cannot resolve `var()`, hence the computed values.
 * @param {boolean} isDarkTheme - Whether to read the dark or the light palette
 * @param {Pick<CSSStyleDeclaration, "getPropertyValue">} [style] - Where the
 * tokens are read from; the document root unless a test passes a stand-in
 * @returns {MapTheme} The map palette for the design applied to the document
 */
export function readMapTheme(
  isDarkTheme: boolean,
  style: Pick<CSSStyleDeclaration, "getPropertyValue"> = getComputedStyle(
    document.documentElement,
  ),
): MapTheme {
  const mode = isDarkTheme ? "dark" : "light";

  /**
   * Reads one map token for the current mode.
   * @param {string} name - The token name without its `--map-` prefix and mode
   * @returns {string} The trimmed token value, empty when the design omits it
   */
  const token = (name: string): string =>
    style.getPropertyValue(`--map-${name}-${mode}`).trim();

  return {
    ocean: token("ocean"),
    land: token("land"),
    border: token("border"),
    countryLabel: token("country-label"),
    countryLabelHalo: token("country-label-halo"),
    cityLabel: token("city-label"),
    cityLabelHalo: token("city-label-halo"),
    countryStrength: Number(token("country-strength")),
    countryInk: token("country-ink") || undefined,
  };
}

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
