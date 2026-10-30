import { afterEach, describe, expect, it, vi } from "vitest";

import { City } from "./City";
import { Trip } from "./Trip";

/**
 * Builds a trip with no itinerary, which is all a duration needs.
 * @param {Date} sDate - Its first day
 * @param {Date} eDate - Its last day
 * @returns {Trip} The trip
 */
function tripBetween(sDate: Date, eDate: Date): Trip {
  /* With no steps the origin is only stored, so an empty stand-in is safe. */
  return new Trip({ eDate, id: "trip", origin: {} as City, sDate, steps: [] });
}

describe("Trip.getDurationInDays", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("counts the last day", () => {
    expect(
      tripBetween(
        new Date(2023, 7, 1),
        new Date(2023, 7, 3),
      ).getDurationInDays(),
    ).toBe(3);
  });

  it("does not gain a day across the autumn clock change", () => {
    vi.stubEnv("TZ", "Europe/Rome");
    expect(
      tripBetween(
        new Date(2026, 9, 23),
        new Date(2026, 9, 27),
      ).getDurationInDays(),
    ).toBe(5);
  });

  it("does not lose a day across the spring clock change", () => {
    vi.stubEnv("TZ", "Europe/Rome");
    expect(
      tripBetween(
        new Date(2026, 2, 25),
        new Date(2026, 2, 31),
      ).getDurationInDays(),
    ).toBe(7);
  });
});
