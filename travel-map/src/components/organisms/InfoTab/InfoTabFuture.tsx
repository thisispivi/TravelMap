import { memo, useRef } from "react";
import "./InfoTabFuture.scss";
import useLanguage from "../../../hooks/language/language";
import { componentHasOverflow } from "../../../utils/overflow";
import { City, Travel } from "../../../core";
import { CityCard } from "../../molecules";
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
        {allCities.map((city) => (
          <CityCard
            key={city.name}
            city={city}
            travel={city.travels[0]}
            idx={getTravelIdx(city, city.travels[0])}
            isClickable={false}
          />
        ))}
      </div>
    </div>
  );
});
