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

  constructor(color: ColorData) {
    this.h = color.h;
    this.s = color.s;
    this.l = color.l;
  }

  toHSL() {
    return `hsl(${this.h}, ${this.s}%, ${this.l}%)`;
  }

  toHSLA(a: number) {
    return `hsla(${this.h}, ${this.s}%, ${this.l}%, ${a})`;
  }
}
