import { useRef } from "react";
import { City, Country } from "../../../core";
import useLanguage from "../../../hooks/language/language";
import { ModeHandler } from "../../../hooks/mode/mode";
import { CityCard, CountryCard } from "../../molecules";
import "./InfoTabVisited.scss";
import { componentHasOverflow } from "../../../utils/overflow";

interface InfoTabVisitedProps {
  className?: string;
  modeHandler: ModeHandler;
  visitedCountries: Record<string, Country>;
  visitedCities: City[];
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
 * @param {ModeHandler} props.modeHandler - The mode handler
 * @param {Record<string, Country>} props.visitedCountries - The visited countries
 * @param {City[]} props.visitedCities - The visited cities
 * @returns {JSX.Element} - The info tab visited
 */
export default function InfoTabVisited({
  className = "",
  visitedCities,
  visitedCountries,
}: InfoTabVisitedProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  const contentRef = useRef<HTMLDivElement>(null);
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
            {visitedCities
              .filter(
                (city) =>
                  city.country.id.replace(" ", "") === country.replace(" ", "")
              )
              .map((city) => {
                const c = new City(city);
                return <CityCard key={c.name} city={c} />;
              })}
          </CountryCard>
        ))}
      </div>
    </div>
  );
}
