import { memo, useRef } from "react";
import { City, Travel } from "../../../core";
import useLanguage from "../../../hooks/language/language";
import { CityCard } from "../../molecules";
import "./InfoTabVisited.scss";
import { componentHasOverflow } from "../../../utils/overflow";
import { visitedCities, visitedCountries } from "../../../data";

interface InfoTabVisitedProps {
  className?: string;
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
 * @returns {JSX.Element} - The info tab visited
 */
export default memo(function InfoTabVisited({
  className = "",
}: InfoTabVisitedProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  const contentRef = useRef<HTMLDivElement>(null);

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
    <div className={`info-tab-visited ${className}`}>
      <div className="info-tab-visited__header">
        <h1>{t("visited.title")}</h1>
      </div>
      <div
        className={`info-tab-visited__content ${
          componentHasOverflow(contentRef) ? "scroll" : ""
        }`}
        id="info-tab"
        ref={contentRef}
      >
        {allCities.map((city) => (
          <CityCard
            key={city.name}
            city={new City(city)}
            travel={city.travels[0]}
            idx={getTravelIdx(city, city.travels[0])}
            isClickable={city.travels[0].photos.length > 0}
          />
        ))}
      </div>
    </div>
  );
});
