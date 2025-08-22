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
 * @param {boolean} props.isGroupedByYear - Whether the cities are grouped by year or not
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

  const [selectedYear, setSelectedYear] = useState<number>(
    constants.GROUP_BY_CITIES_DEFAULT_OPENED_YEAR,
  );
  const toggleYear = (year: number) =>
    selectedYear !== year ? setSelectedYear(year) : undefined;

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
    <GroupedCityCards
      groups={groups}
      id={id}
      renderCityCards={renderCityCards}
      selectedYear={selectedYear}
      toggleYear={toggleYear}
    />
  ) : (
    <SingleCityCards
      cities={cities}
      id={id}
      renderCityCards={renderCityCards}
    />
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

type GroupedCityCardsProps = {
  id: string;
  groups: Record<string, City[]>;
  selectedYear: number;
  toggleYear: (year: number) => void;
  renderCityCards: (cities: City[]) => JSX.Element;
};
/**
 * GroupedCityCards component
 *
 * Renders a set of city cards grouped by year.
 *
 * @param {GroupedCityCardsProps} input - The props for the component.
 * @param {string} input.id - The id of the info tab cities
 * @param {Record<string, City[]>} input.groups - The groups of cities by year
 * @param {number} input.selectedYear - The currently selected year
 * @param {function} input.toggleYear - The function to toggle the selected year
 * @param {function} input.renderCityCards - The function to render city cards
 *
 * @returns {JSX.Element} - The grouped city cards
 */
function GroupedCityCards({
  groups,
  selectedYear,
  toggleYear,
  renderCityCards,
  id,
}: GroupedCityCardsProps): JSX.Element {
  return (
    <>
      <div className="info-tab-cities__header info-tab-cities__year__selector">
        {keys(groups).map((year, i) => (
          <button
            className={`info-tab-cities__year__button ${
              selectedYear === parseInt(year)
                ? "info-tab-cities__year__button--active"
                : ""
            }`}
            key={year}
            onClick={() => toggleYear(parseInt(year))}
            type="button"
          >
            {`${i === 0 ? "≤ " : ""}${year}`}
          </button>
        ))}
      </div>
      <div className="info-tab-cities__content--grouped" id="info-tab">
        {keys(groups).map((yearGroup) => (
          <div className="info-tab-cities__year-group" key={yearGroup}>
            {selectedYear === parseInt(yearGroup) ? (
              <div
                className={`info-tab-cities__content info-tab-${id}__content`}
              >
                {renderCityCards(groups[yearGroup])}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}

type SingleCityCardsProps = {
  id: string;
  renderCityCards: (cities: City[]) => JSX.Element;
  cities: City[];
};

/**
 * SingleCityCards component
 *
 * Renders a set of city cards for a single year.
 *
 * @param {SingleCityCardsProps} input - The props for the component.
 * @param {string} input.id - The id of the info tab cities
 * @param {function} input.renderCityCards - The function to render city cards
 * @param {City[]} input.cities - The list of cities to render
 *
 * @returns {JSX.Element} - The single city cards
 */
function SingleCityCards({
  id,
  renderCityCards,
  cities,
}: SingleCityCardsProps): JSX.Element {
  return (
    <div
      className={`info-tab-cities__content info-tab-${id}__content`}
      id="info-tab"
    >
      {renderCityCards(cities)}
    </div>
  );
}
