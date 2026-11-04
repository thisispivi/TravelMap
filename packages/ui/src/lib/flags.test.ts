import { readdirSync } from "node:fs";

import { COUNTRIES } from "@travelmap/core";
import { describe, expect, it } from "vitest";

import { flagUrl } from "./flags";

const FLAGS = new Set(
  readdirSync(`${import.meta.dirname}/../../public/flags`).map((file) =>
    file.replace(/\.svg$/, ""),
  ),
);

describe("flags", () => {
  it("names a flag by its country's code", () => {
    expect(flagUrl("IT")).toBe("/flags/IT.svg");
  });

  it("has a flag for every country of the catalogue", () => {
    for (const code of COUNTRIES.keys())
      expect(FLAGS.has(code), code).toBe(true);
  });

  it("keeps the European Union's flag for the euro", () => {
    expect(FLAGS.has("EU")).toBe(true);
  });
});
