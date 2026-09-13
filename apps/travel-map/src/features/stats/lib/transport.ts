import {
  City,
  CompanyId,
  Country,
  Ferry,
  Flight,
  TransportMode,
  Trip,
} from "@travelmap/core";

/**
 * The number of visited cities recorded for a country.
 * @property {Country} country - The visited country, which carries its own name
 * @property {number} cities - The number of visited cities
 */
export interface CountryVisitStat {
  country: Country;
  cities: number;
}

/**
 * Count how many visited cities belong to each country.
 * @param {City[]} cities - All visited cities
 * @returns {CountryVisitStat[]} Stats per country sorted by city count descending
 */
export function getCountryVisitStats(cities: City[]): CountryVisitStat[] {
  const counts = new Map<Country, number>();
  for (const city of cities) {
    counts.set(city.country, (counts.get(city.country) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([country, count]) => ({ country, cities: count }))
    .sort((a, b) => b.cities - a.cities);
}

/**
 * Aggregated usage statistics for a transport mode.
 * @property {TransportMode} mode - The transport mode
 * @property {number} count - The number of recorded journeys
 * @property {number} km - The recorded distance in kilometers
 */
export interface TransportModeStat {
  mode: TransportMode;
  count: number;
  km: number;
}

/**
 * Aggregated usage statistics for a transport operator.
 * @property {CompanyId} company - The operator id, named by the site configuration
 * @property {number} count - The number of recorded journeys
 */
export interface CompanyStat {
  company: CompanyId;
  count: number;
}

/**
 * Aggregate count and km for each transport mode across all trips, excluding walk.
 * Uses pre-computed Flight/Ferry objects for plane and ferry (which include haversine distances),
 * and raw trip steps for ground transport modes.
 * @param {Trip[]} trips - All trips
 * @param {Flight[]} flights - Pre-computed flight objects
 * @param {Ferry[]} ferries - Pre-computed ferry objects
 * @returns {TransportModeStat[]} Stats per mode sorted by count descending, zero-count modes omitted
 */
export function getTransportModeStats(
  trips: Trip[],
  flights: Flight[],
  ferries: Ferry[],
): TransportModeStat[] {
  const groundModes: TransportMode[] = ["train", "bus", "car", "taxi"];

  const groundStats = groundModes.map((mode) => {
    const steps = trips.flatMap((trip) =>
      trip.steps.flatMap((step) =>
        step.type === "transport" && step.mode === mode ? [step] : [],
      ),
    );
    const count = steps.length;
    const km = steps.reduce(
      (total, step) => total + (step.distanceInKm ?? 0),
      0,
    );
    return { mode, count, km };
  });

  const allStats: TransportModeStat[] = [
    {
      mode: "plane",
      count: flights.length,
      km: flights.reduce((acc, f) => acc + (f.distanceInKm ?? 0), 0),
    },
    {
      mode: "ferry",
      count: ferries.length,
      km: ferries.reduce((acc, f) => acc + (f.distanceInKm ?? 0), 0),
    },
    ...groundStats,
  ];

  return allStats.filter((s) => s.count > 0).sort((a, b) => b.count - a.count);
}

/**
 * Rank transport operators by how many of the given journeys they carried.
 * Journeys with no recorded operator are skipped rather than grouped under a
 * blank name.
 * @param {(Flight | Ferry)[]} journeys - Taken flights or ferry crossings
 * @returns {CompanyStat[]} Stats per operator sorted by count descending
 */
export function getCompanyStats(journeys: (Flight | Ferry)[]): CompanyStat[] {
  const counts = new Map<CompanyId, number>();
  for (const { company } of journeys) {
    if (company) counts.set(company, (counts.get(company) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([company, count]) => ({ company, count }))
    .sort((first, second) => second.count - first.count);
}
