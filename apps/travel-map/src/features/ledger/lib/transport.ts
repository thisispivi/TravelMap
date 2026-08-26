import { City, LedgerSpan, TransportMode } from "@travelmap/core";

import variables from "@/styles/_variables.module.scss";

const MODE_COLORS: Record<TransportMode, string> = {
  plane: variables.modePlane,
  ferry: variables.modeFerry,
  train: variables.modeTrain,
  car: variables.modeCar,
  bus: variables.modeBus,
  taxi: variables.modeTaxi,
  walk: variables.modeWalk,
};

/**
 * Reads the colour a transport mode is drawn in. Modes are the record's marks,
 * so they keep their saturation wherever they appear.
 * @param {TransportMode} mode - The mode to colour
 * @returns {string} Its colour
 */
function modeColor(mode: TransportMode): string {
  return MODE_COLORS[mode];
}

/**
 * Reads the colour a stay is drawn in, taken from its country's authored hue
 * and muted so the ground never competes with the motion drawn across it.
 * @param {City} city - The city stayed in
 * @param {boolean} isDark - Whether the record is being read on a dark ground
 * @returns {string} The stay's colour
 */
function stayColor(city: City, isDark: boolean): string {
  const { h, s, l } = city.country.color;
  return isDark
    ? `hsl(${h} ${Math.round(s * 0.42)}% ${Math.round(l * 0.42)}%)`
    : `hsl(${h} ${Math.round(s * 0.5)}% ${Math.min(92, Math.round(l * 1.3))}%)`;
}

/**
 * Reads the colour any span is drawn in.
 * @param {LedgerSpan} span - The span to colour
 * @param {boolean} isDark - Whether the record is being read on a dark ground
 * @returns {string} The span's colour
 */
export function spanColor(span: LedgerSpan, isDark: boolean): string {
  return span.kind === "passage"
    ? modeColor(span.mode)
    : stayColor(span.city, isDark);
}
