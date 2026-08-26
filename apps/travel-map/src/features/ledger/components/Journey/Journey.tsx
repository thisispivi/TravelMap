import "./Journey.scss";

import { ReactNode, useEffect } from "react";
import { Link, Outlet, useParams } from "react-router";

import { findJourney, spanTotal, stayedCities } from "@/data/record";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { useReading } from "@/shared/context/Reading.context";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { toHours, writeDuration } from "../../lib/duration";
import { Measure } from "../Measure/Measure";
import { Span } from "../Span/Span";

const dateRangeFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Returns a cached date-range formatter. Building one is expensive enough that
 * it must not happen on every render of a journey header.
 * @param {string} locale - The active locale
 * @returns {Intl.DateTimeFormat} The formatter for that locale
 */
function dateRangeFormatter(locale: string): Intl.DateTimeFormat {
  const cached = dateRangeFormatters.get(locale);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  dateRangeFormatters.set(locale, formatter);
  return formatter;
}

/**
 * Journey component
 * One journey read at the scale where its time accounting becomes legible:
 * every stay and every passage as a row whose tick is as long as the time it
 * took. Leaving is a return to the whole record rather than a step back, which
 * is why the only way out is upward in scale.
 * @component
 * @returns {ReactNode} The journey at reading scale
 */
export function Journey(): ReactNode {
  const { currLanguage, t } = useLanguage(["record"]);
  const { tripId } = useParams();
  const { setFigures, setLocus } = useReading();
  const journey = findJourney(tripId);
  const trip = journey?.entry.trip;

  /* The plate frames the whole journey until a row asks for something narrower,
     so arriving by direct link lands with the route already drawn. */
  useEffect(() => {
    if (!journey || !trip) return;
    setFigures(journey.running);
    setLocus({
      cities: stayedCities(journey.entry),
      route: trip.getRouteLines(),
    });
    return () => setLocus(null);
  }, [journey, setFigures, setLocus, trip]);

  if (!journey || !trip) {
    return (
      <div className="journey journey--missing">
        <EmptyState message={t("record:unknownJourney")} />
        <Link className="journey__back" to="/">
          {t("record:backToRecord")}
        </Link>
      </div>
    );
  }

  const { entry } = journey;
  const total = spanTotal(entry);
  const dates = dateRangeFormatter(currLanguage).formatRange(
    trip.sDate,
    trip.eDate,
  );

  return (
    <article className="journey">
      <header className="journey__head">
        <Link className="journey__back" to="/" viewTransition>
          {t("record:backToRecord")}
        </Link>
        <h1 className="journey__title">
          {trip.getLocalizedTitle(currLanguage)}
        </h1>
        <p className="journey__dates figure">{dates}</p>
        <Measure
          name="reading-measure"
          spans={entry.spans}
          totalMinutes={total}
        />
        <dl className="journey__readings">
          <div className="journey__reading">
            <dt>{t("record:away")}</dt>
            <dd className="figure">{writeDuration(total)}</dd>
          </div>
          <div className="journey__reading">
            <dt>{t("record:inMotion")}</dt>
            <dd className="figure">{toHours(entry.minutesInMotion)}h</dd>
          </div>
          <div className="journey__reading">
            <dt>{t("record:covered")}</dt>
            <dd className="figure">
              {Math.round(entry.distanceKm).toLocaleString(currLanguage)} km
            </dd>
          </div>
        </dl>
      </header>
      {/* A span's identity is its position: the itinerary is authored as an
          ordered array that never reorders at runtime, and the URL addresses a
          stay by that same index. */}
      <ol className="journey__spans">
        {entry.spans.map((span, index) => (
          <Span
            index={index}
            key={`${span.kind}-${index}`}
            span={span}
            tripId={trip.id}
          />
        ))}
      </ol>
      <Outlet />
    </article>
  );
}
