import {
  City,
  Ferry,
  FerryCompany,
  Flight,
  FlightCompany,
  TransportMode,
  Trip,
  TripTransportStep,
} from "@/core";

export interface CountryVisitStat {
  countryId: string;
  cities: number;
}

/**
 * Count how many visited cities belong to each country.
 * @param {City[]} cities - All visited cities
 * @returns {CountryVisitStat[]} Stats per country sorted by city count descending
 */
export function getCountryVisitStats(cities: City[]): CountryVisitStat[] {
  const map = new Map<string, number>();
  for (const city of cities) {
    const id = city.country.id;
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([countryId, count]) => ({ countryId, cities: count }))
    .sort((a, b) => b.cities - a.cities);
}

export interface TransportModeStat {
  mode: TransportMode;
  count: number;
  km: number;
}

export interface CompanyStat<T> {
  company: T;
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
    const steps = trips
      .flatMap((t) => t.steps)
      .filter(
        (s): s is TripTransportStep =>
          s.type === "transport" && s.mode === mode,
      );
    const count = steps.reduce((acc, s) => acc + (s.roundTrip ? 2 : 1), 0);
    const km = steps.reduce(
      (acc, s) => acc + (s.distanceInKm ?? 0) * (s.roundTrip ? 2 : 1),
      0,
    );
    return { mode, count, km };
  });

  const allStats: TransportModeStat[] = [
    {
      mode: "plane" as TransportMode,
      count: flights.length,
      km: flights.reduce((acc, f) => acc + (f.distanceInKm ?? 0), 0),
    },
    {
      mode: "ferry" as TransportMode,
      count: ferries.length,
      km: ferries.reduce((acc, f) => acc + (f.distanceInKm ?? 0), 0),
    },
    ...groundStats,
  ];

  return allStats.filter((s) => s.count > 0).sort((a, b) => b.count - a.count);
}

/**
 * Rank flight companies by number of flight legs taken.
 * @param {Flight[]} flights - All taken flights
 * @returns {CompanyStat<FlightCompany>[]} Stats per company sorted by count descending
 */
export function getFlightCompanyStats(
  flights: Flight[],
): CompanyStat<FlightCompany>[] {
  const map = new Map<FlightCompany, number>();
  for (const flight of flights) {
    if (flight.company) {
      map.set(flight.company, (map.get(flight.company) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Rank ferry companies by number of ferry crossings taken.
 * @param {Ferry[]} ferries - All taken ferries
 * @returns {CompanyStat<FerryCompany>[]} Stats per company sorted by count descending
 */
export function getFerryCompanyStats(
  ferries: Ferry[],
): CompanyStat<FerryCompany>[] {
  const map = new Map<FerryCompany, number>();
  for (const ferry of ferries) {
    if (ferry.company) {
      map.set(ferry.company, (map.get(ferry.company) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count);
}
