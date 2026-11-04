import { describe, expect, it } from "vitest";

import { contrastOn, inkFor } from "./stampInk";

describe("inkFor", () => {
  const PALE = "#f7f1e1";
  const DARK = "#2a2823";

  it.each([
    { h: 48, l: 50, s: 95 },
    { h: 84, l: 44, s: 81 },
    { h: 330, l: 70, s: 70 },
    { h: 0, l: 50, s: 100 },
    { h: 195, l: 90, s: 85 },
    { h: 240, l: 8, s: 60 },
  ])("reaches AA on both papers from %o", (color) => {
    expect(contrastOn(inkFor(color, PALE), PALE)).toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(inkFor(color, DARK), DARK)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the hue of the country's colour", () => {
    expect(inkFor({ h: 48, l: 50, s: 95 }, PALE).h).toBe(48);
  });
});
