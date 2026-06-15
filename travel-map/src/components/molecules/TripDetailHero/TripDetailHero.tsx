import "./TripDetailHero.scss";

import { ReactNode } from "react";

import { CalendarIcon, ChevronIcon, MapIcon } from "@/assets";
import { CountryFlag } from "@/components/atoms";
import { Country, Trip } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { formatDateRangeShort } from "@/i18n/functions/date";

interface TripDetailHeroProps {
  trip: Trip;
  countries: Country[];
  onBack: () => void;
  onViewMap: () => void;
}

/**
 * TripDetailHero component
 *
 * Full-bleed hero image with back button, country flags, trip title and date
 * range. Rendered at the top of the TripDetail panel.
 *
 * @component
 *
 * @param {TripDetailHeroProps} props - The hero props
 * @param {Trip} props.trip - Trip to display
 * @param {Country[]} props.countries - Countries visited on the trip (for flags)
 * @param {() => void} props.onBack - Handler called when the back button is pressed
 * @returns {ReactNode} The trip hero header
 */
export function TripDetailHero({
  trip,
  countries,
  onBack,
  onViewMap,
}: TripDetailHeroProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);

  return (
    <>
      <button className="trip-detail__back" onClick={onBack} type="button">
        <ChevronIcon className="trip-detail__back-chevron" />
        <span>{t("visited.title")}</span>
      </button>

      <div className="trip-detail__hero">
        {trip.backgroundImgSource ? (
          <img
            alt={t(`trips.${trip.id}`)}
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
          <h2 className="trip-detail__hero-title">{t(`trips.${trip.id}`)}</h2>
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
