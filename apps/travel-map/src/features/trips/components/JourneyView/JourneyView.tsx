import "./JourneyView.scss";

import { ReactNode, useEffect } from "react";
import { Link } from "react-router";

import ChevronIcon from "@/assets/icons/Chevron.svg?react";
import { futureTrips, visitedTrips } from "@/data/world";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { TransportModeIcon } from "@/shared/components/TransportModeIcon/TransportModeIcon";
import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatBearing, reckon, resolveOrigin } from "@/shared/lib/bearings";
import { formatDistance } from "@/shared/lib/format";

import {
  buildTripDetailTimelineItems,
  computeTripStats,
  summarizeTripModes,
  totalTripDistanceKm,
} from "../../lib/tripDetailTimeline";
import { TripTimeline } from "../TripTimeline/TripTimeline";

/**
 * JourneyView component
 * One journey, read in the margin while the plate flies its route. It opens
 * with the two readings that place the journey in the record, the direction it
 * set off in and how far out it reached, because those are what the rose and
 * the index were showing and this is where they resolve into an itinerary.
 * @component
 * @returns {ReactNode} The journey, or an empty state when the identifier is unknown
 */
export function JourneyView(): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const { tripId } = useAppRoute();
  const { selectedTrip, setSelectedTrip } = useMapInteraction();
  const origin = resolveOrigin();
  /*
   * Planned journeys are absent from the browsable index, but a link to one
   * still has to resolve, so the lookup spans both records.
   */
  const trip =
    selectedTrip?.id === tripId
      ? selectedTrip
      : ([...visitedTrips, ...futureTrips].find(
          (entry) => entry.id === tripId,
        ) ?? null);

  useEffect(() => {
    if (trip && selectedTrip?.id !== trip.id) setSelectedTrip(trip);
  }, [selectedTrip?.id, setSelectedTrip, trip]);

  if (!trip) {
    return (
      <div className="journey journey--empty">
        <EmptyState message={t("journey.unknown")} />
      </div>
    );
  }

  const title = trip.getLocalizedTitle(lang);
  const countries = trip.getCountriesVisited();
  const items = buildTripDetailTimelineItems(trip);
  const stats = computeTripStats(items);
  const distanceKm = totalTripDistanceKm(stats);
  const days = trip.getDurationInDays();
  const modes = summarizeTripModes(stats);
  const entry = origin ? reckon(trip, origin) : null;
  const showYear = trip.sDate.getFullYear() !== trip.eDate.getFullYear();
  /* Only figures the journey actually has: a walking city break should not show
     a zero-kilometre column next to its real numbers. */
  const figures = [
    days > 0 && {
      label: days === 1 ? t("tripDetail.day") : t("tripDetail.days"),
      value: String(days),
    },
    stats.stops > 0 && {
      label: t("tripDetail.stops"),
      value: String(stats.stops),
    },
    distanceKm > 0 && {
      label: t("tripDetail.travelled"),
      value: formatDistance(distanceKm, lang),
    },
    stats.timezoneCount > 1 && {
      label: t("tripDetail.timeZones"),
      value: String(stats.timezoneCount),
    },
  ].filter((figure) => figure !== false);

  return (
    <article className="journey">
      <Link className="journey__back" to="/trips">
        <ChevronIcon aria-hidden className="journey__back-chevron" />
        {t("nav.record")}
      </Link>

      <header className="journey__head">
        {trip.backgroundImgSource ? (
          <div className="journey__plate">
            <img
              alt=""
              className="journey__plate-img"
              src={trip.backgroundImgSource}
            />
          </div>
        ) : null}

        <div className="journey__identity">
          <span className="journey__flags">
            {countries.map((country) => (
              <CountryFlag
                className="journey__flag"
                countryId={country.id}
                key={country.id}
              />
            ))}
          </span>
          <h1 className="journey__title">{title}</h1>
          <p className="journey__dates figure">
            {formatDateRangeShort({
              sDateInput: trip.sDate,
              eDateInput: trip.eDate,
              locale: lang,
              includeWeekday: false,
              showYear: true,
            })}
          </p>
        </div>
      </header>

      {entry && entry.furthest ? (
        <p className="journey__reckoning">
          <span
            aria-hidden
            className="journey__reckoning-tick"
            style={{ rotate: `${entry.bearing}deg` }}
          />
          <span className="journey__reckoning-text">
            {t("journey.outbound", {
              origin: origin?.getLocalizedName(lang) ?? "",
              furthest: entry.furthest.getLocalizedName(lang),
            })}
          </span>
          <span className="journey__reckoning-reading figure">
            {formatBearing(entry.bearing)}
            {" / "}
            {formatDistance(entry.distanceKm, lang)}
          </span>
        </p>
      ) : null}

      <dl className="journey__figures">
        {figures.map((figure) => (
          <div className="journey__figure" key={figure.label}>
            <dt className="journey__figure-label">{figure.label}</dt>
            <dd className="journey__figure-value figure">{figure.value}</dd>
          </div>
        ))}
      </dl>

      {modes.length > 0 ? (
        <ul className="journey__modes">
          {modes.map((mode) => (
            <li
              className={`journey__mode journey__mode--${mode.mode}`}
              key={mode.mode}
            >
              <TransportModeIcon
                className="journey__mode-icon"
                mode={mode.mode}
              />
              <span className="figure">{mode.count}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <section className="journey__route">
        <h2 className="journey__route-label eyebrow">
          {t("tripDetail.route")}
        </h2>
        <TripTimeline items={items} showYear={showYear} />
      </section>
    </article>
  );
}
