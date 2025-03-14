import { memo, useContext, useState, JSX } from "react";
import { City, Country, Travel } from "@/core";
import useLanguage from "@/hooks/language/language";
import { CityCard, FilterCountry } from "../../../molecules";
import "./InfoTabCities.scss";
import { HomeContext } from "../../../pages/Home/Home";
import { FilterIcon } from "@/assets";
import { PositionButton } from "../../../atoms";

interface InfoTabCitiesProps {
  allCountries: Country[];
  cities: City[];
  className?: string;
  getTravelIdx?: (city: City, travel: Travel) => number;
  id: string;
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
 * @param {Country[]} props.allCountries - The list of all countries
 * @param {City[]} props.cities - The list of cities
 * @param {string} props.className - The class to apply to the info tab cities
 * @param {function} [props.getTravelIdx] - The function to get the travel index
 * @param {string} props.id - The id of the info tab cities
 * @param {boolean} props.isVisible - The visibility of the info tab cities
 *
 * @returns {JSX.Element} - The info tab cities
 */
export default memo(function InfoTabCities({
  allCountries,
  cities,
  className = "",
  getTravelIdx,
  id,
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
    mapPosition,
  } = useContext(HomeContext)!;

  const allCountriesValues = Object.values(allCountries);
  const [countries, setCountries] = useState<Country[]>(allCountriesValues);
  const onCountryChange = (selected: Country[]) => setCountries(selected);

  return (
    <div
      className={`info-tab-cities info-tab-${id} ${className} 
    ${isVisible ? "info-tab-cities--visible" : ""}
    `}
    >
      <div className={`info-tab-cities__header info-tab-${id}__header`}>
        <h1>{t(id + ".title")}</h1>
        <div className="info-tab-cities__header__buttons">
          <PositionButton
            isAutoPosition={isAutoPosition}
            responsive={responsive}
            setIsAutoPosition={setIsAutoPosition}
          />
          {id === "visited" ? (
            <FilterCountry
              buttonIcon={<FilterIcon className="filter__icon" />}
              onChange={onCountryChange}
              options={allCountriesValues}
              selected={countries}
            />
          ) : null}
        </div>
      </div>
      <div
        className={`info-tab-cities__content info-tab-${id}__content`}
        id="info-tab"
      >
        {cities.map((city, i) => (
          <CityCard
            city={new City(city)}
            hoveredCity={hoveredCity}
            isAutoPosition={isAutoPosition}
            isClickable={
              city.travels.length > 0 && city.travels[0].photos.length > 0
                ? true
                : false
            }
            isHidden={!countries.includes(city.country)}
            key={i}
            mapPosition={mapPosition}
            setHoveredCity={setHoveredCity}
            setMapPosition={setMapPosition}
            travel={city.travels[0]}
            travelIdx={getTravelIdx?.(city, city.travels[0])}
          />
        ))}
        {cities.filter((city) => countries.includes(city.country)).length %
          2 !==
        0 ? (
          <div
            className={`info-tab-cities__void-city info-tab-${id}__void-city city-card city-card--no-box-shadow`}
          />
        ) : null}
      </div>
    </div>
  );
});
