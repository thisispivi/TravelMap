import { describe, expect, it } from "vitest";

import type { WorldSources } from "../schema";
import { Continent } from "../typings/Continent";
import { Currency } from "../typings/Currency";
import { buildWorld } from "./buildWorld";

/**
 * Builds a city document in Italy for the fixtures below.
 * @param {string} id - The city id
 * @param {[number, number]} coordinates - Longitude and latitude
 * @returns {WorldSources["cities"][number]} The city document
 */
function italianCity(
  id: string,
  coordinates: [number, number],
): WorldSources["cities"][number] {
  return {
    coordinates,
    countryId: "italy",
    id,
    name: id[0]!.toUpperCase() + id.slice(1),
    timeZone: "Europe/Rome",
  };
}

const rome = {
  checkIn: "2026-05-01",
  checkOut: "2026-05-04",
  cityId: "rome",
  type: "stay" as const,
};

const sources: WorldSources = {
  cities: [
    italianCity("cagliari", [9.11, 39.22]),
    italianCity("rome", [12.4964, 41.9028]),
    italianCity("tivoli", [12.7977, 41.9637]),
    italianCity("ostia", [12.2858, 41.7319]),
    italianCity("florence", [11.2558, 43.7696]),
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
      eDate: "2026-05-06",
      id: "rome-2026",
      originCityId: "cagliari",
      sDate: "2026-05-01",
      steps: [
        {
          legs: [
            {
              arrive: "2026-05-01T09:10",
              depart: "2026-05-01T08:00",
              mode: "plane",
              toId: "rome",
            },
          ],
          type: "move",
        },
        {
          ...rome,
          outings: [
            {
              date: "2026-05-02",
              legs: [
                { distanceInKm: 30, mode: "bus", toId: "tivoli" },
                { distanceInKm: 40, mode: "bus", toId: "ostia" },
                { distanceInKm: 25, mode: "walk", toId: "rome" },
              ],
            },
          ],
        },
        {
          legs: [{ distanceInKm: 280, mode: "train", toId: "florence" }],
          type: "move",
        },
        {
          checkIn: "2026-05-04",
          checkOut: "2026-05-06",
          cityId: "florence",
          type: "stay",
        },
        {
          legs: [
            { mode: "train", toId: "rome" },
            { mode: "plane", toId: "cagliari" },
          ],
          type: "move",
        },
      ],
      title: "Rome",
    },
  ],
};

describe("buildWorld", () => {
  it.each(["cities", "countries", "trips"] as const)(
    "refuses duplicate %s identifiers instead of shadowing documents",
    (kind) => {
      expect(() =>
        buildWorld({
          ...sources,
          [kind]: [...sources[kind], ...sources[kind]],
        }),
      ).toThrow(/Duplicate id/);
    },
  );

  it("resolves references to shared domain objects", () => {
    const world = buildWorld(sources);
    const [trip] = world.trips;

    expect(trip!.stays[0]!.city).toBe(world.citiesById.get("rome"));
    expect(trip!.origin).toBe(world.citiesById.get("cagliari"));
    expect(trip!.sDate).toEqual(new Date(2026, 4, 1));
  });

  it("starts every leg where the previous one ended", () => {
    const legs = buildWorld(sources).trips[0]!.getLegs();

    expect(legs.map((leg) => `${leg.from.id}>${leg.to.id}`)).toEqual([
      "cagliari>rome",
      "rome>tivoli",
      "tivoli>ostia",
      "ostia>rome",
      "rome>florence",
      "florence>rome",
      "rome>cagliari",
    ]);
  });

  it("dates every day-trip leg with the day trip", () => {
    const [outing] = buildWorld(sources).trips[0]!.stays[0]!.outings;

    expect(outing!.legs.map((leg) => leg.date)).toEqual([
      "2026-05-02",
      "2026-05-02",
      "2026-05-02",
    ]);
  });

  it("reads a leg's duration from its local clocks when none is authored", () => {
    const [flight] = buildWorld(sources).trips[0]!.getLegs();

    expect(flight!.duration).toEqual({ estimated: false, value: 70 });
  });

  it("fails at the boundary for malformed documents", () => {
    expect(() =>
      buildWorld({
        ...sources,
        cities: [{ ...sources.cities[0]!, coordinates: [999, 41.9] }],
      }),
    ).toThrow(/Malformed dataset/);
  });

  it("names unresolved references close to their source", () => {
    expect(() =>
      buildWorld({
        ...sources,
        trips: [{ ...sources.trips[0]!, originCityId: "missing" }],
      }),
    ).toThrow('trip rome-2026 references unknown id "missing"');
  });

  it("orders trips by start date, then id, whatever order they loaded in", () => {
    const later = {
      ...sources.trips[0]!,
      eDate: "2027-01-04",
      id: "rome-2027",
      sDate: "2027-01-01",
    };
    const alsoLater = { ...later, id: "aaa-2027" };

    expect(
      buildWorld({
        ...sources,
        trips: [later, sources.trips[0]!, alsoLater],
      }).trips.map((trip) => trip.id),
    ).toEqual(["rome-2026", "aaa-2027", "rome-2027"]);
  });

  it("attaches galleries to stays and to places seen on a day trip", () => {
    const image = {
      height: 2,
      original: "/Italy/Rome/001c.webp",
      thumbnail: "/Italy/Rome/001t.webp",
      width: 3,
    };
    const trip = sources.trips[0]!;
    const world = buildWorld({
      ...sources,
      photos: { "Italy/Rome/tr": [image], "Italy/Tivoli/tr": [image] },
      trips: [
        {
          ...trip,
          steps: [
            trip.steps[0]!,
            {
              ...rome,
              outings: [
                {
                  date: "2026-05-02",
                  legs: [
                    {
                      mode: "bus",
                      photoPath: "Italy/Tivoli/tr",
                      toId: "tivoli",
                    },
                    { mode: "bus", toId: "rome" },
                  ],
                },
              ],
              photoPath: "Italy/Rome/tr",
            },
          ],
        },
      ],
    });
    const tivoli = world.citiesById.get("tivoli")!;

    expect(world.trips[0]!.stays[0]!.photos).toEqual([image]);
    expect(world.trips[0]!.getCityTravels(tivoli)[0]!.photos).toEqual([image]);
  });

  it("leaves a stay pointing at a missing manifest with an empty gallery", () => {
    const trip = sources.trips[0]!;
    const world = buildWorld({
      ...sources,
      trips: [{ ...trip, steps: [{ ...rome, photoPath: "nothing/here" }] }],
    });

    expect(world.trips[0]!.stays[0]!.photos).toEqual([]);
  });

  it("lists a lived-in city once when both the city and the config say so", () => {
    const world = buildWorld({
      ...sources,
      cities: sources.cities.map((city) =>
        city.id === "rome" ? { ...city, isLived: true } : city,
      ),
      livedCityIds: ["rome"],
    });

    expect(world.livedCities.map((city) => city.id)).toEqual(["rome"]);
  });

  it("refuses a value that is not a dataset at all", () => {
    expect(() => buildWorld(null)).toThrow(/Malformed dataset/);
    expect(() => buildWorld({})).toThrow(/Malformed dataset/);
  });

  it("leaves a video out of the gallery until it has a YouTube id", () => {
    const photo = {
      height: 2,
      original: "/Italy/Rome/001c.webp",
      thumbnail: "/Italy/Rome/001t.webp",
      width: 3,
    };
    const unfinishedVideo = {
      height: 9,
      original: "",
      thumbnail: "/Italy/Rome/002t.webp",
      width: 16,
      youtube: true,
    };
    const world = buildWorld({
      ...sources,
      photos: { "Italy/Rome/tr": [photo, unfinishedVideo] },
      trips: [
        {
          ...sources.trips[0]!,
          steps: [{ ...rome, photoPath: "Italy/Rome/tr" }],
        },
      ],
    });

    expect(world.trips[0]!.stays[0]!.photos).toEqual([photo]);
  });
});

describe("Trip", () => {
  const [trip] = buildWorld(sources).trips;

  it("counts only nights slept in a stay", () => {
    expect(trip!.getNights()).toBe(5);
  });

  it("adds up every mode, walking included", () => {
    const totals = trip!.getModeTotals();

    expect(totals.walk).toEqual({
      count: 1,
      km: 25,
      minutes: expect.any(Number),
    });
    expect(totals.bus?.km).toBe(70);
    expect(totals.train?.count).toBe(2);
  });

  it("never counts a flight without an airline as zero kilometres", () => {
    expect(trip!.getFlights().every((flight) => flight.distanceInKm > 0)).toBe(
      true,
    );
  });

  it("tells stays, places seen, and places passed through apart", () => {
    expect(
      trip!.destinations.map(({ city, kind }) => `${kind}:${city.id}`),
    ).toEqual([
      "stopover:cagliari",
      "stay:rome",
      "visit:tivoli",
      "visit:ostia",
      "stay:florence",
      "stopover:rome",
      "stopover:cagliari",
    ]);
  });

  it("ends where the last leg arrives", () => {
    expect(trip!.returnTo.id).toBe("cagliari");
  });
});
