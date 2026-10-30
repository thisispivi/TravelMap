import { describe, expect, it } from "vitest";

import { readMapTheme, toOpaqueFill } from "./mapTheme";

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

describe("readMapTheme", () => {
  const tokens: Record<string, string> = {
    "--map-land-dark": " #242526",
    "--map-country-strength-dark": "0.45",
    "--map-country-ink-light": "hsla(0, 0%, 100%, 1)",
  };
  const style = { getPropertyValue: (name: string) => tokens[name] ?? "" };

  it("reads the requested mode's tokens, trimmed and typed", () => {
    expect(readMapTheme(true, style)).toMatchObject({
      countryStrength: 0.45,
      land: "#242526",
    });
  });

  it("leaves the country ink unset when the design does not print one", () => {
    expect(readMapTheme(true, style).countryInk).toBeUndefined();
    expect(readMapTheme(false, style).countryInk).toBe("hsla(0, 0%, 100%, 1)");
  });
});
