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

export function TimelineTrack(): JSX.Element {
  const yearGroups = useMemo<YearGroup[]>(() => {
    // Years descending, trips within each year ascending
    const sorted = [...visitedTrips].sort(
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
      const ascTrips = [...trips].sort(
        (a, b) => a.trip.sDate.getTime() - b.trip.sDate.getTime(),
      );
      groups.push({
        year,
        trips: ascTrips.map((item) => ({
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

function TimelineYearGroup({ year, trips }: YearGroup): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "0px 0px -20px 0px" });

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

function TimelineCardItem({
  trip,
  side,
}: {
  trip: (typeof visitedTrips)[0];
  side: "left" | "right";
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "0px 0px -30px 0px" });
  const navigate = useNavigate();
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const countries = trip.getCountriesVisited();

  const hiddenState = { opacity: 0, x: side === "left" ? -20 : 20 };
  const visibleState = { opacity: 1, x: 0 };

  return (
    <m.div
      animate={isInView ? visibleState : hiddenState}
      className={`timeline-card timeline-card--${side}`}
      initial={hiddenState}
      onClick={() => navigate(`/trip/${trip.id}`)}
      ref={ref}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
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
