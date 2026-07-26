/**
 * Raw HSL channel values used to construct a Color instance.
 * @property {number} h - The hue channel
 * @property {number} s - The saturation channel
 * @property {number} l - The lightness channel
 */
export interface ColorData {
  h: number;
  s: number;
  l: number;
}

/**
 * HSL color utility — stores hue/saturation/lightness and serialises to CSS strings.
 * @class
 * @param {ColorData} color - The raw HSL channels
 * @param {number} color.h - The hue channel
 * @param {number} color.s - The saturation channel
 * @param {number} color.l - The lightness channel
 */
export class Color {
  h: number;
  s: number;
  l: number;

  /**
   * Creates a color from raw HSL channels.
   * @param {ColorData} color - The source HSL channels
   */
  constructor(color: ColorData) {
    this.h = color.h;
    this.s = color.s;
    this.l = color.l;
  }

  /**
   * Serializes the color as a CSS HSL value.
   * @returns {string} The CSS HSL color
   */
  toHSL(): string {
    return `hsl(${this.h}, ${this.s}%, ${this.l}%)`;
  }

  /**
   * Serializes the color as a CSS HSLA value.
   * @param {number} alpha - The alpha channel from zero to one
   * @returns {string} The CSS HSLA color
   */
  toHSLA(alpha: number): string {
    return `hsla(${this.h}, ${this.s}%, ${this.l}%, ${alpha})`;
  }
}
