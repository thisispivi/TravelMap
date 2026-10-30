import { buildWorld, Continent, Currency } from "@travelmap/core";
import { describe, expect, it } from "vitest";

import { getTripCityIds } from "./mapTripCities";

const [stayOnlyTrip] = buildWorld({
  cities: [
    ["cagliari", "Cagliari", 9.11, 39.22],
    ["valencia-es", "Valencia", -0.38, 39.47],
    ["valencia-ve", "Valencia", -68.0, 10.16],
  ].map(([id, name, lng, lat]) => ({
    coordinates: [lng, lat],
    countryId: "x",
    id,
    name,
    timeZone: "Europe/Rome",
  })),
  countries: [
    {
      color: { h: 0, l: 0, s: 0 },
      continent: Continent.EUROPE,
      currency: Currency.EUR,
      id: "x",
      name: "X",
    },
  ],
  photos: {},
  trips: [
    {
      eDate: "2026-03-30",
      id: "valencia",
      originCityId: "cagliari",
      sDate: "2026-03-26",
      title: "Valencia",
      steps: [
        {
          checkIn: "2026-03-26",
          checkOut: "2026-03-30",
          cityId: "valencia-es",
          outings: [],
          type: "stay",
        },
      ],
    },
  ],
}).trips;

describe("getTripCityIds", () => {
  it("keeps a stay no recorded leg reaches", () => {
    expect(getTripCityIds(stayOnlyTrip).has("valencia-es")).toBe(true);
  });

  it("tells apart a city that only shares the stay's name", () => {
    expect(getTripCityIds(stayOnlyTrip).has("valencia-ve")).toBe(false);
  });
});
