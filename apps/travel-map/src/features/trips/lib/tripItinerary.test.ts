import { buildWorld, Continent, Currency } from "@travelmap/core";
import { describe, expect, it } from "vitest";

import { buildItinerary, timeOf } from "./tripItinerary";

const [trip] = buildWorld({
  cities: [
    ["cagliari", 9.11, 39.22],
    ["bucharest", 26.1, 44.43],
    ["sinaia", 25.55, 45.35],
  ].map(([id, lng, lat]) => ({
    coordinates: [lng, lat],
    countryId: "x",
    id,
    name: id,
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
      eDate: "2026-03-31",
      id: "romania",
      originCityId: "cagliari",
      sDate: "2026-03-26",
      steps: [
        { legs: [{ mode: "plane", toId: "bucharest" }], type: "move" },
        {
          checkIn: "2026-03-26",
          checkOut: "2026-03-30",
          cityId: "bucharest",
          outings: [
            {
              date: "2026-03-27",
              legs: [
                { mode: "bus", toId: "sinaia" },
                { mode: "bus", toId: "bucharest" },
              ],
            },
          ],
          type: "stay",
        },
        {
          legs: [
            { depart: "2026-03-30T22:00", mode: "plane", toId: "cagliari" },
          ],
          type: "move",
        },
      ],
      title: "Romania",
    },
  ],
}).trips;

describe("buildItinerary", () => {
  const blocks = buildItinerary(trip!);

  it("reads start, journeys, stays, end in travel order", () => {
    expect(blocks.map((block) => block.kind)).toEqual([
      "start",
      "move",
      "stay",
      "move",
      "end",
    ]);
  });

  it("numbers a stay by the trip's nights", () => {
    expect(blocks[2]).toMatchObject({ firstNight: 1, lastNight: 4 });
  });

  it("flags the night spent travelling when a journey arrives a day later", () => {
    expect(blocks[3]).toMatchObject({
      arriveDate: "2026-03-31",
      departDate: "2026-03-30",
      nightOnBoard: 5,
    });
  });

  it("leaves a same-day journey without a night on board", () => {
    expect(blocks[1]).toMatchObject({ nightOnBoard: undefined });
  });
});

describe("timeOf", () => {
  it("reads only a real time", () => {
    expect(timeOf("2026-03-30T22:00")).toBe("22:00");
    expect(timeOf("2026-03-30")).toBeUndefined();
  });
});
