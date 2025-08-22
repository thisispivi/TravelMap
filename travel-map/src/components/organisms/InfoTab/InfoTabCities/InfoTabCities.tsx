import "./InfoTabCities.scss";
import useLanguage from "@/hooks/language/language";
import { City, Country, Travel } from "@/core";
import { CityCard, FilterByCountry } from "../../../molecules";
import { FilterIcon } from "@/assets";
import { HomeContext } from "../../../pages/Home/Home";
import { PositionButton } from "../../../atoms";
import { useContext, useState, JSX, useMemo } from "react";
import { groupCitiesByYear } from "@/utils/cities";
import { keys } from "remeda";
import { constants } from "@/utils/parameters";

interface InfoTabCitiesProps {
  allCountries: Country[];
  cities: City[];
  className?: string;
  getTravelIdx?: (city: City, travel: Travel) => number;
  id: string;
  isVisible?: boolean;
  isGroupedByYear?: boolean;
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
export default function InfoTabCities({
  allCountries,
  cities,
  className = "",
  getTravelIdx,
  id,
  isVisible = false,
  isGroupedByYear = false,
}: InfoTabCitiesProps): JSX.Element | null {
  const { t } = useLanguage(["home"]);
  const {
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

  const [openedYears, setOpenedYears] = useState<number[]>([
    constants.GROUP_BY_CITIES_DEFAULT_OPENED_YEAR,
  ]);
  const toggleYear = (year: number) => {
    setOpenedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  };

  const groups = useMemo(
    () =>
      groupCitiesByYear(cities, {
        cutoffYear: constants.GROUP_BY_CITIES_CUTOFF_YEAR,
      }),
    [cities],
  );

  if (!isVisible) return null;

  const renderCityCards = (cities: City[]): JSX.Element => (
    <>
      {cities.map((city, i) => (
        <CityCard
          city={new City(city)}
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
      {cities.filter((city) => countries.includes(city.country)).length % 2 !==
      0 ? (
        <div
          className={`info-tab-cities__void-city info-tab-${id}__void-city city-card city-card--no-box-shadow`}
        />
      ) : null}
    </>
  );

  const renderedCities = isGroupedByYear ? (
    <div className="info-tab-cities__content--grouped" id="info-tab">
      {keys(groups).map((yearGroup, i) => (
        <div className="info-tab-cities__year-group" key={yearGroup}>
          <div
            className="info-tab-cities__year"
            onClick={() => toggleYear(parseInt(yearGroup))}
          >
            <h2 className="info-tab-cities__year__title">{`${i === 0 ? "< " : ""}${yearGroup}`}</h2>
          </div>
          {openedYears.includes(parseInt(yearGroup)) ? (
            <div className={`info-tab-cities__content info-tab-${id}__content`}>
              {renderCityCards(groups[yearGroup])}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  ) : (
    <div
      className={`info-tab-cities__content info-tab-${id}__content`}
      id="info-tab"
    >
      {renderCityCards(cities)}
    </div>
  );

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
            <FilterByCountry
              buttonIcon={<FilterIcon className="filter__icon" />}
              onChange={onCountryChange}
              options={allCountriesValues}
              selected={countries.sort((a, b) => a.id.localeCompare(b.id))}
            />
          ) : null}
        </div>
      </div>
      {renderedCities}
    </div>
  );
}
