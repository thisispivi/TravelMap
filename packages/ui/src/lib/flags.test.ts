import { describe, expect, it } from "vitest";

import { hasFlag } from "./flagPack";
import { flagUrl } from "./flags";

describe("flags", () => {
  it("leads an abbreviated map name to the flag the pack spells out", () => {
    expect(flagUrl("BosniaAndHerz")).toBe("/flags/BosniaAndHerzegovina.svg");
    expect(hasFlag("BosniaAndHerz")).toBe(true);
  });

  it("uses a country id that already is a flag's name as it stands", () => {
    expect(flagUrl("Italy")).toBe("/flags/Italy.svg");
    expect(hasFlag("Italy")).toBe(true);
  });

  it("knows the pack has no flag for a made-up country", () => {
    expect(hasFlag("Atlantis")).toBe(false);
  });
});
