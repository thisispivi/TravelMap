import { memo, useCallback, useRef } from "react";
import { ModeHandler } from "../../../hooks/mode/mode";
import "./InfoTabFuture.scss";
import useLanguage from "../../../hooks/language/language";
import { componentHasOverflow } from "../../../utils/overflow";
import { City, Country } from "../../../core";
import { CityCard, CountryCard } from "../../molecules";

interface InfoTabFutureProps {
  className?: string;
  modeHandler: ModeHandler;
  futureCountries: Record<string, Country>;
  futureCities: City[];
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
 * @returns {JSX.Element} - The info tab future
 */
export default memo(function InfoTabFuture({
  className = "",
  futureCities,
  futureCountries,
}: InfoTabFutureProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredCities = useCallback(
    (country: string) =>
      futureCities.filter(
        (c) => c.country.id.replace(" ", "") === country.replace(" ", ""),
      ),
    [futureCities],
  );

  return (
    <div className={`info-tab-future ${className}`}>
      <div className="info-tab-future__header">
        <h1>{t("future.title")}</h1>
      </div>
      <div
        className={`info-tab-future__content ${
          componentHasOverflow(contentRef) ? "scroll" : ""
        }`}
        id="info-tab"
        ref={contentRef}
      >
        {Object.keys(futureCountries).map((country) => (
          <CountryCard key={country} countryName={country}>
            {filteredCities(country).map((city) => (
              <CityCard key={city.name} city={new City(city)} isFuture />
            ))}
          </CountryCard>
        ))}
      </div>
    </div>
  );
});
