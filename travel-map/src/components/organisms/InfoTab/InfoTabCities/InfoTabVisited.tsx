import { JSX, useCallback, useMemo } from "react";
import { City, Travel } from "@/core";
import "./InfoTabVisited.scss";
import { visitedCities, visitedCountries } from "@/data";
import InfoTabCities from "./InfoTabCities";
import {
  getCitiesByCountriesAndIsFuture,
  sortByTravelStartDate,
} from "@/utils/cities";

interface InfoTabVisitedProps {
  className?: string;
  isVisible?: boolean;
}

/**
 * InfoTabVisited component
 *
 * The info tab visited component is used to display the visited
 * cities and countries.
 *
 * @component
 *
 * @param {InfoTabVisitedProps} props - The props of the component
 * @param {string} props.className - The class to apply to the info tab visited
 * @param {boolean} props.isVisible - The visibility of the info tab visited
 * @returns {JSX.Element} - The info tab visited
 */
export default function InfoTabVisited({
  className = "",
  isVisible = false,
}: InfoTabVisitedProps): JSX.Element {
  const allCities = useMemo(() => {
    const result = getCitiesByCountriesAndIsFuture({
      cities: visitedCities,
      countries: visitedCountries,
      isFuture: false,
    });

    return [...result].sort(sortByTravelStartDate);
  }, []);

  const travelsByCityName = useMemo(() => {
    return new globalThis.Map<string, Travel[]>(
      visitedCities.map((city) => [city.name, city.travels])
    );
  }, []);

  const getTravelIdx = useCallback(
    (city: City, travel: Travel) => {
      const travels = travelsByCityName.get(city.name);
      return travels ? travels.indexOf(travel) : -1;
    },
    [travelsByCityName]
  );

  return (
    <InfoTabCities
      allCountries={visitedCountries}
      cities={allCities}
      className={className}
      getTravelIdx={getTravelIdx}
      id="visited"
      isGroupedByYear={true}
      isVisible={isVisible}
    />
  );
}
