import { Trip } from "@travelmap/core";
import { describe, expect, it } from "vitest";

import { bucketOf, bucketYears, fitSlots } from "./yearBuckets";

/* The buckets only move trips around, so a labelled stand-in is enough. */
const years = [2026, 2025, 2024, 2022, 2019].map((year) => ({
  trips: [String(year) as unknown as Trip],
  year,
}));

describe("bucketYears", () => {
  it("folds every year past the last slot into an or-earlier pill", () => {
    const buckets = bucketYears(years, 3);
    expect(buckets.map(({ year, isOrEarlier }) => [year, isOrEarlier])).toEqual(
      [
        [2026, false],
        [2025, false],
        [2024, true],
      ],
    );
    expect(buckets[2]?.trips).toEqual(["2024", "2022", "2019"]);
  });

  it("gives every year its own pill when they all fit", () => {
    expect(bucketYears(years, 5).every(({ isOrEarlier }) => !isOrEarlier)).toBe(
      true,
    );
  });
});

describe("bucketOf", () => {
  it("finds an old year inside the folded pill", () => {
    expect(bucketOf(bucketYears(years, 3), 2019)?.year).toBe(2024);
  });
});

describe("fitSlots", () => {
  const widths = { available: 372, folded: 76, gap: 4, single: 62 };

  it("keeps room for the wider folded pill", () => {
    expect(fitSlots(widths, 9)).toBe(5);
    expect(fitSlots({ ...widths, available: 340 }, 9)).toBe(5);
    expect(fitSlots({ ...widths, available: 330 }, 9)).toBe(4);
  });

  it("shows every year when they all fit and never fewer than two", () => {
    expect(fitSlots(widths, 3)).toBe(3);
    expect(fitSlots({ ...widths, available: 50 }, 9)).toBe(2);
  });
});
