import { JSX } from "react";
import "./InfoTabFuture.scss";
import { futureCities, futureCountries } from "@/data";
import InfoTabCities from "./InfoTabCities";
import {
  getCitiesByCountriesAndIsFuture,
  sortByTravelStartDate,
} from "@/utils/cities";

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
    isFuture: true,
  }).sort(sortByTravelStartDate);

  return (
    <InfoTabCities
      allCountries={futureCountries}
      cities={allCities}
      className={className}
      id="future"
      isVisible={isVisible}
    />
  );
}
