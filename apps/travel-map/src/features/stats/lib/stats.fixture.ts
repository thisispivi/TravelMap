import { buildWorld, City, Continent, Currency, Trip } from "@travelmap/core";

/* id: [lng, lat, IANA zone, population] */
const PLACES: Record<string, [number, number, string, number?]> = {
  cagliari: [9.11, 39.22, "Europe/Rome", 150_000],
  istanbul: [28.97, 41.01, "Europe/Istanbul", 15_000_000],
  oslo: [10.75, 59.91, "Europe/Oslo", 700_000],
  lisbon: [-9.14, 38.72, "Europe/Lisbon"],
  sydney: [151.21, -33.87, "Australia/Sydney", 5_000_000],
  auckland: [174.76, -36.85, "Pacific/Auckland"],
  losAngeles: [-118.24, 34.05, "America/Los_Angeles"],
};

/**
 * Builds real trips from authored JSON, over a small atlas of places.
 * @param {unknown[]} trips - The authored trips
 * @returns {{ trips: Trip[]; city: (id: string) => City }} The trips, and a lookup for the places they use
 */
export function buildFixture(trips: unknown[]): {
  trips: Trip[];
  city: (id: string) => City;
} {
  const world = buildWorld({
    cities: Object.entries(PLACES).map(
      ([id, [lng, lat, timeZone, population]]) => ({
        coordinates: [lng, lat],
        countryId: id,
        id,
        name: id,
        population,
        timeZone,
      }),
    ),
    countries: Object.keys(PLACES).map((id) => ({
      color: { h: 0, l: 0, s: 0 },
      continent: Continent.EUROPE,
      currency: Currency.EUR,
      id,
      name: id,
    })),
    photos: {},
    trips,
  });

  return {
    city: (id) => {
      const found = world.citiesById.get(id);
      if (!found) throw new Error(`No fixture city ${id}`);
      return found;
    },
    trips: world.trips,
  };
}

/**
 * Writes a one-step-after-another trip: leaves the origin, rides, sleeps.
 * @param {string} id - The trip id, also its title
 * @param {string} sDate - The first day
 * @param {string} eDate - The last day
 * @param {unknown[]} steps - The authored steps
 * @returns {unknown} The authored trip
 */
export function tripJson(
  id: string,
  sDate: string,
  eDate: string,
  steps: unknown[],
): unknown {
  return { eDate, id, originCityId: "cagliari", sDate, steps, title: id };
}

/**
 * Writes a stay with no day trips.
 * @param {string} cityId - The city
 * @param {string} checkIn - The first night
 * @param {string} checkOut - The morning of departure
 * @returns {unknown} The authored stay
 */
export function stayJson(
  cityId: string,
  checkIn: string,
  checkOut: string,
): unknown {
  return { checkIn, checkOut, cityId, outings: [], type: "stay" };
}

/**
 * Writes a move out of its rides.
 * @param {unknown[]} legs - The rides
 * @returns {unknown} The authored move
 */
export function moveJson(...legs: unknown[]): unknown {
  return { legs, type: "move" };
}
