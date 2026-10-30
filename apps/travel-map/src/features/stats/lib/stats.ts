import { Continent } from "@travelmap/core";

import { tripAlbums } from "@/data/albums";
import {
  takenFerries,
  takenFlights,
  visitedCities,
  visitedCountries,
  visitedTrips,
} from "@/data/world";
import { constants, parameters } from "@/shared/lib/parameters";
import { getNumberOfTimezonesJumped } from "@/shared/lib/timezone";

import { getContinentStats } from "./continents";
import { getCurrencyCountries } from "./countries";
import { getFurthestAndNearestCity, getMinAndMaxTransport } from "./distance";
import {
  getCompanyStats,
  getCountryVisitStats,
  getTransportModeStats,
} from "./transport";

/**
 * One year of travel.
 * @property {number} year - The year
 * @property {number} days - Days away, counted by the year a trip started
 * @property {number} trips - Trips that started in it
 */
interface YearTotals {
  year: number;
  days: number;
  trips: number;
}

/**
 * Totals days away and trips per year, every year from the first trip to the
 * last so a year without travel shows as an empty column rather than
 * vanishing.
 * @returns {YearTotals[]} The years, oldest first
 */
function perYear(): YearTotals[] {
  if (visitedTrips.length === 0) return [];
  const totals = new Map<number, YearTotals>();
  for (const trip of visitedTrips) {
    const year = trip.sDate.getFullYear();
    const total = totals.get(year) ?? { days: 0, trips: 0, year };
    total.days += trip.getDurationInDays();
    total.trips += 1;
    totals.set(year, total);
  }
  const years = [...totals.keys()];
  const first = Math.min(...years);
  return Array.from(
    { length: Math.max(...years) - first + 1 },
    (_, index) =>
      totals.get(first + index) ?? { days: 0, trips: 0, year: first + index },
  );
}

/**
 * Every figure the statistics page shows, derived once from the record.
 * @returns {object} The statistics
 */
function computeStats() {
  const modes = getTransportModeStats(visitedTrips);
  const totalDays = visitedTrips.reduce(
    (sum, trip) => sum + trip.getDurationInDays(),
    0,
  );
  const home = parameters.homeCity;
  const places = home
    ? getFurthestAndNearestCity(visitedCities, home)
    : undefined;

  const km = Math.round(modes.reduce((sum, mode) => sum + mode.km, 0));

  return {
    airlines: getCompanyStats(takenFlights),
    aroundEarth: km / constants.EARTH_CIRCUMFERENCE,
    avgTripDays:
      visitedTrips.length > 0 ? Math.round(totalDays / visitedTrips.length) : 0,
    cities: visitedCities.length,
    continents: Object.values(Continent)
      .map((continent) =>
        getContinentStats(continent, visitedCities, visitedCountries),
      )
      .filter((stat) => stat.cities > 0)
      .sort((first, second) => second.countries - first.countries),
    countries: visitedCountries.length,
    countriesByCities: getCountryVisitStats(visitedCities),
    countryShare: visitedCountries.length / constants.TOTAL_COUNTRIES,
    currencies: getCurrencyCountries(visitedCountries),
    ferryLines: getCompanyStats(takenFerries),
    furthestCity: places?.furthest,
    km,
    longestFerry: getMinAndMaxTransport(takenFerries)?.max,
    longestFlight: getMinAndMaxTransport(takenFlights)?.max,
    modes,
    nights: visitedTrips.reduce((sum, trip) => sum + trip.getNights(), 0),
    perYear: perYear(),
    photos: tripAlbums.reduce((sum, { album }) => sum + album.count, 0),
    shortestFlight: getMinAndMaxTransport(takenFlights)?.min,
    timezones: getNumberOfTimezonesJumped(visitedCities),
    toMoon: km / constants.MOON_DISTANCE,
    totalContinents: constants.TOTAL_CONTINENTS,
    totalCountries: constants.TOTAL_COUNTRIES,
    trips: visitedTrips.length,
    unesco: Object.values(parameters.stats.unescoSites).reduce(
      (sum, sites) => sum + sites.length,
      0,
    ),
    visitedContinents: new Set(
      visitedCountries.map((country) => country.continent),
    ).size,
    yearsTraveling:
      visitedTrips.length > 0
        ? new Date().getFullYear() -
          Math.min(...visitedTrips.map((trip) => trip.sDate.getFullYear()))
        : 0,
  };
}

/** The statistics page's figures. */
export type Stats = ReturnType<typeof computeStats>;

/** The record never changes while the page is open, so it is read once. */
export const stats: Stats = computeStats();
