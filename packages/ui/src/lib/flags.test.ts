import { COUNTRIES } from "@travelmap/core";
import { describe, expect, it } from "vitest";

import { hasFlag } from "./flagPack";
import { flagUrl } from "./flags";

/* Twemoji draws no flag for these, so their flag stays hidden. */
const FLAGLESS = ["XG", "XN", "XS"];

describe("flags", () => {
  it("names a flag by its country's code", () => {
    expect(flagUrl("IT")).toBe("/flags/IT.svg");
  });

  it("has a flag for every country of the catalogue but the flagless ones", () => {
    for (const code of COUNTRIES.keys())
      expect(hasFlag(code), code).toBe(!FLAGLESS.includes(code));
  });

  it("keeps the European Union's flag for the euro", () => {
    expect(hasFlag("EU")).toBe(true);
  });
});
