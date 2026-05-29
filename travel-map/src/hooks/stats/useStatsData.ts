import { useMemo } from "react";

import { Continent } from "@/core";
import {
  takenFerries,
  takenFlights,
  visitedCities,
  visitedCountries,
  visitedTrips,
} from "@/data";
import { getTotalMediaTaken } from "@/utils/cities";
import { getContinentsByCities, getContinentStats } from "@/utils/continent";
import { getCurrenciesFromCountries } from "@/utils/countries";
import {
  getFurthestAndNearestCity,
  getMinAndMaxTransport,
  getTotalMileage,
} from "@/utils/distance";
import { constants, parameters } from "@/utils/parameters";
import {
  getCityBiggestTimezoneJump,
  getNumberOfTimezonesJumped,
} from "@/utils/timezone";
import {
  getCountryVisitStats,
  getFerryCompanyStats,
  getFlightCompanyStats,
  getTransportModeStats,
} from "@/utils/transport";
import { getCityTravels } from "@/utils/trips";

/**
 * Pre-computed travel statistics derived from all visited data.
 * Consumed by the stats bento grid and its card components.
 */
export type StatsData = ReturnType<typeof computeStats>;

function computeStats() {
  const {
    EARTH_CIRCUMFERENCE,
    MOON_DISTANCE,
    TOTAL_CONTINENTS,
    TOTAL_COUNTRIES,
    TOTAL_UNESCO_SITES,
  } = constants;

  const visitedCountriesCount = visitedCountries.length;

  const { furthest: furthestCity, nearest: nearestCity } =
    getFurthestAndNearestCity(visitedCities, parameters.birthCity);

  const { max: maxFlight, min: minFlight } =
    getMinAndMaxTransport(takenFlights);
  const { max: maxFerry, min: minFerry } = getMinAndMaxTransport(takenFerries);

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
  const usedCurrencies = getCurrenciesFromCountries(visitedCountries);
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
  const avgTripDays = Math.round(totalDaysAbroad / visitedTrips.length);
  const firstTripYear = Math.min(
    ...visitedTrips.map((t) => t.sDate.getFullYear()),
  );
  const yearsTraveling = new Date().getFullYear() - firstTripYear;

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
    usedCurrencies,
    numUnescoSites,
    totalDaysAbroad,
    avgTripDays,
    yearsTraveling,
    transportModeStats,
    flightCompanyStats,
    ferryCompanyStats,
    countryVisitStats,
    kmByModeStats,
    // expose these so cards don't need to re-import constants
    EARTH_CIRCUMFERENCE,
    MOON_DISTANCE,
    TOTAL_CONTINENTS,
    TOTAL_COUNTRIES,
    TOTAL_UNESCO_SITES,
  };
}

/**
 * useStatsData hook
 *
 * Computes all travel statistics needed by the stats bento grid. The result
 * is memoized for the lifetime of the component tree — all inputs are module-
 * level constants, so the memo never invalidates.
 *
 * @returns {StatsData} The full set of pre-computed stats
 */
export function useStatsData(): StatsData {
  return useMemo(() => computeStats(), []);
}
