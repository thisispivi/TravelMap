import { describe, expect, it } from "vitest";

import { buildTimeline } from "./timeline";

/**
 * Builds the only part of a trip the timeline reads.
 * @param {string} start - YYYY-MM-DD start
 * @param {string} end - YYYY-MM-DD end
 * @returns {{ sDate: Date; eDate: Date }} A trip stand-in
 */
function trip(start: string, end: string): { sDate: Date; eDate: Date } {
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  return { eDate: new Date(ey, em - 1, ed), sDate: new Date(sy, sm - 1, sd) };
}

describe("buildTimeline", () => {
  it("groups trips by the year they started, newest first", () => {
    const years = buildTimeline([
      trip("2021-05-01", "2021-05-03"),
      trip("2023-08-01", "2023-08-10"),
      trip("2023-02-01", "2023-02-02"),
    ]);
    expect(years.map(({ year, entries }) => [year, entries.length])).toEqual([
      [2023, 2],
      [2021, 1],
    ]);
  });

  it("counts every day of a trip, the last one included", () => {
    const [year] = buildTimeline([trip("2023-08-01", "2023-08-03")]);
    expect(year?.days).toBe(3);
  });

  it("lists a year's trips in date order", () => {
    const [year] = buildTimeline([
      trip("2023-08-15", "2023-08-20"),
      trip("2023-02-01", "2023-02-05"),
    ]);
    expect(year?.entries.map(({ start }) => start < 0.5)).toEqual([
      true,
      false,
    ]);
  });

  it("caps a trip over New Year at the end of the year it started", () => {
    const [year] = buildTimeline([trip("2025-12-30", "2026-01-02")]);
    expect(year?.year).toBe(2025);
    expect(year?.entries[0]?.end).toBe(1);
  });

  it("returns nothing for no trips", () => {
    expect(buildTimeline([])).toEqual([]);
  });
});
