import "./TripDetailHero.scss";

import { Country, Trip } from "@travelmap/core";
import { ReactNode } from "react";

import CalendarIcon from "@/assets/icons/Calendar.svg?react";
import ChevronIcon from "@/assets/icons/Chevron.svg?react";
import MapIcon from "@/assets/icons/Map.svg?react";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { useLanguage } from "@/shared/hooks/useLanguage";

/**
 * Properties accepted by the TripDetailHero component.
 * @property {Trip} trip - The trip
 * @property {Country[]} countries - The countries
 * @property {() => void} onBack - The on back
 * @property {() => void} onViewMap - The on view map
 */
interface TripDetailHeroProps {
  trip: Trip;
  countries: Country[];
  onBack: () => void;
  onViewMap: () => void;
}

/**
 * TripDetailHero component
 * Full-bleed hero image with back button, country flags, trip title and date
 * range. Rendered at the top of the TripDetail panel.
 * @component
 * @param {TripDetailHeroProps} props - The hero props
 * @param {Trip} props.trip - Trip to display
 * @param {Country[]} props.countries - Countries visited on the trip (for flags)
 * @param {() => void} props.onBack - Handler called when the back button is pressed
 * @param {() => void} props.onViewMap - Handler called when the map button is pressed
 * @returns {ReactNode} The trip hero header
 */
export function TripDetailHero({
  trip,
  countries,
  onBack,
  onViewMap,
}: TripDetailHeroProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const tripTitle = trip.getLocalizedTitle(lang);

  return (
    <>
      <button className="trip-detail__back" onClick={onBack} type="button">
        <ChevronIcon className="trip-detail__back-chevron" />
        <span>{t("visited.title")}</span>
      </button>

      <div className="trip-detail__hero">
        {trip.backgroundImgSource ? (
          <img
            alt={tripTitle}
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
          <div className="trip-detail__hero-meta">
            <div className="trip-detail__hero-date">
              <CalendarIcon className="trip-detail__hero-date-icon" />
              <span>
                {formatDateRangeShort({
                  sDateInput: trip.sDate,
                  eDateInput: trip.eDate,
                  locale: lang,
                  includeWeekday: false,
                  showYear: true,
                })}
              </span>
            </div>
            <button
              className="trip-detail__hero-map-btn"
              onClick={onViewMap}
              type="button"
            >
              <MapIcon className="trip-detail__hero-map-btn-icon" />
              {t("tripDetail.viewMap")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
