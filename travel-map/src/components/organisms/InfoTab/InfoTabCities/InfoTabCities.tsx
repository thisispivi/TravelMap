import "./InfoTabCities.scss";
import { useLanguage } from "@/hooks/language/language";
import { City, Country, Travel } from "@/core";
import { CityCard, FilterByCountry } from "../../../molecules";
import { FilterIcon } from "@/assets";
import { HomeContext } from "../../../pages/Home/Home";
import { PositionButton } from "../../../atoms/Buttons/PositionButton";
import {
  useContext,
  useState,
  JSX,
  useMemo,
  useEffect,
  useRef,
  RefObject,
} from "react";
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
export function InfoTabCities({
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

  const allCountriesValues = allCountries;
  const [countries, setCountries] = useState<Country[]>(allCountriesValues);
  const onCountryChange = (selected: Country[]) => setCountries(selected);

  const sortedSelectedCountries = useMemo(() => {
    return [...countries].sort((a, b) => a.id.localeCompare(b.id));
  }, [countries]);

  const [selectedYear, setSelectedYear] = useState<number>(
    constants.GROUP_BY_CITIES_DEFAULT_OPENED_YEAR,
  );
  const toggleYear = (year: number) =>
    selectedYear !== year ? setSelectedYear(year) : undefined;

  const [hasOverflow, setHasOverflow] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const checkOverflow = () => {
    if (contentRef.current) {
      const element = contentRef.current;
      setHasOverflow(element.scrollHeight > element.clientHeight);
    }
  };

  useEffect(() => {
    checkOverflow();
    const handleResize = () => checkOverflow();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [cities, countries, selectedYear, isVisible]);

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
      {cities.map((city) => {
        const travel = city.travels[0];
        const isHidden = !countries.includes(city.country);
        const isClickable = Boolean(travel?.photos?.length);

        return (
          <CityCard
            city={city}
            isAutoPosition={isAutoPosition}
            isClickable={isClickable}
            isHidden={isHidden}
            key={city.name}
            mapPosition={mapPosition}
            setHoveredCity={setHoveredCity}
            setMapPosition={setMapPosition}
            travel={travel}
            travelIdx={travel ? getTravelIdx?.(city, travel) : undefined}
          />
        );
      })}
      {cities.reduce(
        (acc, city) => acc + (countries.includes(city.country) ? 1 : 0),
        0,
      ) %
        2 !==
      0 ? (
        <div
          className={`info-tab-cities__void-city info-tab-${id}__void-city city-card city-card--no-box-shadow`}
        />
      ) : null}
    </>
  );

  const renderedCities = isGroupedByYear ? (
    <GroupedCityCards
      contentRef={contentRef}
      groups={groups}
      hasOverflow={hasOverflow}
      id={id}
      renderCityCards={renderCityCards}
      selectedYear={selectedYear}
      toggleYear={toggleYear}
    />
  ) : (
    <SingleCityCards
      cities={cities}
      contentRef={contentRef}
      hasOverflow={hasOverflow}
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
              selected={sortedSelectedCountries}
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
  hasOverflow: boolean;
  contentRef: RefObject<HTMLDivElement | null>;
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
  hasOverflow,
  contentRef,
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
      <div
        className={`info-tab-cities__content--grouped ${hasOverflow ? "info-tab-cities__content--overflow" : ""}`}
        id="info-tab"
        ref={contentRef}
      >
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
  hasOverflow: boolean;
  contentRef: RefObject<HTMLDivElement | null>;
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
  hasOverflow,
  contentRef,
}: SingleCityCardsProps): JSX.Element {
  return (
    <div
      className={`info-tab-cities__content info-tab-cities__content--single info-tab-${id}__content ${hasOverflow ? "info-tab-cities__content--overflow" : ""}`}
      id="info-tab"
      ref={contentRef}
    >
      {renderCityCards(cities)}
    </div>
  );
}
