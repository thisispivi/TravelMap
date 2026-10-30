import {
  CityJson,
  Continent,
  CountryJson,
  Currency,
  SiteConfig,
  TripJson,
} from "@travelmap/core";
import { describe, expect, it } from "vitest";

import type { DataFile, DatasetSnapshot } from "@/data/store";

import { countTripsByPlace, groupCities } from "./placeGroups";

/**
 * Wraps a document as the store hands it out.
 * @param {T} value - The document
 * @returns {DataFile<T>} The file
 */
function file<T>(value: T): DataFile<T> {
  return { path: "test.json", value };
}

/**
 * Builds a city document.
 * @param {string} id - The city id, also its name
 * @param {string} countryId - Its country
 * @returns {CityJson} The city
 */
function city(id: string, countryId: string): CityJson {
  return { coordinates: [0, 1], countryId, id, name: id, timeZone: "UTC" };
}

const dataset = {
  cities: [
    city("Rome", "Italy"),
    city("Milan", "Italy"),
    city("Paris", "France"),
  ].map(file),
  /* The grouping never reads the configuration, so an empty one stands in. */
  config: file({} as SiteConfig),
  countries: ["Italy", "France"].map((id) =>
    file<CountryJson>({
      color: { h: 0, l: 50, s: 50 },
      continent: Continent.EUROPE,
      currency: Currency.EUR,
      id,
      name: id,
    }),
  ),
  photos: [],
  trips: [
    file<TripJson>({
      eDate: "2026-01-03",
      id: "a",
      originCityId: "Rome",
      sDate: "2026-01-01",
      steps: [
        {
          checkIn: "2026-01-01",
          checkOut: "2026-01-02",
          cityId: "Rome",
          type: "stay",
        },
        { legs: [{ mode: "train", toId: "Milan" }], type: "move" },
        { legs: [{ mode: "train", toId: "Rome" }], type: "move" },
        {
          checkIn: "2026-01-02",
          checkOut: "2026-01-03",
          cityId: "Rome",
          type: "stay",
        },
      ],
      title: "A",
    }),
  ],
} satisfies DatasetSnapshot;

describe("groupCities", () => {
  it("groups cities under their countries, both in name order", () => {
    expect(
      groupCities(dataset, "").map(({ cities, name }) => [
        name,
        cities.map(({ id }) => id),
      ]),
    ).toEqual([
      ["France", ["Paris"]],
      ["Italy", ["Milan", "Rome"]],
    ]);
  });
});

describe("countTripsByPlace", () => {
  it("counts a trip once for a place it stays in twice, and not for one only passed", () => {
    const counts = countTripsByPlace(dataset);

    expect(counts.get("Rome")).toBe(1);
    expect(counts.get("Milan")).toBeUndefined();
  });
});
