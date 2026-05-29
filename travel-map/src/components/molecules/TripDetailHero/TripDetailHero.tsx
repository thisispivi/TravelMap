import "./TripDetailHero.scss";

import { JSX } from "react";

import { CalendarIcon, ChevronIcon } from "@/assets";
import { CountryFlag } from "@/components/atoms";
import { Country, Trip } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { formatDateRangeShort } from "@/i18n/functions/date";

interface TripDetailHeroProps {
  trip: Trip;
  countries: Country[];
  onBack: () => void;
}

export function TripDetailHero({
  trip,
  countries,
  onBack,
}: TripDetailHeroProps): JSX.Element {
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
          </div>
        </div>
      </div>
    </>
  );
}
