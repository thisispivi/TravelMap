import { memo, useContext, useMemo, useState } from "react";
import { City, Country, Travel } from "../../../../core";
import useLanguage from "../../../../hooks/language/language";
import { CityCard, FilterCountry } from "../../../molecules";
import "./InfoTabCities.scss";
import { HomeContext } from "../../../pages/Home/Home";
import Button from "../../../atoms/Buttons/Button";
import { FilterIcon, PositionIcon } from "../../../../assets";
import { mobileAndTabletCheck } from "../../../../utils/responsive";
import Tooltip from "../../Tooltip/Tooltip";
import { visitedCountries } from "../../../../data";

interface InfoTabCitiesProps {
  className?: string;
  id: string;
  cities: City[];
  getTravelIdx: (city: City, travel: Travel) => number;
  isVisible?: boolean;
}

/**
 * InfoTabCities component
 *
 * The info tab cities component is used to display the cities
 * that are part of the visited or future travels.
 *
 * @component
 *
 * @param {InfoTabCitiesProps} props - The props of the component
 * @param {string} props.className - The class to apply to the info tab cities
 * @param {string} props.id - The id of the info tab
 * @param {City[]} props.cities - The cities to display
 * @param {(city: City, travel: Travel) => number} props.getTravelIdx - The function to get the travel index
 * @param {boolean} props.isVisible - The visibility of the info tab cities
 * @returns {JSX.Element} - The info tab cities
 */
export default memo(function InfoTabCities({
  className = "",
  id,
  cities,
  getTravelIdx,
  isVisible = false,
}: InfoTabCitiesProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  const {
    hoveredCity,
    setHoveredCity,
    setMapPosition,
    isAutoPosition,
    setIsAutoPosition,
    responsive,
  } = useContext(HomeContext)!;

  const allCountries = Object.values(visitedCountries);
  const [countries, setCountries] = useState<Country[]>(allCountries);
  const onCountryChange = (selected: Country[]) => setCountries(selected);

  const positionButton = useMemo(() => {
    if (mobileAndTabletCheck() || responsive.window.width <= 460) return null;
    return (
      <Button
        className={`info-tab-cities__position-button ${
          isAutoPosition
            ? "info-tab-cities__position-button--auto-position"
            : ""
        }`}
        onClick={() => setIsAutoPosition(!isAutoPosition)}
      >
        <PositionIcon />
      </Button>
    );
  }, [isAutoPosition, setIsAutoPosition, responsive.window]);

  return (
    <div
      className={`info-tab-cities info-tab-${id} ${className} 
    ${isVisible ? "info-tab-cities--visible" : ""}
    `}
    >
      <div className={`info-tab-cities__header info-tab-${id}__header`}>
        <h1>{t(id + ".title")}</h1>
        <div className={`info-tab-cities__header__buttons`}>
          {positionButton}
          <Tooltip
            text={t("autoPositionTooltip")}
            anchorSelect=".info-tab-cities__position-button"
            delayShow={300}
          />
          {id === "visited" && (
            <FilterCountry
              options={allCountries}
              selected={countries}
              onChange={onCountryChange}
              buttonIcon={<FilterIcon className="filter__icon" />}
            />
          )}
          <Tooltip
            text={t("filterTooltip")}
            anchorSelect=".filter__button"
            delayShow={300}
          />
        </div>
      </div>
      <div
        className={`info-tab-cities__content info-tab-${id}__content`}
        id="info-tab"
      >
        {cities.map((city, i) => (
          <CityCard
            key={i}
            city={new City(city)}
            travel={city.travels[0]}
            idx={getTravelIdx(city, city.travels[0])}
            isClickable={city.travels[0].photos.length > 0}
            hoveredCity={hoveredCity}
            setHoveredCity={setHoveredCity}
            setMapPosition={setMapPosition}
            isAutoPosition={isAutoPosition}
            isHidden={!countries.includes(city.country)}
          />
        ))}
        {cities.filter((city) => countries.includes(city.country)).length %
          2 !==
          0 && (
          <div
            className={`info-tab-cities__void-city info-tab-${id}__void-city city-card`}
          />
        )}
      </div>
    </div>
  );
});
