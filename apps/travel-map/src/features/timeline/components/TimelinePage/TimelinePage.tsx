import "./TimelinePage.scss";

import { Trip } from "@travelmap/core";
import { CountryFlag } from "@travelmap/ui/components/CountryFlag/CountryFlag";
import { CoverImage } from "@travelmap/ui/components/CoverImage/CoverImage";
import { EmptyState } from "@travelmap/ui/components/EmptyState/EmptyState";
import { PanelFrame } from "@travelmap/ui/components/PanelFrame/PanelFrame";
import { PanelHeader } from "@travelmap/ui/components/PanelHeader/PanelHeader";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { formatDateRangeShort } from "@travelmap/ui/i18n/date";
import { classNames } from "@travelmap/ui/lib/classNames";
import { ReactNode, useRef } from "react";
import { useNavigate } from "react-router";

import { visitedTrips } from "@/data/world";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { useScrollState } from "@/shared/hooks/useScrollState";

import { buildTimeline, isLeftOfLine } from "../../lib/timeline";
import { useTimelineScroll } from "./TimelinePage.scroll";

const years = buildTimeline(visitedTrips);
/* The trips in the order the line passes them, whatever year they fall in. */
const stops = years.flatMap(({ trips }) => trips);
const DOT_COLOURS = 3;

/**
 * Properties accepted by the TripStop component.
 * @property {Trip} trip - The trip
 * @property {number} index - Its place along the route
 * @property {boolean} isLeft - Whether the card sits left of the line
 * @property {(trip: Trip) => void} onOpen - Opens the trip
 */
interface TripStopProps {
  trip: Trip;
  index: number;
  isLeft: boolean;
  onOpen: (trip: Trip) => void;
}

/**
 * TripStop component
 * One trip on the route: its dot on the line and a card with its photo, name,
 * dates and flags. The page moves both as the reader scrolls, so this only
 * draws them.
 * @component
 * @param {TripStopProps} props - The stop props
 * @param {Trip} props.trip - The trip
 * @param {number} props.index - Its place along the route
 * @param {boolean} props.isLeft - Whether the card sits left of the line
 * @param {(trip: Trip) => void} props.onOpen - Opens the trip
 * @returns {ReactNode} The stop
 */
function TripStop({ trip, index, isLeft, onOpen }: TripStopProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);

  return (
    <li className="timeline-page__item">
      <span
        aria-hidden="true"
        className={classNames(
          "timeline-page__dot",
          `timeline-page__dot--${index % DOT_COLOURS}`,
        )}
      />
      <button
        className={classNames(
          "timeline-page__stop",
          isLeft ? "timeline-page__stop--left" : "timeline-page__stop--right",
        )}
        onClick={() => onOpen(trip)}
        type="button"
      >
        <CoverImage
          className="timeline-page__cover"
          src={trip.backgroundImgSource}
        />
        <span className="timeline-page__caption">
          <span className="timeline-page__title">
            {trip.getLocalizedTitle(currLanguage)}
          </span>
          <span className="timeline-page__meta">
            {formatDateRangeShort({
              eDateInput: trip.eDate,
              locale: currLanguage,
              sDateInput: trip.sDate,
              showYear: false,
            })}
            {" · "}
            {t("timeline.days", { count: trip.getDurationInDays() })}
            {trip.getCountriesVisited().map((country) => (
              <CountryFlag
                className="timeline-page__flag"
                countryId={country.id}
                key={country.id}
              />
            ))}
          </span>
        </span>
      </button>
    </li>
  );
}

/**
 * TimelinePage component
 * Every trip as a photo along one winding line, newest first, with a marker at
 * each year. A short weekend gets the same card as a long journey, which a
 * chart drawn to scale could not give it. The page plays as the reader scrolls,
 * in both directions: cards swing out from the line as they rise into view,
 * sink away again on the way back, and fade as they pass the top, while only
 * the stretch of line on screen is drawn.
 * @component
 * @returns {ReactNode} The timeline page
 */
export function TimelinePage(): ReactNode {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { setSelectedTrip } = useMapInteraction();
  const { isCompact } = useResponsive();
  const bodyRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const { isScrolled, activeIndex } = useScrollState(
    bodyRef,
    ".timeline-page__year",
  );
  const currentYear = years[activeIndex];

  useTimelineScroll({ bodyRef, isCompact, pathRef, routeRef });

  /**
   * Shows a trip's route on the map and opens its itinerary.
   * @param {Trip} trip - The trip
   * @returns {void}
   */
  const openTrip = (trip: Trip): void => {
    setSelectedTrip(trip);
    navigate(`/trip/${encodeURIComponent(trip.id)}`);
  };

  return (
    <PanelFrame
      bodyRef={bodyRef}
      header={
        <PanelHeader
          subtitle={
            isScrolled && currentYear
              ? `${currentYear.year} · ${t("timeline.yearSummary", {
                  count: currentYear.trips.length,
                  days: currentYear.days,
                })}`
              : t("timeline.summary", {
                  trips: visitedTrips.length,
                  years: years.length,
                })
          }
          surface="page"
          title={t("timeline.title")}
        />
      }
    >
      <div className="timeline-page">
        {stops.length === 0 ? (
          <EmptyState message={t("timeline.empty")} />
        ) : (
          <div className="timeline-page__route" ref={routeRef}>
            <svg aria-hidden="true" className="timeline-page__line">
              <path
                className="timeline-page__path"
                pathLength={1}
                ref={pathRef}
              />
            </svg>
            {years.map(({ year, trips }) => (
              <section className="timeline-page__year" key={year}>
                <h2 className="timeline-page__year-label">{year}</h2>
                <ol className="timeline-page__stops">
                  {trips.map((trip) => {
                    const index = stops.indexOf(trip);
                    return (
                      <TripStop
                        index={index}
                        isLeft={isLeftOfLine(index, isCompact)}
                        key={trip.id}
                        onOpen={openTrip}
                        trip={trip}
                      />
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
        )}
      </div>
    </PanelFrame>
  );
}
