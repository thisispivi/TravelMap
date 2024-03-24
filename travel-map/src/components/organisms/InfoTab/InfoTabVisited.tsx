import { memo, useRef } from "react";
import { City } from "../../../core";
import useLanguage from "../../../hooks/language/language";
import { CityCard, CountryCard } from "../../molecules";
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

  const filteredCities = (country: string) =>
    visitedCities
      .filter((c) => c.country.id.replace(" ", "") === country.replace(" ", ""))
      .filter((city) => city.travels.some((travel) => !travel.isFuture));

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
        {Object.keys(visitedCountries).map((country) => (
          <CountryCard key={country} countryName={country}>
            {filteredCities(country).map((city) => (
              <CityCard key={city.name} city={new City(city)} />
            ))}
          </CountryCard>
        ))}
      </div>
    </div>
  );
});
