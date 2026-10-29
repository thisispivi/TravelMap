import { buildWorld, Continent, Currency } from "@travelmap/core";
import { describe, expect, it } from "vitest";

import { buildItinerary, daysLater, timeOf, totalsOf } from "./tripItinerary";

const [trip] = buildWorld({
  cities: [
    ["cagliari", 9.11, 39.22],
    ["bergamo", 9.67, 45.69],
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
  photos: {
    sinaia: [
      { height: 3, original: "/s.webp", thumbnail: "/t.webp", width: 4 },
    ],
  },
  trips: [
    {
      eDate: "2026-03-31",
      id: "romania",
      originCityId: "cagliari",
      sDate: "2026-03-25",
      steps: [
        {
          legs: [
            {
              arrive: "2026-03-26T00:30",
              depart: "2026-03-25T23:00",
              mode: "plane",
              toId: "bergamo",
            },
            {
              arrive: "2026-03-26T11:30",
              depart: "2026-03-26T06:30",
              mode: "plane",
              toId: "bucharest",
            },
          ],
          type: "move",
        },
        {
          checkIn: "2026-03-26",
          checkOut: "2026-03-30",
          cityId: "bucharest",
          outings: [
            {
              date: "2026-03-27",
              legs: [
                { mode: "bus", photoPath: "sinaia", toId: "sinaia" },
                { mode: "bus", toId: "bucharest" },
              ],
            },
          ],
          type: "stay",
        },
        {
          legs: [
            {
              arrive: "2026-03-30T23:55",
              depart: "2026-03-30T22:35",
              mode: "plane",
              toId: "bergamo",
            },
            { depart: "2026-03-31T06:05", mode: "plane", toId: "cagliari" },
          ],
          type: "move",
        },
      ],
      title: "Romania",
    },
  ],
}).trips;

describe("buildItinerary", () => {
  const items = buildItinerary(trip!);

  it("reads start, getting there, the stay, going home, and end", () => {
    expect(items.map((item) => item.kind)).toEqual([
      "endpoint",
      "move",
      "stay",
      "move",
      "endpoint",
    ]);
  });

  it("counts a small-hours arrival before a morning flight as a night in transit", () => {
    const there = items[1];

    expect(
      there?.kind === "move" ? there.legs[0]?.connection : undefined,
    ).toMatchObject({ isOvernight: true, minutes: 360 });
  });

  it("shows a night at a connection between an evening and a morning flight", () => {
    const home = items[3];

    expect(
      home?.kind === "move" ? home.legs[0]?.connection : undefined,
    ).toMatchObject({ isOvernight: true, isVisited: false });
    expect(
      home?.kind === "move" ? home.legs[0]?.connection?.city.id : undefined,
    ).toBe("bergamo");
  });

  it("gives the last ride of a move no connection", () => {
    const home = items[3];

    expect(home?.kind === "move" ? home.legs[1]?.connection : null).toBe(
      undefined,
    );
  });

  it("names the places a day trip went to, not the ride back", () => {
    const stay = items[2];

    expect(
      stay?.kind === "stay"
        ? stay.outings.map((outing) => outing.places.map((city) => city.id))
        : [],
    ).toEqual([["sinaia"]]);
  });
});

describe("totalsOf", () => {
  it("counts nights slept in a stay, not nights in transit", () => {
    expect(totalsOf(trip!).nights).toBe(4);
  });
});

describe("timeOf", () => {
  it("reads only a real time", () => {
    expect(timeOf("2026-03-30T22:00")).toBe("22:00");
    expect(timeOf("2026-03-30")).toBeUndefined();
  });
});

describe("daysLater", () => {
  it("counts the nights an overnight ride crosses", () => {
    expect(daysLater("2025-11-15T21:40", "2025-11-16T06:10")).toBe(1);
    expect(daysLater("2025-12-31", "2026-01-02T08:00")).toBe(2);
  });

  it("reports a same-day or unknown arrival as zero", () => {
    expect(daysLater("2025-11-15T08:00", "2025-11-15T12:00")).toBe(0);
    expect(daysLater("2025-11-15T08:00")).toBe(0);
  });
});
