import { Continent } from "@travelmap/core";

import {
  takenFerries,
  takenFlights,
  visitedCities,
  visitedCountries,
  visitedTrips,
} from "@/data/world";
import { constants, parameters } from "@/shared/lib/parameters";
import {
  getCityBiggestTimezoneJump,
  getNumberOfTimezonesJumped,
} from "@/shared/lib/timezone";
import { getCityTravels } from "@/shared/lib/travelQueries";

import { getTotalMediaTaken } from "./cities";
import { getContinentsByCities, getContinentStats } from "./continents";
import { getCurrencyCountries } from "./countries";
import {
  getFurthestAndNearestCity,
  getMinAndMaxTransport,
  getTotalMileage,
} from "./distance";
import {
  getCountryVisitStats,
  getFerryCompanyStats,
  getFlightCompanyStats,
  getTransportModeStats,
} from "./transport";

/**
 * Pre-computed travel statistics derived from all visited data.
 * Consumed by the stats bento grid and its card components.
 */
export type StatsData = ReturnType<typeof computeStats>;

/**
 * Computes the complete statistics snapshot from the authored travel data.
 * @returns {StatsData} The statistics consumed by the dashboard cards
 */
function computeStats() {
  const {
    EARTH_CIRCUMFERENCE,
    MOON_DISTANCE,
    TOTAL_CONTINENTS,
    TOTAL_COUNTRIES,
    TOTAL_UNESCO_SITES,
  } = constants;
  const visitedCountriesCount = visitedCountries.length;
  const furthestAndNearestCity = parameters.homeCity
    ? getFurthestAndNearestCity(visitedCities, parameters.homeCity)
    : undefined;
  const furthestCity = furthestAndNearestCity?.furthest;
  const nearestCity = furthestAndNearestCity?.nearest;
  const flightData = getMinAndMaxTransport(takenFlights);
  const minFlight = flightData?.min;
  const maxFlight = flightData?.max;
  const ferryData = getMinAndMaxTransport(takenFerries);
  const minFerry = ferryData?.min;
  const maxFerry = ferryData?.max;
  const totalMileage = getTotalMileage(takenFlights, takenFerries);
  const totalMileageAroundEarth = (
    Number(totalMileage) / EARTH_CIRCUMFERENCE
  ).toFixed(2);
  const totalMileageToMoon = (Number(totalMileage) / MOON_DISTANCE).toFixed(2);
  const visitedContinents = getContinentsByCities(visitedCities);
  const allContinents = Object.values(Continent).filter(
    (v): v is Continent => typeof v === "string",
  );
  const continentCities = allContinents
    .map((c) => getContinentStats(c, visitedCities, visitedCountries))
    .sort((a, b) => b.countries - a.countries);
  const cityBiggestTimezoneJump = getCityBiggestTimezoneJump(visitedCities);
  const cityBiggestTimezoneJumpTravel = cityBiggestTimezoneJump
    ? getCityTravels(cityBiggestTimezoneJump, visitedTrips)[0]
    : undefined;
  const numberTimezonesJumped = getNumberOfTimezonesJumped(visitedCities);
  const totalMediaTaken = getTotalMediaTaken(visitedCities);
  const currencyCountries = getCurrencyCountries(visitedCountries);
  const numUnescoSites = Object.values(parameters.stats.unescoSites).reduce(
    (acc, sites) => acc + sites.length,
    0,
  );
  const totalDaysAbroad = visitedTrips.reduce(
    (acc, trip) =>
      acc +
      Math.round(
        (trip.eDate.getTime() - trip.sDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    0,
  );
  const avgTripDays =
    visitedTrips.length > 0
      ? Math.round(totalDaysAbroad / visitedTrips.length)
      : 0;
  const yearsTraveling =
    visitedTrips.length > 0
      ? new Date().getFullYear() -
        Math.min(...visitedTrips.map((t) => t.sDate.getFullYear()))
      : 0;
  const transportModeStats = getTransportModeStats(
    visitedTrips,
    takenFlights,
    takenFerries,
  );
  const flightCompanyStats = getFlightCompanyStats(takenFlights);
  const ferryCompanyStats = getFerryCompanyStats(takenFerries);
  const countryVisitStats = getCountryVisitStats(visitedCities);
  const kmByModeStats = [...transportModeStats]
    .filter((s) => s.km > 0)
    .sort((a, b) => b.km - a.km);
  return {
    visitedCountriesCount,
    furthestCity,
    nearestCity,
    maxFlight,
    minFlight,
    maxFerry,
    minFerry,
    totalMileage,
    totalMileageAroundEarth,
    totalMileageToMoon,
    visitedContinents,
    allContinents,
    continentCities,
    cityBiggestTimezoneJump,
    cityBiggestTimezoneJumpTravel,
    numberTimezonesJumped,
    totalMediaTaken,
    currencyCountries,
    numUnescoSites,
    totalDaysAbroad,
    avgTripDays,
    yearsTraveling,
    transportModeStats,
    flightCompanyStats,
    ferryCompanyStats,
    countryVisitStats,
    kmByModeStats,
    EARTH_CIRCUMFERENCE,
    MOON_DISTANCE,
    TOTAL_CONTINENTS,
    TOTAL_COUNTRIES,
    TOTAL_UNESCO_SITES,
  };
}

/**
 * Computes all travel statistics needed by the stats bento grid. The result
 * is memoized for the lifetime of the component tree — all inputs are module-
 * level constants, so the memo never invalidates.
 * @returns {StatsData} The full set of pre-computed stats
 */
export function useStatsData(): StatsData {
  return computeStats();
}
