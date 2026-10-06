import { Trip } from "@travelmap/core";
import { describe, expect, it } from "vitest";

import { groupTripsByYear } from "./timeline";

/**
 * Builds the only part of a trip the timeline groups by.
 * @param {string} id - Trip id
 * @param {string} start - ISO start date
 * @returns {Trip} A trip stand-in
 */
function trip(id: string, start: string): Trip {
  /* groupTripsByYear reads only the id and start date of a trip. */
  return { id, sDate: new Date(start) } as Trip;
}

describe("groupTripsByYear", () => {
  it("groups newest year first and keeps trips newest first within a year", () => {
    const groups = groupTripsByYear([
      trip("a", "2023-03-01"),
      trip("b", "2024-08-01"),
      trip("c", "2023-11-01"),
    ]);
    expect(
      groups.map(({ trips, year }) => [year, trips.map(({ trip }) => trip.id)]),
    ).toEqual([
      [2024, ["b"]],
      [2023, ["c", "a"]],
    ]);
  });

  it("alternates sides across year boundaries instead of restarting each year", () => {
    const sides = groupTripsByYear([
      trip("a", "2024-05-01"),
      trip("b", "2023-05-01"),
      trip("c", "2023-01-01"),
    ]).flatMap(({ trips }) => trips.map(({ side }) => side));
    expect(sides).toEqual(["left", "right", "left"]);
  });

  it("returns no groups for no trips", () => {
    expect(groupTripsByYear([])).toEqual([]);
  });
});
