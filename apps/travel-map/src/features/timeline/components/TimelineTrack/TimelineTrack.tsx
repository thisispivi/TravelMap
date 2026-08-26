import "./TimelineTrack.scss";

import { domAnimation, LazyMotion, m, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { useNavigate } from "react-router";

import CalendarIcon from "@/assets/icons/Calendar.svg?react";
import { visitedTrips } from "@/data/world";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { groupTripsByStartYear, YearGroup } from "../../lib/timelineYears";

/**
 * Properties accepted by the TimelineEntry component.
 * @property {YearGroup["trips"][number]} trip - The trip the row describes
 */
interface TimelineEntryProps {
  trip: YearGroup["trips"][number];
}

/**
 * TimelineEntry component
 * One trip on the chronological rail: a plate, the trip title, and the dates
 * and stay count that place it. Rendered as a button so the whole row is
 * reachable by keyboard, and revealed as it scrolls into view.
 * @component
 * @param {TimelineEntryProps} props - The timeline entry props
 * @param {YearGroup["trips"][number]} props.trip - The trip the row describes
 * @returns {ReactNode} The timeline row
 */
function TimelineEntry({ trip }: TimelineEntryProps): ReactNode {
  const navigate = useNavigate();
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const prefersReducedMotion = useReducedMotion();
  const tripTitle = trip.getLocalizedTitle(lang);
  const countries = trip.getCountriesVisited();
  const cityCount = new Set(
    trip.destinations.flatMap((destination) =>
      destination.isLayover ? [] : [destination.city.name],
    ),
  ).size;

  return (
    <m.li
      className="timeline-entry"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      viewport={{ amount: 0.35, once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <button
        className="timeline-entry__button"
        onClick={() => navigate(`/trip/${trip.id}`)}
        type="button"
      >
        <span aria-hidden className="timeline-entry__node" />

        {trip.backgroundImgSource ? (
          <span className="timeline-entry__plate">
            <img
              alt=""
              className="timeline-entry__image"
              src={trip.backgroundImgSource}
            />
          </span>
        ) : null}

        <span className="timeline-entry__body">
          <span className="timeline-entry__heading">
            <span className="timeline-entry__title">{tripTitle}</span>
            <span className="timeline-entry__flags">
              {countries.map((country) => (
                <CountryFlag
                  className="timeline-entry__flag"
                  countryId={country.id}
                  key={country.id}
                />
              ))}
            </span>
          </span>

          <span className="timeline-entry__meta">
            <span className="timeline-entry__date">
              <CalendarIcon className="timeline-entry__date-icon" />
              <span className="figure">
                {formatDateRangeShort({
                  sDateInput: trip.sDate,
                  eDateInput: trip.eDate,
                  locale: lang,
                  includeWeekday: false,
                  showYear: true,
                })}
              </span>
            </span>
            <span className="timeline-entry__cities">
              {t("timeline.city", { count: cityCount })}
            </span>
          </span>
        </span>
      </button>
    </m.li>
  );
}

/**
 * TimelineTrack component
 * The chronological index of every trip taken, newest first, hung off a single
 * rail with a sticky marker for each year. One left-anchored column rather than
 * an alternating layout, so the reading order matches the order of travel and
 * the desktop and mobile compositions are the same.
 * @component
 * @returns {ReactNode} The timeline track
 */
export function TimelineTrack(): ReactNode {
  const { t } = useLanguage(["home"]);
  const yearGroups = groupTripsByStartYear(visitedTrips);

  if (yearGroups.length === 0) {
    return (
      <div className="timeline-track">
        <EmptyState message={t("timeline.empty")} />
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="timeline-track">
        {yearGroups.map(({ year, trips }) => (
          <section className="timeline-year" key={year}>
            <h2 className="timeline-year__marker figure">{year}</h2>
            <ul className="timeline-year__entries">
              {trips.map((trip) => (
                <TimelineEntry key={trip.id} trip={trip} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </LazyMotion>
  );
}
