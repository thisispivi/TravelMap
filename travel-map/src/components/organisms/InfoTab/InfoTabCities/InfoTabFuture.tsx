import { JSX } from "react";
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
  const allCities = getCitiesByCountriesAndIsFuture({
    cities: futureCities,
    countries: futureCountries,
    isFuture: false,
  }).sort(sortByTravelStartDate);

  const getTravelIdx = (city: City, travel: Travel) => {
    const allTravels = futureCities.filter((c) => c.name === city.name)[0]
      .travels;
    return allTravels.indexOf(travel);
  };

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
