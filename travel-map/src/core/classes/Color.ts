export interface ColorData {
  h: number;
  s: number;
  l: number;
}

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
