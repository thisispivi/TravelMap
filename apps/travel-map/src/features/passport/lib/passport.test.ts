import { buildWorld, Continent, Currency } from "@travelmap/core";
import { describe, expect, it } from "vitest";

import {
  buildPassport,
  PassportPage,
  PassportSlot,
  StampSlot,
} from "./passport";

/* id: [lng, lat, IANA zone, country id, continent] */
const PLACES: Record<string, [number, number, string, string, Continent]> = {
  cagliari: [9.11, 39.22, "Europe/Rome", "Italy", Continent.EUROPE],
  kyoto: [135.77, 35.01, "Asia/Tokyo", "Japan", Continent.ASIA],
  lisbon: [-9.14, 38.72, "Europe/Lisbon", "Portugal", Continent.EUROPE],
  monaco: [7.42, 43.74, "Europe/Monaco", "Monaco", Continent.EUROPE],
  nice: [7.26, 43.7, "Europe/Paris", "France", Continent.EUROPE],
  rome: [12.5, 41.9, "Europe/Rome", "Italy", Continent.EUROPE],
  sydney: [151.21, -33.87, "Australia/Sydney", "Australia", Continent.OCEANIA],
  tokyo: [139.69, 35.68, "Asia/Tokyo", "Japan", Continent.ASIA],
  vienna: [16.37, 48.21, "Europe/Vienna", "Austria", Continent.EUROPE],
};

/**
 * Writes a stay as a trip document does.
 * @param {string} cityId - Where
 * @param {string} checkIn - The first night
 * @param {string} checkOut - The morning of departure
 * @param {unknown[]} [outings] - Day trips from it
 * @returns {object} The step
 */
const stay = (
  cityId: string,
  checkIn: string,
  checkOut: string,
  outings?: unknown[],
): object => ({ checkIn, checkOut, cityId, outings, type: "stay" });

/**
 * Writes a one-ride move as a trip document does.
 * @param {string} mode - How it went
 * @param {string} toId - Where it went
 * @returns {object} The step
 */
const move = (mode: string, toId: string): object => ({
  legs: [{ distanceInKm: 100, durationMinutes: 60, mode, toId }],
  type: "move",
});

/**
 * Writes a trip document.
 * @param {string} id - Its id
 * @param {string} sDate - Its first day
 * @param {string} eDate - Its last day
 * @param {object[]} steps - Its itinerary
 * @returns {object} The document
 */
const trip = (
  id: string,
  sDate: string,
  eDate: string,
  steps: object[],
): object => ({ eDate, id, originCityId: "cagliari", sDate, steps, title: id });

const world = buildWorld({
  cities: Object.entries(PLACES).map(
    ([id, [lng, lat, timeZone, countryId]]) => ({
      coordinates: [lng, lat],
      countryId,
      id,
      name: id,
      timeZone,
    }),
  ),
  countries: [...new Set(Object.values(PLACES).map((place) => place[3]))].map(
    (id) => ({
      color: { h: 0, l: 50, s: 50 },
      continent: Object.values(PLACES).find((place) => place[3] === id)?.[4],
      currency: Currency.EUR,
      id,
      name: id,
    }),
  ),
  futureCityIds: ["vienna"],
  homeCityId: "cagliari",
  photos: {},
  trips: [
    trip("japan-2024", "2024-04-10", "2024-04-20", [
      move("plane", "tokyo"),
      stay("tokyo", "2024-04-10", "2024-04-15"),
      move("train", "kyoto"),
      stay("kyoto", "2024-04-15", "2024-04-20"),
      move("plane", "cagliari"),
    ]),
    trip("japan-2025", "2025-05-01", "2025-05-05", [
      move("plane", "kyoto"),
      stay("kyoto", "2025-05-01", "2025-05-05"),
      move("plane", "cagliari"),
    ]),
    trip("rome-2023", "2023-03-01", "2023-03-03", [
      move("ferry", "rome"),
      stay("rome", "2023-03-01", "2023-03-03"),
      move("ferry", "cagliari"),
    ]),
    trip("nice-2022", "2022-06-01", "2022-06-03", [
      move("plane", "nice"),
      stay("nice", "2022-06-01", "2022-06-03", [
        {
          date: "2022-06-02",
          legs: [
            {
              distanceInKm: 20,
              durationMinutes: 30,
              mode: "train",
              toId: "monaco",
            },
            {
              distanceInKm: 20,
              durationMinutes: 30,
              mode: "train",
              toId: "nice",
            },
          ],
        },
      ]),
      move("plane", "cagliari"),
    ]),
    trip("sydney-2099", "2099-03-10", "2099-03-20", [
      move("plane", "sydney"),
      stay("sydney", "2099-03-10", "2099-03-20"),
      move("plane", "cagliari"),
    ]),
    trip("tokyo-2099", "2099-08-10", "2099-08-20", [
      move("plane", "tokyo"),
      stay("tokyo", "2099-08-10", "2099-08-20"),
      move("plane", "cagliari"),
    ]),
  ],
});

const visitedTrips = world.trips.filter((candidate) => !candidate.isFuture());
const futureTrips = world.trips.filter((candidate) => candidate.isFuture());
const passport = buildPassport({
  futureCities: world.futureCities,
  futureTrips,
  homeCity: world.homeCity,
  locale: "en-US",
  perPage: 9,
  visitedTrips,
});
const slots = passport.pages.flatMap(({ slots: onPage }) => onPage);

/**
 * Finds a country's slot in the booklet.
 * @param {string} id - The country's id
 * @returns {PassportSlot | undefined} Its slot
 */
const slotOf = (id: string): PassportSlot | undefined =>
  slots.find((slot) => slot.id === id);

/**
 * Finds a country's stamp, failing the test if it has none.
 * @param {string} id - The country's id
 * @returns {StampSlot} Its stamp
 */
const stampOf = (id: string): StampSlot => {
  const slot = slotOf(id);
  if (slot?.kind !== "stamp") throw new Error(`${id} has no stamp`);
  return slot;
};

describe("buildPassport", () => {
  it("takes a country's first entry from the first stay in it", () => {
    const [first] = stampOf("Japan").entries;
    expect(first?.trip.id).toBe("japan-2024");
    expect(first?.city.id).toBe("tokyo");
  });

  it("counts a repeat visit as one more entry, not one per city", () => {
    const japan = stampOf("Japan");
    expect(japan.entries.map(({ trip: { id } }) => id)).toEqual([
      "japan-2024",
      "japan-2025",
    ]);
  });

  it("stamps a country entered only by a day trip", () => {
    expect(stampOf("Monaco").entries[0]?.city.id).toBe("monaco");
  });

  it("marks a country only in a future trip as planned, with its date", () => {
    const sydney = slotOf("Australia");
    expect(sydney?.kind).toBe("planned");
    expect(sydney?.kind === "planned" && sydney.date?.getMonth()).toBe(2);
  });

  it("marks a hand-picked future city's country as planned, with no date", () => {
    const austria = slotOf("Austria");
    expect(austria?.kind).toBe("planned");
    expect(austria?.kind === "planned" && austria.date).toBeUndefined();
  });

  it("keeps a visited country stamped when a future trip returns to it", () => {
    expect(slotOf("Japan")?.kind).toBe("stamp");
  });

  it("gives a country nobody has reached no slot, only a place in the total", () => {
    expect(slotOf("Peru")).toBeUndefined();
    expect(
      passport.continents.some(
        ({ continent }) => continent === Continent.SOUTH_AMERICA,
      ),
    ).toBe(false);
  });

  it("gives the home country its own page instead of counting it a visit", () => {
    expect(passport.issuing?.slot.id).toBe("Italy");
    expect(passport.issuing?.city.id).toBe("cagliari");
    expect(passport.issuing?.slot.entries[0]?.trip.id).toBe("rome-2023");
    expect(slotOf("Italy")).toBeUndefined();
    expect(passport.stamps).toBe(3);
  });

  it("runs continents in order of first entry, planned ones after", () => {
    expect(passport.continents.map(({ continent }) => continent)).toEqual([
      Continent.EUROPE,
      Continent.ASIA,
      Continent.OCEANIA,
    ]);
  });

  it("puts stamps first, oldest first, then what is planned", () => {
    const europe = passport.pages
      .filter((page: PassportPage) => page.continent === Continent.EUROPE)
      .flatMap((page) => page.slots);
    expect(europe.slice(0, 3).map(({ id, kind }) => [id, kind])).toEqual([
      ["France", "stamp"],
      ["Monaco", "stamp"],
      ["Austria", "planned"],
    ]);
    expect(europe).toHaveLength(3);
  });

  it("fills pages of nine and counts each continent's progress", () => {
    for (const page of passport.pages)
      expect(page.slots.length).toBeLessThanOrEqual(9);
    expect(slots).toHaveLength(5);
    const asia = passport.continents.find(
      ({ continent }) => continent === Continent.ASIA,
    );
    expect(asia?.stamped).toBe(1);
    expect(asia?.total).toBeGreaterThan(40);
  });

  it("counts the continents entered", () => {
    expect(passport.continentsEntered).toBe(2);
  });

  it("works with no trips and no home at all", () => {
    const empty = buildPassport({
      futureCities: [],
      futureTrips: [],
      homeCity: null,
      locale: "it-IT",
      perPage: 6,
      visitedTrips: [],
    });
    expect(empty.issuing).toBeNull();
    expect(empty.stamps).toBe(0);
    expect(empty.pages).toHaveLength(0);
    expect(empty.continents).toHaveLength(0);
  });
});
