import "./InfoTabTrips.scss";
import useLanguage from "@/hooks/language/language";
import { Country, Travel, Trip } from "@/core";
import { PositionButton } from "../../../atoms";
import {
  useContext,
  useState,
  JSX,
  useMemo,
  useEffect,
  useRef,
  RefObject,
  useCallback,
} from "react";
import { groupTripsByYear } from "@/utils/trips";
import { keys } from "remeda";
import { constants } from "@/utils/parameters";
import { HomeContext } from "@/components/pages/Home/Home";
import TripCard from "@/components/molecules/Cards/TripCard";

interface InfoTabTripsProps {
  allCountries: Country[];
  trips: Trip[];
  className?: string;
  getTravelIdx?: (city: Trip, travel: Travel) => number;
  id: string;
  isVisible?: boolean;
}

export default function InfoTabTrips({
  allCountries,
  trips,
  className = "",
  id,
  isVisible = false,
}: InfoTabTripsProps): JSX.Element | null {
  const { t } = useLanguage(["home"]);
  const { isAutoPosition, setIsAutoPosition, responsive } =
    useContext(HomeContext)!;

  const [countries, setCountries] = useState<Country[]>(() => allCountries);

  useEffect(() => {
    setCountries(allCountries);
  }, [allCountries]);

  const [selectedYear, setSelectedYear] = useState<number>(
    constants.GROUP_BY_CITIES_DEFAULT_OPENED_YEAR,
  );
  const toggleYear = useCallback((year: number) => {
    setSelectedYear((prev) => (prev !== year ? year : prev));
  }, []);

  const [hasOverflow, setHasOverflow] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const checkOverflow = useCallback(() => {
    if (contentRef.current) {
      const element = contentRef.current;
      setHasOverflow(element.scrollHeight > element.clientHeight);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const handleResize = () => checkOverflow();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkOverflow, isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    checkOverflow();
  }, [checkOverflow, trips, countries, selectedYear, isVisible]);

  const groups = useMemo(
    () =>
      groupTripsByYear(trips, {
        cutoffYear: constants.GROUP_BY_CITIES_CUTOFF_YEAR,
      }),
    [trips],
  );

  const renderTripCards = useCallback((tripsToRender: Trip[]): JSX.Element => {
    return (
      <>
        {tripsToRender.map((trip) => {
          return <TripCard key={trip.id} trip={trip} />;
        })}
      </>
    );
  }, []);

  if (!isVisible) return null;

  const renderedTrips = (
    <GroupedTripCards
      contentRef={contentRef}
      groups={groups}
      hasOverflow={hasOverflow}
      id={id}
      renderTripCards={renderTripCards}
      selectedYear={selectedYear}
      toggleYear={toggleYear}
    />
  );

  return (
    <div
      className={`info-tab-trips info-tab-${id} ${className} ${isVisible ? "info-tab-trips--visible" : ""}`}
    >
      <div className={`info-tab-trips__header info-tab-${id}__header`}>
        <h1>{t(id + ".title")}</h1>
        <div className="info-tab-trips__header__buttons">
          <PositionButton
            isAutoPosition={isAutoPosition}
            responsive={responsive}
            setIsAutoPosition={setIsAutoPosition}
          />
        </div>
      </div>
      {renderedTrips}
    </div>
  );
}

type GroupedTripCardsProps = {
  id: string;
  groups: Record<string, Trip[]>;
  selectedYear: number;
  toggleYear: (year: number) => void;
  renderTripCards: (trips: Trip[]) => JSX.Element;
  hasOverflow: boolean;
  contentRef: RefObject<HTMLDivElement | null>;
};
/**
 * GroupedTripCards component
 *
 * Renders a set of city cards grouped by year.
 *
 * @param {GroupedTripCardsProps} input - The props for the component.
 * @param {string} input.id - The id of the info tab trips
 * @param {Record<string, Trip[]>} input.groups - The groups of trips by year
 * @param {number} input.selectedYear - The currently selected year
 * @param {function} input.toggleYear - The function to toggle the selected year
 * @param {function} input.renderTripCards - The function to render city cards
 *
 * @returns {JSX.Element} - The grouped city cards
 */
function GroupedTripCards({
  groups,
  selectedYear,
  toggleYear,
  renderTripCards,
  id,
  hasOverflow,
  contentRef,
}: GroupedTripCardsProps): JSX.Element {
  return (
    <>
      <div className="info-tab-trips__header info-tab-trips__year__selector">
        {keys(groups).map((year, i) => (
          <button
            className={`info-tab-trips__year__button ${selectedYear === parseInt(year) ? "info-tab-trips__year__button--active" : ""}`}
            key={year}
            onClick={() => toggleYear(parseInt(year))}
            type="button"
          >
            {`${i === 0 ? "≤ " : ""}${year}`}
          </button>
        ))}
      </div>
      <div
        className={`info-tab-trips__content--grouped ${hasOverflow ? "info-tab-trips__content--overflow" : ""}`}
        id="info-tab"
        ref={contentRef}
      >
        {keys(groups)
          .filter((year) => selectedYear === parseInt(year))
          .map((yearGroup) => (
            <div className="info-tab-trips__year-group" key={yearGroup}>
              {selectedYear === parseInt(yearGroup) ? (
                <div
                  className={`info-tab-trips__content info-tab-${id}__content`}
                >
                  {renderTripCards(groups[yearGroup])}
                </div>
              ) : null}
            </div>
          ))}
      </div>
    </>
  );
}
