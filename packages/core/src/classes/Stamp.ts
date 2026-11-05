/* Every frame shares a 120×120 canvas, so any stamp fits any slot of a page. */
export const STAMP_FRAMES = [
  "arch",
  "banner",
  "circle",
  "clipped",
  "diamond",
  "doubleRing",
  "hexagon",
  "octagon",
  "oval",
  "pentagon",
  "postage",
  "rectangle",
  "rounded",
  "seal",
  "shield",
  "ticket",
] as const;

/** One of the shapes a stamp can be struck in. */
export type StampFrame = (typeof STAMP_FRAMES)[number];

/** How a stamp sets its country's name. */
export type StampTextStyle = "curved" | "caps" | "tracked" | "title";

/**
 * How a country's passport stamp is struck.
 * @property {StampFrame} frame - Its shape
 * @property {StampTextStyle} textStyle - How the country's name is set
 */
export interface StampData {
  frame: StampFrame;
  textStyle: StampTextStyle;
}

/**
 * Tilts a stamp as a hand would, the same way on every visit: the angle is a hash
 * of the country's code, so a reload never reshuffles the page.
 * @param {string} code - The country's code
 * @returns {number} The angle in degrees, within ±6
 */
function tiltOf(code: string): number {
  let hash = 2_166_136_261;
  for (const char of code)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16_777_619);
  return (((hash >>> 0) % 1201) - 600) / 100;
}

/**
 * A country's passport stamp: its shape, how it sets the name, the angle it is
 * struck at, and the drawing in its middle.
 * @class
 * @param {string} code - The country's code
 * @param {StampData} data - How the stamp is struck
 * @param {StampFrame} data.frame - Its shape
 * @param {StampTextStyle} data.textStyle - How the name is set
 */
export class Stamp {
  frame: StampFrame;
  textStyle: StampTextStyle;
  tilt: number;
  emblem: string;

  /**
   * Creates a country's stamp.
   * @param {string} code - The country's code, which names its drawing and sets its tilt
   * @param {StampData} data - How the stamp is struck
   * @param {StampFrame} data.frame - Its shape
   * @param {StampTextStyle} data.textStyle - How the name is set
   */
  constructor(code: string, { frame, textStyle }: StampData) {
    this.frame = frame;
    this.textStyle = textStyle;
    this.tilt = tiltOf(code);
    this.emblem = `/stamp-emblems/${code}.webp`;
  }
}
