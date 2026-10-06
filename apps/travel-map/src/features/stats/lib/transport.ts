import {
  City,
  CompanyId,
  Country,
  Ferry,
  Flight,
  TransportMode,
  TransportModeSchema,
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
 * @property {number} km - The distance in kilometers
 * @property {number} minutes - The time spent travelling this way
 */
export interface TransportModeStat {
  mode: TransportMode;
  count: number;
  km: number;
  minutes: number;
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
 * Adds up rides, distance, and time for every transport mode across trips,
 * from the totals each trip already resolved — so a flight with no airline or
 * a walk counts here exactly as it does on the trip's own page.
 * @param {Trip[]} trips - All trips
 * @returns {TransportModeStat[]} Stats per mode sorted by count descending, unused modes omitted
 */
export function getTransportModeStats(trips: Trip[]): TransportModeStat[] {
  const stats = new Map<TransportMode, TransportModeStat>(
    TransportModeSchema.options.map((mode) => [
      mode,
      { count: 0, km: 0, minutes: 0, mode },
    ]),
  );
  for (const trip of trips) {
    const totals = trip.getModeTotals();
    for (const [mode, stat] of stats) {
      const total = totals[mode];
      if (!total) continue;
      stat.count += total.count;
      stat.km += total.km;
      stat.minutes += total.minutes;
    }
  }
  return [...stats.values()]
    .filter((stat) => stat.count > 0)
    .sort((first, second) => second.count - first.count);
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
