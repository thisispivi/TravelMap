import { JSX, useCallback, useMemo } from "react";
import "./InfoTabFuture.scss";
import { futureCities, futureCountries } from "@/data";
import InfoTabCities from "./InfoTabCities";
import {
  getCitiesByCountriesAndIsFuture,
  sortByTravelStartDate,
} from "@/utils/cities";
import { City, Travel } from "@/core";

interface InfoTabFutureProps {
  className?: string;
  isVisible?: boolean;
}

/**
 * InfoTabFuture component
 *
 * The info tab future component is used to display the future travels.
 *
 * @component
 *
 * @param {InfoTabFutureProps} props - The props of the component
 * @param {string} props.className - The class to apply to the info tab future
 * @param {boolean} props.isVisible - The visibility of the info tab future
 *
 * @returns {JSX.Element} - The info tab future
 */
export default function InfoTabFuture({
  className = "",
  isVisible = false,
}: InfoTabFutureProps): JSX.Element {
  const allCities = useMemo(() => {
    const result = getCitiesByCountriesAndIsFuture({
      cities: futureCities,
      countries: futureCountries,
      isFuture: false,
    });

    return [...result].sort(sortByTravelStartDate);
  }, []);

  const travelsByCityName = useMemo(() => {
    return new globalThis.Map<string, Travel[]>(
      futureCities.map((city) => [city.name, city.travels])
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
      allCountries={futureCountries}
      cities={allCities}
      className={className}
      getTravelIdx={getTravelIdx}
      id="future"
      isVisible={isVisible}
    />
  );
}
