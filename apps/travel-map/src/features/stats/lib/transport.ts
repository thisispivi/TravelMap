import {
  City,
  CompanyId,
  CompanyMode,
  CompanyModeSchema,
  Country,
  TransportMode,
  TransportModeSchema,
  Trip,
  TripLeg,
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
interface CompanyStat {
  company: CompanyId;
  count: number;
}

/**
 * The operators of one kind of transport.
 * @property {CompanyMode} mode - What they run
 * @property {CompanyStat[]} companies - The operators, most used first
 */
export interface OperatorGroup {
  mode: CompanyMode;
  companies: CompanyStat[];
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
 * Ranks the operators of each kind of transport by how many rides they ran, so
 * a flight and a crossing never compete for the same place. A company's own tag
 * says which kind it belongs to; one not tagged yet goes by the ride. Rides with
 * no recorded operator are skipped rather than grouped under a blank name, and a
 * kind nobody used is left out.
 * @param {Pick<TripLeg, "company" | "mode">[]} legs - The rides taken
 * @param {(company: CompanyId) => CompanyMode | undefined} modeOf - Reads a company's tag
 * @returns {OperatorGroup[]} One group per kind used
 */
export function getOperatorGroups(
  legs: Pick<TripLeg, "company" | "mode">[],
  modeOf: (company: CompanyId) => CompanyMode | undefined,
): OperatorGroup[] {
  const counts = new Map<TransportMode, Map<CompanyId, number>>();
  for (const { company, mode } of legs) {
    if (!company) continue;
    const group = modeOf(company) ?? mode;
    const companies = counts.get(group) ?? new Map<CompanyId, number>();
    companies.set(company, (companies.get(company) ?? 0) + 1);
    counts.set(group, companies);
  }
  return CompanyModeSchema.options.flatMap((mode) => {
    const companies = counts.get(mode);
    return companies
      ? [
          {
            companies: [...companies]
              .map(([company, count]) => ({ company, count }))
              .sort((first, second) => second.count - first.count),
            mode,
          },
        ]
      : [];
  });
}
