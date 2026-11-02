import { Continent } from "@travelmap/core";

import { placePhotoCount, tripAlbums } from "@/data/albums";
import {
  livedCities,
  siteConfig,
  takenFlights,
  visitedCities,
  visitedCountries,
  visitedTrips,
} from "@/data/world";
import { constants, parameters } from "@/shared/lib/parameters";
import { getNumberOfTimezonesJumped } from "@/shared/lib/timezone";

import { getTravelClock } from "./clock";
import { getContinentStats } from "./continents";
import { getCurrencyCountries } from "./countries";
import { getLineCrossings } from "./crossings";
import { getHemispheres, getMapEdges, getSleptInCities } from "./edges";
import { getFlightTypeStats } from "./flightTypes";
import { getPlaceRankings, getTripRankings } from "./rankings";
import { getRecords } from "./records";
import {
  getCountryVisitStats,
  getOperatorGroups,
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
  const sleptIn = getSleptInCities(visitedTrips, livedCities);
  const km = Math.round(modes.reduce((sum, mode) => sum + mode.km, 0));

  return {
    aroundEarth: km / constants.EARTH_CIRCUMFERENCE,
    avgTripDays:
      visitedTrips.length > 0 ? Math.round(totalDays / visitedTrips.length) : 0,
    cities: visitedCities.length,
    clock: getTravelClock(visitedTrips),
    continents: Object.values(Continent)
      .map((continent) =>
        getContinentStats(continent, visitedCities, visitedCountries),
      )
      .filter((stat) => stat.cities > 0)
      .sort((first, second) => second.countries - first.countries),
    countries: visitedCountries.length,
    countriesByCities: getCountryVisitStats(visitedCities),
    countryShare: visitedCountries.length / constants.TOTAL_COUNTRIES,
    crossings: getLineCrossings(visitedTrips),
    currencies: getCurrencyCountries(visitedCountries),
    edges: getMapEdges(sleptIn),
    flightTypes: getFlightTypeStats(takenFlights),
    hemispheres: getHemispheres(sleptIn),
    km,
    modes,
    nights: visitedTrips.reduce((sum, trip) => sum + trip.getNights(), 0),
    operators: getOperatorGroups(
      visitedTrips.flatMap((trip) => trip.getLegs()),
      (company) => siteConfig?.companies?.[company]?.mode,
    ),
    perYear: perYear(),
    photos: tripAlbums.reduce((sum, { album }) => sum + album.count, 0),
    placeRankings: getPlaceRankings({
      lived: livedCities,
      photosOf: placePhotoCount,
      trips: visitedTrips,
    }),
    records: getRecords({
      home: parameters.homeCity,
      lived: livedCities,
      trips: visitedTrips,
    }),
    timezones: getNumberOfTimezonesJumped(visitedCities),
    toMoon: km / constants.MOON_DISTANCE,
    totalContinents: constants.TOTAL_CONTINENTS,
    totalCountries: constants.TOTAL_COUNTRIES,
    tripRankings: getTripRankings(visitedTrips),
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
