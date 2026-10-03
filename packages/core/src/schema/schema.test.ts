import { describe, expect, it } from "vitest";

import { Continent } from "../typings/Continent";
import { Currency } from "../typings/Currency";
import {
  CityJsonSchema,
  CountryJsonSchema,
  hasSource,
  ImageSchema,
  isTripJson,
  LocalDateSchema,
  SiteConfigSchema,
  TripJsonSchema,
} from "./index";

const country = {
  color: { h: 210, l: 45, s: 60 },
  continent: Continent.EUROPE,
  currency: Currency.EUR,
  id: "italy",
  name: "Italy",
};

const city = {
  coordinates: [12.4964, 41.9028],
  countryId: "italy",
  id: "rome",
  name: "Rome",
  timeZone: "Europe/Rome",
};

const trip = {
  eDate: "2026-05-03",
  id: "rome-2026",
  originCityId: "milan",
  sDate: "2026-05-01",
  steps: [
    { legs: [{ mode: "train", toId: "rome" }], type: "move" },
    {
      checkIn: "2026-05-01",
      checkOut: "2026-05-03",
      cityId: "rome",
      outings: [
        {
          date: "2026-05-02",
          legs: [
            { mode: "bus", photoPath: "Italy/Tivoli/tr", toId: "tivoli" },
            { mode: "bus", toId: "rome" },
          ],
        },
      ],
      type: "stay",
    },
  ],
  title: "Rome",
};

describe("authored data schemas", () => {
  it("accepts a valid linked dataset document set", () => {
    expect(CountryJsonSchema.parse(country)).toEqual(country);
    expect(CityJsonSchema.parse(city)).toEqual(city);
    expect(TripJsonSchema.parse(trip)).toEqual(trip);
  });

  it("rejects unknown fields instead of silently discarding them", () => {
    expect(CityJsonSchema.safeParse({ ...city, typo: true }).success).toBe(
      false,
    );
  });

  it("rejects out-of-range coordinates and unsupported transport modes", () => {
    expect(
      CityJsonSchema.safeParse({ ...city, coordinates: [181, 41.9] }).success,
    ).toBe(false);
    expect(
      TripJsonSchema.safeParse({
        ...trip,
        steps: [{ legs: [{ mode: "teleport", toId: "rome" }], type: "move" }],
      }).success,
    ).toBe(false);
  });

  it("rejects unexpected site configuration keys", () => {
    expect(
      SiteConfigSchema.safeParse({
        site: { name: "Travel Map" },
        token: "secret",
      }).success,
    ).toBe(false);
  });
});

describe("authored dates", () => {
  it("accepts a plain date and an optional wall-clock time", () => {
    expect(LocalDateSchema.safeParse("2026-05-01").success).toBe(true);
    expect(LocalDateSchema.safeParse("2026-05-01T14:30").success).toBe(true);
  });

  it("rejects the shapes a hand edit slips into", () => {
    for (const value of [
      "2026-5-1",
      "01-05-2026",
      "2026-05-01T14:30:00",
      "2026-05-01 14:30",
      "2026-02-29",
      "2026-04-31",
      "2026-05-01T24:00",
      "2026-05-01T12:60",
      "2026-05-01T12:30Z",
    ])
      expect(LocalDateSchema.safeParse(value).success).toBe(false);
  });
});

it("accepts leap days and local times independently of the viewer's timezone", () => {
  expect(LocalDateSchema.safeParse("2024-02-29").success).toBe(true);
  expect(LocalDateSchema.safeParse("2026-03-29T02:30").success).toBe(true);
});

describe("authored stays and moves", () => {
  it("rejects a stay that checks out before it checks in", () => {
    expect(
      TripJsonSchema.safeParse({
        ...trip,
        steps: [
          {
            checkIn: "2026-05-03",
            checkOut: "2026-05-01",
            cityId: "rome",
            type: "stay",
          },
        ],
      }).success,
    ).toBe(false);
  });

  it("accepts a night spent on board, arriving the day after departing", () => {
    expect(
      TripJsonSchema.safeParse({
        ...trip,
        steps: [
          {
            legs: [
              {
                arrive: "2026-05-02T07:10",
                depart: "2026-05-01T21:30",
                mode: "train",
                toId: "rome",
              },
            ],
            type: "move",
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects a move or a day trip with no legs", () => {
    expect(
      TripJsonSchema.safeParse({
        ...trip,
        steps: [{ legs: [], type: "move" }],
      }).success,
    ).toBe(false);
    expect(
      TripJsonSchema.safeParse({
        ...trip,
        steps: [
          {
            checkIn: "2026-05-01",
            checkOut: "2026-05-03",
            cityId: "rome",
            outings: [{ date: "2026-05-02", legs: [] }],
            type: "stay",
          },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects the legacy flat stop format", () => {
    expect(
      TripJsonSchema.safeParse({
        ...trip,
        steps: [
          {
            cityId: "rome",
            eDate: "2026-05-03",
            sDate: "2026-05-01",
            type: "stop",
          },
        ],
      }).success,
    ).toBe(false);
  });
});

describe("authored transport legs", () => {
  const leg = { mode: "plane", toId: "tokyo" };

  it("accepts any operator id, so a fork can name its own airlines", () => {
    expect(
      TripJsonSchema.safeParse({
        ...trip,
        steps: [
          {
            legs: [{ ...leg, flight: { company: "some-regional-carrier" } }],
            type: "move",
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects an empty operator id rather than storing a blank name", () => {
    expect(
      TripJsonSchema.safeParse({
        ...trip,
        steps: [
          { legs: [{ ...leg, flight: { company: "  " } }], type: "move" },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects flight fields the app cannot render", () => {
    expect(
      TripJsonSchema.safeParse({
        ...trip,
        steps: [
          { legs: [{ ...leg, flight: { departure: "09:15" } }], type: "move" },
        ],
      }).success,
    ).toBe(false);
  });
});

describe("isTripJson", () => {
  it("separates a trip from the other documents an import may contain", () => {
    expect(isTripJson(trip)).toBe(true);
    expect(isTripJson(city)).toBe(false);
    expect(isTripJson(null)).toBe(false);
  });
});

describe("photo manifest entries", () => {
  const withoutPath = {
    height: 2,
    thumbnail: "/Travels/Italy/Rome/001t.webp",
    width: 3,
  };
  const photo = { ...withoutPath, original: "/Travels/Italy/Rome/001c.webp" };

  it("accepts a photo with its full-size path", () => {
    expect(ImageSchema.safeParse(photo).success).toBe(true);
  });

  /*
   * The uploader cannot know a YouTube id, so it writes the entry without one
   * and the author pastes it in later. Refusing the intermediate state made the
   * whole site fail to load over an unfinished video.
   */
  it("accepts a video still waiting for its YouTube id", () => {
    expect(
      ImageSchema.safeParse({ ...withoutPath, youtube: true }).success,
    ).toBe(true);
    expect(
      ImageSchema.safeParse({ ...photo, original: "", youtube: true }).success,
    ).toBe(true);
  });

  it("still refuses a photo with no path, which could never render", () => {
    expect(ImageSchema.safeParse({ ...photo, original: "" }).success).toBe(
      false,
    );
    expect(ImageSchema.safeParse(withoutPath).success).toBe(false);
  });

  it("reports which item is unrenderable", () => {
    expect(hasSource(photo)).toBe(true);
    expect(hasSource({ ...photo, original: "", youtube: true })).toBe(false);
  });
});
