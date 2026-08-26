import "./JourneyBar.scss";

import { ReactNode } from "react";
import { Link } from "react-router";

import { RecordJourney, spanTotal, stayedCities } from "@/data/record";
import { longestJourneyMinutes } from "@/data/record";
import { useReading } from "@/shared/context/Reading.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";

import { writeDuration } from "../../lib/duration";
import { Measure } from "../Measure/Measure";

/**
 * Properties accepted by a journey bar.
 * @property {RecordJourney} journey - The journey to draw
 */
interface JourneyBarProps {
  journey: RecordJourney;
}

/**
 * JourneyBar component
 * One journey in the record, drawn to the scale every other journey is drawn
 * at, so the column's right edge is ragged by exactly as much as the journeys
 * differed in length. Pointing at a bar sends the plate to that journey.
 * @component
 * @param {JourneyBarProps} props - The journey bar props
 * @param {RecordJourney} props.journey - The journey to draw
 * @returns {ReactNode} The journey bar
 */
export function JourneyBar({ journey }: JourneyBarProps): ReactNode {
  const { currLanguage, t } = useLanguage(["record"]);
  const { setLocus } = useReading();
  const { entry, isPlanned } = journey;
  const total = spanTotal(entry);
  const cities = stayedCities(entry);
  const title = entry.trip.getLocalizedTitle(currLanguage);

  /**
   * Points the plate at this journey's route.
   * @returns {void}
   */
  const aim = (): void => {
    setLocus({ cities, route: entry.trip.getRouteLines() });
  };

  return (
    <Link
      aria-label={t("record:journeyLabel", {
        days: Math.round(total / (60 * 24)),
        km: Math.round(entry.distanceKm).toLocaleString(currLanguage),
        places: cities
          .map((city) => city.getLocalizedName(currLanguage))
          .join(", "),
        title,
      })}
      className={classNames("journey-bar", isPlanned && "journey-bar--planned")}
      onBlur={() => setLocus(null)}
      onFocus={aim}
      onPointerEnter={aim}
      onPointerLeave={() => setLocus(null)}
      to={`/journey/${entry.trip.id}`}
      viewTransition
    >
      <span className="journey-bar__title">{title}</span>
      <span className="journey-bar__reading figure">
        {writeDuration(total)}
        <span className="journey-bar__separator">·</span>
        {Math.round(entry.distanceKm).toLocaleString(currLanguage)} km
      </span>
      <Measure
        fill={(total / longestJourneyMinutes) * 100}
        name="reading-measure"
        spans={entry.spans}
        totalMinutes={total}
      />
      <span className="journey-bar__places">
        {cities.map((city) => city.getLocalizedName(currLanguage)).join(" · ")}
        {isPlanned ? (
          <span className="journey-bar__planned">{t("record:planned")}</span>
        ) : null}
      </span>
    </Link>
  );
}
