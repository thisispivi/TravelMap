import { memo, useRef } from "react";
import "./InfoTabFuture.scss";
import useLanguage from "../../../hooks/language/language";
import { componentHasOverflow } from "../../../utils/overflow";
import { City } from "../../../core";
import { CityCard, CountryCard } from "../../molecules";
import { futureCities, futureCountries } from "../../../data";

interface InfoTabFutureProps {
  className?: string;
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
}: InfoTabFutureProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredCities = (country: string) =>
    futureCities
      .filter((c) => c.country.id.replace(" ", "") === country.replace(" ", ""))
      .sort((a, b) => {
        const aDate = a.travels.find((travel) => travel.isFuture)?.sDate;
        const bDate = b.travels.find((travel) => travel.isFuture)?.sDate;
        if (aDate && bDate) return aDate.getTime() - bDate.getTime();
        return 0;
      });

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
