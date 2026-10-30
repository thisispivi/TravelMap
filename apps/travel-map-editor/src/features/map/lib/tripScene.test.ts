import { CityJson, TripJson } from "@travelmap/core";
import { describe, expect, it } from "vitest";

import { stepMapId, tripScene } from "./tripScene";

/**
 * Builds a city document at the given coordinates.
 * @param {string} id - The city id
 * @param {[number, number]} coordinates - Where it stands, as `[lng, lat]`
 * @returns {CityJson} The city
 */
function cityAt(id: string, coordinates: [number, number]): CityJson {
  return {
    coordinates,
    countryId: "Italy",
    id,
    name: id,
    timeZone: "Europe/Rome",
  };
}

const cityById = new Map(
  [
    cityAt("Cagliari", [9.11, 39.22]),
    cityAt("Rome", [12.5, 41.9]),
    cityAt("Naples", [14.27, 40.85]),
  ].map((city) => [city.id, city]),
);

const roundTrip: TripJson = {
  eDate: "2026-05-07",
  id: "italy",
  originCityId: "Cagliari",
  sDate: "2026-05-01",
  steps: [
    { legs: [{ mode: "plane", toId: "Rome" }], type: "move" },
    {
      checkIn: "2026-05-01",
      checkOut: "2026-05-03",
      cityId: "Rome",
      type: "stay",
    },
    { legs: [{ mode: "train", toId: "Naples" }], type: "move" },
    {
      checkIn: "2026-05-03",
      checkOut: "2026-05-05",
      cityId: "Naples",
      type: "stay",
    },
    { legs: [{ mode: "train", toId: "Rome" }], type: "move" },
    {
      checkIn: "2026-05-05",
      checkOut: "2026-05-07",
      cityId: "Rome",
      type: "stay",
    },
  ],
  title: "Italy",
};

describe("tripScene", () => {
  it("gives a second stay in the same city its own numbered pin", () => {
    const stays = tripScene(roundTrip, cityById).pins.filter(
      ({ tone }) => tone === "stay",
    );

    expect(stays.map(({ id, number }) => [id, number])).toEqual([
      [stepMapId(1), 1],
      [stepMapId(3), 2],
      [stepMapId(5), 3],
    ]);
  });

  it("pins a place only passed through once", () => {
    const origins = tripScene(roundTrip, cityById).pins.filter(
      ({ label }) => label === "Cagliari",
    );

    expect(origins).toHaveLength(1);
  });
});
