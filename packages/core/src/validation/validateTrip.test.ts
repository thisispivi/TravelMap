import { describe, expect, it } from "vitest";

import type { PhotoRange, TripJson } from "../schema";
import { validateTrip } from "./validateTrip";

const context = {
  cities: new Map(
    ["cagliari", "sydney"].map((id) => [
      id,
      {
        coordinates: [0, 0] as [number, number],
        countryId: "x",
        id,
        name: id,
        timeZone: "UTC",
      },
    ]),
  ),
  photoCounts: new Map([["sydney", 850]]),
};

/**
 * Builds a one-stay trip whose stay owns part of the Sydney gallery.
 * @param {PhotoRange} photoRange - The part of the gallery the stay owns
 * @returns {TripJson} The trip
 */
function tripWith(photoRange: PhotoRange): TripJson {
  return {
    eDate: "2025-11-20",
    id: "australia",
    originCityId: "cagliari",
    sDate: "2025-11-18",
    steps: [
      { legs: [{ mode: "plane", toId: "sydney" }], type: "move" },
      {
        checkIn: "2025-11-18",
        checkOut: "2025-11-20",
        cityId: "sydney",
        photoPath: "sydney",
        photoRange,
        type: "stay",
      },
    ],
    title: "Australia",
  };
}

/**
 * Lists the issue codes validation reports for a trip.
 * @param {TripJson} trip - The trip to check
 * @returns {string[]} The codes found
 */
function codesOf(trip: TripJson): string[] {
  return validateTrip(trip, context, "trips/australia.json").map(
    ({ code }) => code,
  );
}

describe("validateTrip photo ranges", () => {
  it("warns when a range starts past the end of its gallery", () => {
    expect(codesOf(tripWith({ from: 900 }))).toContain("stay.rangePastGallery");
  });

  it("accepts a range that ends past the gallery but starts inside it", () => {
    expect(codesOf(tripWith({ from: 539, to: 2000 }))).not.toContain(
      "stay.rangePastGallery",
    );
  });
});
