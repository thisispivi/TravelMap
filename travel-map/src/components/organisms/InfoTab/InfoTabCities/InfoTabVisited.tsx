import { memo, JSX } from "react";
import { City, Travel } from "../../../../core";
import "./InfoTabVisited.scss";
import { visitedCities, visitedCountries } from "../../../../data";
import InfoTabCities from "./InfoTabCities";
import {
  getCitiesByCountriesAndIsFuture,
  sortByTravelStartDate,
} from "../../../../utils/cities";

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
export default memo(function InfoTabVisited({
  className = "",
  isVisible = false,
}: InfoTabVisitedProps): JSX.Element {
  const allCities = getCitiesByCountriesAndIsFuture({
    cities: visitedCities,
    countries: visitedCountries,
    isFuture: false,
  }).sort(sortByTravelStartDate);

  const getTravelIdx = (city: City, travel: Travel) => {
    const allTravels = visitedCities.filter((c) => c.name === city.name)[0]
      .travels;
    return allTravels.indexOf(travel);
  };

  return (
    <InfoTabCities
      allCountries={visitedCountries}
      cities={allCities}
      className={className}
      getTravelIdx={getTravelIdx}
      id="visited"
      isVisible={isVisible}
    />
  );
});
