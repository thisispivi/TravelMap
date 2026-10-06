import { buildWorld, Continent, Currency } from "@travelmap/core";
import { describe, expect, it } from "vitest";

import { buildChapters, timeOf } from "./tripItinerary";

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

describe("buildChapters", () => {
  const chapters = buildChapters(trip!);

  it("reads getting there, the stay, and going home", () => {
    expect(
      chapters.map((chapter) =>
        chapter.kind === "journey" ? chapter.role : chapter.kind,
      ),
    ).toEqual(["there", "stay", "home"]);
  });

  it("counts a small-hours arrival before a morning flight as a night in transit", () => {
    const [there] = chapters;

    expect(
      there?.kind === "journey" ? there.rows.map((row) => row.kind) : [],
    ).toEqual(["ride", "transit", "ride"]);
  });

  it("shows a night at a connection between an evening and a morning flight", () => {
    const home = chapters[2];

    expect(
      home?.kind === "journey"
        ? home.rows.map((row) =>
            row.kind === "transit" ? `night:${row.city.id}` : row.kind,
          )
        : [],
    ).toEqual(["ride", "night:bergamo", "ride"]);
  });

  it("puts a day trip on its date and folds the other full days together", () => {
    const stay = chapters[1];

    expect(stay?.kind === "stay" ? stay.days : []).toMatchObject([
      { date: "2026-03-27", kind: "outing" },
      { from: "2026-03-28", kind: "free", to: "2026-03-29" },
    ]);
  });

  it("gives a photographed day-trip place its own row", () => {
    const stay = chapters[1];
    const outing = stay?.kind === "stay" ? stay.days[0] : undefined;

    expect(
      outing?.kind === "outing" ? outing.rows.map((row) => row.kind) : [],
    ).toEqual(["ride", "place", "ride"]);
  });
});

describe("timeOf", () => {
  it("reads only a real time", () => {
    expect(timeOf("2026-03-30T22:00")).toBe("22:00");
    expect(timeOf("2026-03-30")).toBeUndefined();
  });
});
