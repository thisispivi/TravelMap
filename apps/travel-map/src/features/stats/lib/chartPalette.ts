import variables from "@/styles/_variables.module.scss";

/**
 * Colours the statistics charts draw with. Charts read the application tokens
 * rather than carrying their own palette, so a chart cannot introduce a hue the
 * rest of the interface never uses.
 * @property {string} primary - The accent used for the leading series
 * @property {string} secondary - The neutral used for a second series
 * @property {readonly string[]} flightRamp - Tints of the plane colour, lightest first
 */
export const chartPalette = {
  primary: variables.pin,
  secondary: variables.darkInkFaint,
  /* The three flight categories are one thing measured three ways, so they get
     a ramp of the map's plane colour rather than three unrelated hues. */
  flightRamp: ["#d3b1fb", "#be80f9", variables.transportPlane],
} as const;
