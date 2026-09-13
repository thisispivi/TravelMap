import { describe, expect, it } from "vitest";

import type { WorldSources } from "../schema";
import { Continent } from "../typings/Continent";
import { Currency } from "../typings/Currency";
import { buildWorld } from "./buildWorld";

const sources: WorldSources = {
  cities: [
    {
      coordinates: [12.4964, 41.9028],
      countryId: "italy",
      id: "rome",
      name: "Rome",
      timeZone: "Europe/Rome",
    },
  ],
  countries: [
    {
      color: { h: 210, l: 45, s: 60 },
      continent: Continent.EUROPE,
      currency: Currency.EUR,
      id: "italy",
      name: "Italy",
    },
  ],
  photos: {},
  trips: [
    {
      eDate: "2026-05-03",
      id: "rome-2026",
      originCityId: "rome",
      returnCityId: "rome",
      sDate: "2026-05-01",
      steps: [
        {
          cityId: "rome",
          eDate: "2026-05-03",
          sDate: "2026-05-01",
          type: "stop" as const,
        },
      ],
      title: "Rome",
    },
  ],
};

describe("buildWorld", () => {
  it("resolves references to shared domain objects", () => {
    const world = buildWorld(sources);
    const rome = world.citiesById.get("rome");

    expect(world.trips[0].destinations[0].city).toBe(rome);
    expect(world.trips[0].origin.city).toBe(rome);
    expect(world.trips[0].sDate).toEqual(new Date(2026, 4, 1));
  });

  it("fails at the boundary for malformed documents", () => {
    expect(() =>
      buildWorld({
        ...sources,
        cities: [{ ...sources.cities[0], coordinates: [999, 41.9] }],
      }),
    ).toThrow(/Malformed dataset/);
  });

  it("names unresolved references close to their source", () => {
    expect(() =>
      buildWorld({
        ...sources,
        trips: [{ ...sources.trips[0], originCityId: "missing" }],
      }),
    ).toThrow('trip rome-2026 references unknown id "missing"');
  });

  it("orders trips by start date, then id, whatever order they loaded in", () => {
    const later = {
      ...sources.trips[0],
      eDate: "2027-01-04",
      id: "rome-2027",
      sDate: "2027-01-01",
      steps: [
        {
          cityId: "rome",
          eDate: "2027-01-04",
          sDate: "2027-01-01",
          type: "stop" as const,
        },
      ],
    };
    const alsoLater = { ...later, id: "aaa-2027" };

    expect(
      buildWorld({
        ...sources,
        trips: [later, sources.trips[0], alsoLater],
      }).trips.map((trip) => trip.id),
    ).toEqual(["rome-2026", "aaa-2027", "rome-2027"]);
  });

  it("attaches a stop's gallery from the manifest it names", () => {
    const image = {
      height: 2,
      original: "/Italy/Rome/001c.webp",
      thumbnail: "/Italy/Rome/001t.webp",
      width: 3,
    };
    const world = buildWorld({
      ...sources,
      photos: { "Italy/Rome/tr_010526": [image] },
      trips: [
        {
          ...sources.trips[0],
          steps: [
            { ...sources.trips[0].steps[0], photoPath: "Italy/Rome/tr_010526" },
          ],
        },
      ],
    });

    expect(world.trips[0].destinations[0].photos).toEqual([image]);
  });

  it("leaves a stop pointing at a missing manifest with an empty gallery", () => {
    const world = buildWorld({
      ...sources,
      trips: [
        {
          ...sources.trips[0],
          steps: [{ ...sources.trips[0].steps[0], photoPath: "nothing/here" }],
        },
      ],
    });

    expect(world.trips[0].destinations[0].photos).toEqual([]);
  });

  it("lists a lived-in city once when both the city and the config say so", () => {
    const world = buildWorld({
      ...sources,
      cities: [{ ...sources.cities[0], isLived: true }],
      livedCityIds: ["rome"],
    });

    expect(world.livedCities.map((city) => city.id)).toEqual(["rome"]);
  });

  it("refuses a value that is not a dataset at all", () => {
    expect(() => buildWorld(null)).toThrow(/Malformed dataset/);
    expect(() => buildWorld({})).toThrow(/Malformed dataset/);
  });
});
