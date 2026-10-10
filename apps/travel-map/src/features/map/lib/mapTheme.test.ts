import { describe, expect, it } from "vitest";

import { toOpaqueFill } from "./mapTheme";

describe("toOpaqueFill", () => {
  it("composites the authored opacity over the land at full strength", () => {
    expect(toOpaqueFill("hsla(0, 100%, 50%, 0.5)", "#000000", 1)).toBe(
      "rgb(128, 0, 0)",
    );
  });

  it("scales the authored opacity down with a lower strength", () => {
    expect(toOpaqueFill("hsla(0, 100%, 50%, 0.5)", "#000000", 0.5)).toBe(
      "rgb(64, 0, 0)",
    );
  });

  it("returns the land tone untouched at zero strength", () => {
    expect(toOpaqueFill("hsla(0, 100%, 50%, 1)", "#336699", 0)).toBe(
      "rgb(51, 102, 153)",
    );
  });
});
