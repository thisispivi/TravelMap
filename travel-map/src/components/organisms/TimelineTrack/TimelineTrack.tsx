import "./TimelineTrack.scss";

import { domAnimation, LazyMotion, m, useInView } from "framer-motion";
import { JSX, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { CalendarIcon } from "@/assets";
import { visitedTrips } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { formatDateRangeShort } from "@/i18n/functions/date";

import { CountryFlag } from "../../atoms";

type TripItem = {
  trip: (typeof visitedTrips)[0];
  side: "left" | "right";
};

type YearGroup = {
  year: number;
  trips: TripItem[];
};

type TimelineCardItemProps = TripItem;

/**
 * TimelineTrack component
 *
 * Renders a vertical timeline of all visited trips, grouped by year and sorted
 * chronologically descending. Individual trip cards alternate left / right for a
 * zigzag layout, each animating in from the side as they enter the viewport.
 *
 * @component
 *
 * @returns {JSX.Element} The timeline track
 */
export function TimelineTrack(): JSX.Element {
  const yearGroups = useMemo<YearGroup[]>(() => {
    const sorted = visitedTrips.toSorted(
      (a, b) => b.sDate.getTime() - a.sDate.getTime(),
    );
    const yearMap = new Map<number, TripItem[]>();
    for (const trip of sorted) {
      const year = trip.sDate.getFullYear();
      if (!yearMap.has(year)) yearMap.set(year, []);
      yearMap.get(year)!.push({ trip, side: "left" });
    }
    let index = 0;
    const groups: YearGroup[] = [];
    for (const [year, trips] of yearMap) {
      const sortedTrips = trips.toSorted(
        (a, b) => b.trip.sDate.getTime() - a.trip.sDate.getTime(),
      );
      groups.push({
        year,
        trips: sortedTrips.map((item) => ({
          ...item,
          side: (index++ % 2 === 0 ? "left" : "right") as "left" | "right",
        })),
      });
    }
    return groups;
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <div className="timeline-track">
        <div className="timeline-track__line" />
        {yearGroups.map(({ year, trips }) => (
          <TimelineYearGroup key={year} trips={trips} year={year} />
        ))}
      </div>
    </LazyMotion>
  );
}

/**
 * TimelineYearGroup component
 *
 * Renders the year divider and all trip cards for a single year group. The
 * divider fades in when the group scrolls into view.
 *
 * @component
 *
 * @param {YearGroup} props
 * @param {number} props.year - The calendar year for this group
 * @param {TripItem[]} props.trips - Trips belonging to this year
 * @returns {JSX.Element} The year section
 */
function TimelineYearGroup({ year, trips }: YearGroup): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.2 });

  return (
    <div className="timeline-year-group" ref={ref}>
      <m.div
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        className="timeline-track__year-divider"
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <span>{year}</span>
      </m.div>
      {trips.map(({ trip, side }) => (
        <TimelineCardItem key={trip.id} side={side} trip={trip} />
      ))}
    </div>
  );
}

/**
 * TimelineCardItem component
 *
 * A single trip card on the timeline. Slides in from the left or right when it
 * enters the viewport and navigates to the trip detail on click.
 *
 * @component
 *
 * @param {TimelineCardItemProps} props - The timeline card props
 * @param {TripItem["trip"]} props.trip - The trip data to display
 * @param {"left" | "right"} props.side - Which side of the timeline axis the card appears on
 * @returns {JSX.Element} The trip card
 */
function TimelineCardItem({ trip, side }: TimelineCardItemProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    amount: 0.25,
    once: true,
  });
  const navigate = useNavigate();
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const countries = trip.getCountriesVisited();

  const hiddenState = {
    opacity: 0,
    x: side === "left" ? -64 : 64,
    y: 18,
    scale: 0.96,
    filter: "blur(0.375rem)",
  };
  const visibleState = {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: "blur(0rem)",
  };

  return (
    <m.div
      animate={isInView ? visibleState : hiddenState}
      className={`timeline-card timeline-card--${side}`}
      initial={hiddenState}
      onClick={() => navigate(`/trip/${trip.id}`)}
      ref={ref}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 24,
        mass: 0.8,
      }}
    >
      {trip.backgroundImgSource ? (
        <div className="timeline-card__image-container">
          <img
            alt={t(`trips.${trip.id}`)}
            className="timeline-card__image"
            src={trip.backgroundImgSource}
          />
          <div className="timeline-card__image-overlay" />
        </div>
      ) : null}
      <div className="timeline-card__flags">
        {countries.map((c) => (
          <CountryFlag
            className="timeline-card__flag"
            countryId={c.id}
            key={c.id}
          />
        ))}
      </div>
      <div className="timeline-card__body">
        <h3 className="timeline-card__title">{t(`trips.${trip.id}`)}</h3>
        <div className="timeline-card__meta">
          <div className="timeline-card__date">
            <CalendarIcon className="timeline-card__date-icon" />
            <p>
              {formatDateRangeShort({
                sDateInput: trip.sDate,
                eDateInput: trip.eDate,
                locale: lang,
                includeWeekday: false,
                showYear: true,
              })}
            </p>
          </div>
          <p className="timeline-card__cities-count">
            {t("timeline.city", { count: trip.destinations.length })}
          </p>
        </div>
      </div>
    </m.div>
  );
}
