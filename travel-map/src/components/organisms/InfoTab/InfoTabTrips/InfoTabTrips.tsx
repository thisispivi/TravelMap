import "./InfoTabTrips.scss";

import {
  JSX,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { keys } from "remeda";

import { TripCard } from "@/components/molecules";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { Travel, Trip } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { constants } from "@/utils/parameters";
import { groupTripsByYear } from "@/utils/trips";

import { PositionButton } from "../../../atoms/Buttons/PositionButton";

interface InfoTabTripsProps {
  trips: Trip[];
  className?: string;
  getTravelIdx?: (city: Trip, travel: Travel) => number;
  id: string;
  isVisible?: boolean;
}

export function InfoTabTrips({
  trips,
  className = "",
  id,
  isVisible = false,
}: InfoTabTripsProps): JSX.Element | null {
  const { t } = useLanguage(["home"]);
  const { isAutoPosition, setIsAutoPosition, responsive } =
    useContext(HomeContext)!;

  const [selectedYear, setSelectedYear] = useState<number>(
    constants.GROUP_BY_CITIES_DEFAULT_OPENED_YEAR,
  );
  const toggleYear = useCallback((year: number) => {
    setSelectedYear((prev) => (prev !== year ? year : prev));
  }, []);

  const [hasOverflow, setHasOverflow] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const overflowCheckTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

  const checkOverflow = useCallback(() => {
    if (contentRef.current) {
      const element = contentRef.current;
      setHasOverflow(element.scrollHeight > element.clientHeight);
    }
  }, []);

  const handleTripExpandChange = useCallback(() => {
    checkOverflow();

    if (overflowCheckTimeoutRef.current !== null) {
      window.clearTimeout(overflowCheckTimeoutRef.current);
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
    }

    // Request multiple frames to catch overflow during animation
    frameCountRef.current = 0;
    const checkFrame = () => {
      checkOverflow();
      frameCountRef.current += 1;
      if (frameCountRef.current < 12) {
        // Check for ~200ms at 60fps (12 frames)
        rafRef.current = window.requestAnimationFrame(checkFrame);
      }
    };
    rafRef.current = window.requestAnimationFrame(checkFrame);

    // Final check after animation completes (360ms)
    overflowCheckTimeoutRef.current = window.setTimeout(() => {
      checkOverflow();
    }, 360);
  }, [checkOverflow]);

  useEffect(() => {
    if (!isVisible) return;
    const handleResize = () => checkOverflow();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkOverflow, isVisible]);

  useEffect(() => {
    return () => {
      if (overflowCheckTimeoutRef.current !== null) {
        window.clearTimeout(overflowCheckTimeoutRef.current);
      }
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    checkOverflow();
  }, [checkOverflow, trips, selectedYear, isVisible]);

  const groups = useMemo(
    () =>
      groupTripsByYear(trips, {
        cutoffYear: constants.GROUP_BY_CITIES_CUTOFF_YEAR,
      }),
    [trips],
  );

  if (!isVisible) return null;

  const renderedTrips = (
    <GroupedTripCards
      contentRef={contentRef}
      groups={groups}
      hasOverflow={hasOverflow}
      id={id}
      onTripExpandChange={handleTripExpandChange}
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

type TripCardsListProps = {
  trips: Trip[];
  onTripExpandChange?: (isExpanded: boolean) => void;
};

function TripCardsList({
  trips,
  onTripExpandChange,
}: TripCardsListProps): JSX.Element {
  const { isAutoPosition, setHoveredCity, setMapPosition } =
    useContext(HomeContext)!;

  return (
    <>
      {trips.map((trip) => (
        <TripCard
          isAutoPosition={isAutoPosition}
          key={trip.id}
          onExpandChange={onTripExpandChange}
          setHoveredCity={setHoveredCity}
          setMapPosition={setMapPosition}
          trip={trip}
        />
      ))}
    </>
  );
}

type GroupedTripCardsProps = {
  id: string;
  groups: Record<string, Trip[]>;
  selectedYear: number;
  toggleYear: (year: number) => void;
  hasOverflow: boolean;
  contentRef: RefObject<HTMLDivElement | null>;
  onTripExpandChange: (isExpanded: boolean) => void;
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
 *
 * @returns {JSX.Element} - The grouped city cards
 */
function GroupedTripCards({
  groups,
  selectedYear,
  toggleYear,
  id,
  hasOverflow,
  contentRef,
  onTripExpandChange,
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
                  <TripCardsList
                    onTripExpandChange={onTripExpandChange}
                    trips={groups[yearGroup]}
                  />
                </div>
              ) : null}
            </div>
          ))}
      </div>
    </>
  );
}
