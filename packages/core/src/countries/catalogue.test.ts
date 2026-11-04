import { describe, expect, it } from "vitest";

import { STAMP_FRAMES } from "../classes/Stamp";
import { Continent } from "../typings/Continent";
import { COUNTRIES, countryOnMap, findCountry } from "./catalogue";

const countries = [...COUNTRIES.values()];

describe("the country catalogue", () => {
  it("keys every country by a two-letter upper-case code", () => {
    for (const code of COUNTRIES.keys()) expect(code).toMatch(/^[A-Z]{2}$/);
  });

  it("gives each map polygon to exactly one country", () => {
    const names = countries.map(({ mapName }) => mapName);
    expect(new Set(names).size).toBe(names.length);
    expect(countryOnMap("Bosnia and Herz.")?.id).toBe("BA");
  });

  it("finds a country by its code with its stamp and cover", () => {
    const italy = findCountry("IT");
    expect(italy?.getLocalizedName("it-IT")).toBe("Italia");
    expect(italy?.continent).toBe(Continent.EUROPE);
    expect(italy?.passportCover).toBe("red");
    expect(italy?.stamp.emblem).toBe("/stamp-emblems/IT.webp");
    expect(findCountry("US")?.passportCover).toBe("blue");
    expect(findCountry("Italy")).toBeUndefined();
  });

  it("keeps any one frame to at most 15% of the countries", () => {
    for (const frame of STAMP_FRAMES) {
      const uses = countries.filter(({ stamp }) => stamp.frame === frame);
      expect(uses.length, frame).toBeGreaterThan(0);
      expect(uses.length / countries.length, frame).toBeLessThanOrEqual(0.15);
    }
  });

  it("varies the frames within each continent", () => {
    for (const continent of Object.values(Continent)) {
      const frames = countries.flatMap((country) =>
        country.continent === continent ? [country.stamp.frame] : [],
      );
      expect(new Set(frames).size, continent).toBeGreaterThanOrEqual(
        Math.min(frames.length, 12),
      );
    }
  });

  it("tilts each stamp the same way every time, within six degrees", () => {
    for (const { stamp } of countries)
      expect(Math.abs(stamp.tilt)).toBeLessThanOrEqual(6);
    expect(
      new Set(countries.map(({ stamp }) => stamp.tilt)).size,
    ).toBeGreaterThan(100);
  });
});
