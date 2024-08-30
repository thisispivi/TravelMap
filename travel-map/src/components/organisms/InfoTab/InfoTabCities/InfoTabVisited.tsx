import { memo } from "react";
import { City, Travel } from "../../../../core";
import "./InfoTabVisited.scss";
import { visitedCities, visitedCountries } from "../../../../data";
import InfoTabCities from "./InfoTabCities";

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
  const filteredCities = (country: string) => {
    const filtered = visitedCities
      .filter((c) => c.country.id.replace(" ", "") === country.replace(" ", ""))
      .filter((city) => city.travels.some((travel) => !travel.isFuture));
    const cities: City[] = [];
    filtered.forEach((city) => {
      city.travels.forEach((travel) => {
        if (!travel.isFuture) {
          cities.push(new City({ ...city, travels: [travel] }));
        }
      });
    });
    return cities;
  };

  const allCities = Object.keys(visitedCountries)
    .map((country) => filteredCities(country))
    .flat()
    .sort((a, b) => {
      const aDate = a.travels[0].sDate;
      const bDate = b.travels[0].sDate;
      return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
    });

  const getTravelIdx = (city: City, travel: Travel) => {
    const allTravels = visitedCities.filter((c) => c.name === city.name)[0]
      .travels;
    return allTravels.indexOf(travel);
  };

  return (
    <InfoTabCities
      className={className}
      id="visited"
      cities={allCities}
      getTravelIdx={getTravelIdx}
      isVisible={isVisible}
    />
  );
});
