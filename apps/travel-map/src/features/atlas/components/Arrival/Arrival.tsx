import "./Arrival.scss";

import {
  City,
  getCitiesBearing,
  getCitiesDistance,
  getTotalDistance,
} from "@travelmap/core";
import { ReactNode } from "react";
import { Link } from "react-router";

import {
  futureTrips,
  siteConfig,
  takenFerries,
  takenFlights,
  visitedCities,
  visitedCountries,
  visitedTrips,
} from "@/data/world";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatBearing, resolveOrigin } from "@/shared/lib/bearings";
import { classNames } from "@/shared/lib/classNames";
import { formatDistance } from "@/shared/lib/format";

const RECENT_COUNT = 4;

/**
 * Arrival component
 * The reading side of the arrival. It names the record, states the two facts
 * that frame everything beside it on the rose, and prints the running totals
 * before handing the reader to the record itself. Pointing at a journey here
 * lights its thread on the rose, so the column and the plate are two views of
 * the same list rather than a summary and a picture.
 * @component
 * @returns {ReactNode} The arrival panel
 */
export function Arrival(): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const { focusedTrip, setFocusedTrip } = useMapInteraction();
  const origin = resolveOrigin();
  const name = siteConfig?.site?.name ?? t("atlas.fallbackName");

  if (visitedTrips.length === 0 && futureTrips.length === 0) {
    return (
      <div className="arrival arrival--empty">
        <p className="arrival__name">{name}</p>
        <EmptyState message={t("atlas.empty")} />
      </div>
    );
  }

  const years = visitedTrips.map((trip) => trip.sDate.getFullYear());
  const recent = visitedTrips
    .toSorted((first, second) => second.sDate.getTime() - first.sDate.getTime())
    .slice(0, RECENT_COUNT);
  /* The furthest place in the record is the one the arrival names, and it is a
     single pass over the visited cities rather than the whole statistics
     snapshot, which this column has no other use for. */
  const furthestCity =
    origin === null
      ? null
      : visitedCities.reduce<City | null>(
          (furthest, city) =>
            furthest === null ||
            getCitiesDistance(origin, city) >
              getCitiesDistance(origin, furthest)
              ? city
              : furthest,
          null,
        );
  const furthest =
    origin && furthestCity
      ? {
          city: furthestCity,
          bearing: getCitiesBearing(origin, furthestCity),
          distanceKm: getCitiesDistance(origin, furthestCity),
        }
      : null;

  return (
    <div className="arrival">
      <header className="arrival__head">
        <p className="arrival__name">{name}</p>
        <h1 className="arrival__statement">
          <span className="arrival__count figure">{visitedTrips.length}</span>
          {t("atlas.statement", {
            place: origin?.getLocalizedName(lang) ?? "",
          })}
        </h1>
        <p className="arrival__span figure">
          {Math.min(...years)}-{Math.max(...years)}
        </p>
      </header>

      <dl className="arrival__figures">
        <div className="arrival__figure">
          <dt className="arrival__figure-label">{t("stats.countries")}</dt>
          <dd className="arrival__figure-value figure">
            {visitedCountries.length}
          </dd>
        </div>
        <div className="arrival__figure">
          <dt className="arrival__figure-label">{t("stats.cities")}</dt>
          <dd className="arrival__figure-value figure">
            {visitedCities.length}
          </dd>
        </div>
        <div className="arrival__figure">
          <dt className="arrival__figure-label">{t("stats.totalMileage")}</dt>
          <dd className="arrival__figure-value figure">
            {formatDistance(getTotalDistance(takenFlights, takenFerries), lang)}
          </dd>
        </div>
      </dl>

      {furthest ? (
        <p className="arrival__furthest">
          <span className="arrival__furthest-label">
            {t("stats.furthestCity")}
          </span>
          <span className="arrival__furthest-city">
            {furthest.city.getLocalizedName(lang)}
          </span>
          <span className="arrival__furthest-reading reading">
            {formatBearing(furthest.bearing)}
            {" / "}
            {formatDistance(furthest.distanceKm, lang)}
          </span>
        </p>
      ) : null}

      <section className="arrival__recent">
        <h2 className="arrival__recent-label eyebrow">{t("atlas.latest")}</h2>
        <ul className="arrival__list">
          {recent.map((trip) => (
            <li key={trip.id}>
              <Link
                className={classNames(
                  "arrival__entry",
                  focusedTrip?.id === trip.id && "arrival__entry--focused",
                )}
                onBlur={() => setFocusedTrip(null)}
                onFocus={() => setFocusedTrip(trip)}
                onMouseEnter={() => setFocusedTrip(trip)}
                onMouseLeave={() => setFocusedTrip(null)}
                to={`/trip/${trip.id}`}
              >
                <span className="arrival__entry-year figure">
                  {trip.sDate.getFullYear()}
                </span>
                <span className="arrival__entry-title">
                  {trip.getLocalizedTitle(lang)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Link className="arrival__open" to="/trips">
        {t("atlas.openRecord")}
      </Link>
    </div>
  );
}
