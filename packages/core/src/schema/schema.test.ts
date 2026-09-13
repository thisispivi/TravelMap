import { describe, expect, it } from "vitest";

import { Continent } from "../typings/Continent";
import { Currency } from "../typings/Currency";
import {
  CityJsonSchema,
  CountryJsonSchema,
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
  originCityId: "rome",
  returnCityId: "rome",
  sDate: "2026-05-01",
  steps: [
    {
      cityId: "rome",
      eDate: "2026-05-03",
      sDate: "2026-05-01",
      type: "stop",
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
        steps: [
          { fromId: "rome", mode: "teleport", toId: "rome", type: "transport" },
        ],
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
    ])
      expect(LocalDateSchema.safeParse(value).success).toBe(false);
  });
});

describe("authored transport legs", () => {
  const leg = {
    fromId: "rome",
    mode: "plane",
    toId: "tokyo",
    type: "transport",
  };

  it("accepts any operator id, so a fork can name its own airlines", () => {
    expect(
      TripJsonSchema.safeParse({
        ...trip,
        steps: [{ ...leg, flight: { company: "some-regional-carrier" } }],
      }).success,
    ).toBe(true);
  });

  it("rejects an empty operator id rather than storing a blank name", () => {
    expect(
      TripJsonSchema.safeParse({
        ...trip,
        steps: [{ ...leg, flight: { company: "  " } }],
      }).success,
    ).toBe(false);
  });

  it("rejects flight fields the app cannot render", () => {
    expect(
      TripJsonSchema.safeParse({
        ...trip,
        steps: [{ ...leg, flight: { departure: "09:15" } }],
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
