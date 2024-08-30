import { memo } from "react";
import "./InfoTabFuture.scss";
import { City, Travel } from "../../../../core";
import { futureCities, futureCountries } from "../../../../data";
import InfoTabCities from "./InfoTabCities";

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
 * @param {ModeHandler} props.modeHandler - The mode handler
 * @param {boolean} props.isVisible - The visibility of the info tab future
 * @returns {JSX.Element} - The info tab future
 */
export default memo(function InfoTabFuture({
  className = "",
  isVisible = false,
}: InfoTabFutureProps): JSX.Element {
  const filteredCities = (country: string) => {
    const filtered = futureCities
      .filter((c) => c.country.id.replace(" ", "") === country.replace(" ", ""))
      .filter((city) => city.travels.some((travel) => travel.isFuture));
    const cities: City[] = [];
    filtered.forEach((city) => {
      city.travels.forEach((travel) => {
        if (travel.isFuture) {
          cities.push(new City({ ...city, travels: [travel] }));
        }
      });
    });
    return cities;
  };

  const allCities = Object.keys(futureCountries)
    .map((country) => filteredCities(country))
    .flat()
    .sort((a, b) => {
      const aDate = a.travels[0].sDate;
      const bDate = b.travels[0].sDate;
      return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
    });

  const getTravelIdx = (city: City, travel: Travel) => {
    const allTravels = futureCities.filter((c) => c.name === city.name)[0]
      .travels;
    return allTravels.indexOf(travel);
  };

  return (
    <InfoTabCities
      className={className}
      id="future"
      cities={allCities}
      getTravelIdx={getTravelIdx}
      isVisible={isVisible}
    />
  );
});
