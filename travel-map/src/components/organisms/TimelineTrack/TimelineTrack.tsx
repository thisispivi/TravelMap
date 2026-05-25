import "./TimelineTrack.scss";

import { domAnimation, LazyMotion, m, useInView } from "framer-motion";
import { JSX, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { CalendarIcon } from "@/assets";
import { visitedTrips } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { formatDateRangeShort } from "@/i18n/functions/date";

import { CountryFlag } from "../../atoms";

const hiddenState = { y: 20, scale: 0.97 };
const visibleState = { y: 0, scale: 1 };

/**
 * TimelineTrack component — vertical chronological timeline of trips.
 */
export function TimelineTrack(): JSX.Element {
  const timelineItems = useMemo(
    () =>
      [...visitedTrips]
        .sort((a, b) => b.sDate.getTime() - a.sDate.getTime())
        .map((trip, i, trips) => {
          const year = trip.sDate.getFullYear();
          const previousTrip = trips[i - 1];
          return {
            showYearDivider:
              !previousTrip || previousTrip.sDate.getFullYear() !== year,
            side: i % 2 === 0 ? "left" : "right",
            trip,
            year,
          } as const;
        }),
    [],
  );

  return (
    <LazyMotion features={domAnimation}>
      <div className="timeline-track">
        <div className="timeline-track__line" />
        {timelineItems.map(({ showYearDivider, side, trip, year }) => {
          return (
            <div key={trip.id}>
              {showYearDivider ? (
                <div className="timeline-track__year-divider">
                  <span>{year}</span>
                </div>
              ) : null}
              <TimelineCardItem side={side} trip={trip} />
            </div>
          );
        })}
      </div>
    </LazyMotion>
  );
}

function TimelineCardItem({
  trip,
  side,
}: {
  trip: (typeof visitedTrips)[0];
  side: "left" | "right";
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-5%" });
  const navigate = useNavigate();
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const countries = trip.getCountriesVisited();

  return (
    <m.div
      animate={isInView ? visibleState : hiddenState}
      className={`timeline-card timeline-card--${side}`}
      initial={hiddenState}
      onClick={() => navigate(`/trip/${trip.id}`)}
      ref={ref}
      transition={{ type: "spring", stiffness: 280, damping: 26, mass: 0.9 }}
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
