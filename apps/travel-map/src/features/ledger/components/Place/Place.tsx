import "./Place.scss";

import { ReactNode, useEffect } from "react";
import { Link, useParams } from "react-router";

import { readPlace } from "@/data/record";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { useReading } from "@/shared/context/Reading.context";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { writeDuration } from "../../lib/duration";
import { JourneyBar } from "../JourneyBar/JourneyBar";

/**
 * Place component
 * One city, put back together from every journey that touched it. The record is
 * written as journeys, so a place has no entry of its own — this reading is the
 * only way to ask how much of a life was spent somewhere rather than how a
 * particular fortnight was spent.
 * @component
 * @returns {ReactNode} The city's reading
 */
export function Place(): ReactNode {
  const { currLanguage, t } = useLanguage(["record"]);
  const { cityId } = useParams();
  const { setLocus } = useReading();
  const place = readPlace(cityId);
  const city = place?.city;

  useEffect(() => {
    if (!city) return;
    setLocus({ cities: [city] });
    return () => setLocus(null);
  }, [city, setLocus]);

  if (!place || !city) {
    return (
      <div className="place place--missing">
        <EmptyState message={t("record:unknownPlace")} />
        <Link className="place__back" to="/">
          {t("record:backToRecord")}
        </Link>
      </div>
    );
  }

  const stayed = place.minutes - place.layoverMinutes;

  return (
    <article className="place">
      <header className="place__head">
        <Link className="place__back" to="/" viewTransition>
          {t("record:backToRecord")}
        </Link>
        <h1 className="place__name">{city.getLocalizedName(currLanguage)}</h1>
        <p className="place__country">
          {city.country.name}
          <span className="place__separator">·</span>
          <span className="figure">{city.timeZone}</span>
        </p>
        <dl className="place__readings">
          <div className="place__reading">
            <dt>{t("record:timeThere")}</dt>
            <dd className="figure">{writeDuration(place.minutes)}</dd>
          </div>
          {place.layoverMinutes > 0 ? (
            <div className="place__reading">
              <dt>{t("record:ofThatPassingThrough")}</dt>
              <dd className="figure">
                {writeDuration(place.layoverMinutes)}
                {stayed <= 0 ? ` (${t("record:allOfIt")})` : ""}
              </dd>
            </div>
          ) : null}
          <div className="place__reading">
            <dt>{t("record:photographs_short")}</dt>
            <dd className="figure">{place.photographs.length}</dd>
          </div>
        </dl>
      </header>
      <h2 className="place__section">
        {t("record:reachedBy", { count: place.journeys.length })}
      </h2>
      <ol className="place__journeys">
        {place.journeys.map((journey) => (
          <li key={journey.entry.trip.id}>
            <JourneyBar journey={journey} />
          </li>
        ))}
      </ol>
    </article>
  );
}
