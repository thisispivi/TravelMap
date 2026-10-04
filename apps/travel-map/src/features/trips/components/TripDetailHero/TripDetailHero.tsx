import "./TripDetailHero.scss";

import { Country, TransportModeSchema, Trip } from "@travelmap/core";
import { ReactNode } from "react";

import CalendarIcon from "@/assets/icons/Calendar.svg?react";
import MapIcon from "@/assets/icons/Map.svg?react";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { TransportModeIcon } from "@/shared/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatDuration, formatMileage } from "@/shared/lib/format";

import { countTimeZones } from "../../lib/tripItinerary";

/**
 * Properties accepted by the TripDetailHero component.
 * @property {Trip} trip - The trip
 * @property {Country[]} countries - The countries visited, shown as flags
 * @property {() => void} onViewMap - Hides the panel to show the route on the map
 */
interface TripDetailHeroProps {
  trip: Trip;
  countries: Country[];
  onViewMap: () => void;
}

/**
 * TripDetailHero component
 * The trip's card, drawn like its card in the trips list — photo, flags,
 * title, dates — and continued below the photo with the trip's numbers: days,
 * nights and distance as large figures, then one line per transport mode with
 * its rides, distance and time. Everything is visible; nothing opens.
 * @component
 * @param {TripDetailHeroProps} props - The hero props
 * @param {Trip} props.trip - The trip
 * @param {Country[]} props.countries - The countries visited, shown as flags
 * @param {() => void} props.onViewMap - Hides the panel to show the route on the map
 * @returns {ReactNode} The trip card
 */
export function TripDetailHero({
  trip,
  countries,
  onViewMap,
}: TripDetailHeroProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const tripTitle = trip.getLocalizedTitle(lang);
  const totals = trip.getModeTotals();
  const totalKm = Object.values(totals).reduce((sum, { km }) => sum + km, 0);
  const timeZones = countTimeZones(trip);
  const figures = [
    {
      label: t("tripDetail.unit.day", { count: trip.getDurationInDays() }),
      value: String(trip.getDurationInDays()),
    },
    {
      label: t("tripDetail.unit.night", { count: trip.getNights() }),
      value: String(trip.getNights()),
    },
    { label: "km", value: formatMileage(totalKm, lang, 0) },
    ...(timeZones > 1
      ? [
          {
            label: t("tripDetail.unit.timeZone", { count: timeZones }),
            value: String(timeZones),
          },
        ]
      : []),
  ];

  return (
    <section className="trip-detail__summary">
      <div className="trip-detail__hero">
        {trip.backgroundImgSource ? (
          <img
            alt=""
            className="trip-detail__hero-img"
            src={trip.backgroundImgSource}
          />
        ) : null}
        <div className="trip-detail__hero-overlay" />
        <div className="trip-detail__hero-flags">
          {countries.map((country) => (
            <CountryFlag
              className="trip-detail__hero-flag"
              countryId={country.id}
              key={country.id}
            />
          ))}
        </div>
        <div className="trip-detail__hero-content">
          <h2 className="trip-detail__hero-title">{tripTitle}</h2>
          <p className="trip-detail__hero-date">
            <CalendarIcon className="trip-detail__hero-date-icon" />
            {formatDateRangeShort({
              eDateInput: trip.eDate,
              includeWeekday: false,
              locale: lang,
              sDateInput: trip.sDate,
              showYear: true,
            })}
          </p>
        </div>
      </div>

      <dl className="trip-detail__figures">
        {figures.map(({ label, value }) => (
          <div className="trip-detail__figure" key={label}>
            <dd className="trip-detail__figure-value">{value}</dd>
            <dt className="trip-detail__figure-label">{label}</dt>
          </div>
        ))}
      </dl>

      <ul className="trip-detail__modes">
        {TransportModeSchema.options.map((mode) => {
          const total = totals[mode];
          return total ? (
            <li
              className={`trip-detail__mode trip-detail__mode--${mode}`}
              key={mode}
            >
              <TransportModeIcon
                className="trip-detail__mode-icon"
                mode={mode}
              />
              <span className="trip-detail__mode-name">
                {t(`tripDetail.mode_${mode}`, { count: total.count })}
              </span>
              <span className="trip-detail__mode-value">
                {formatMileage(total.km, lang, 0)} km ·{" "}
                {formatDuration(total.minutes)}
              </span>
            </li>
          ) : null;
        })}
      </ul>

      <button
        className="trip-detail__view-map"
        onClick={onViewMap}
        type="button"
      >
        <MapIcon aria-hidden="true" className="trip-detail__view-map-icon" />
        {t("tripDetail.viewMap")}
      </button>
    </section>
  );
}
