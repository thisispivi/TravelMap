import "./TripCard.scss";

import { domAnimation, LazyMotion, m, useReducedMotion } from "framer-motion";
import { JSX } from "react";

import { formatDateRangeShort } from "@/i18n/functions/date";

import { CalendarIcon } from "../../../assets";
import { Trip } from "../../../core";
import { useLanguage } from "../../../hooks/language/language";
import { CountryFlag } from "../../atoms";
import { Row } from "../Row/Row";

interface TripCardProps {
  className?: string;
  trip: Trip;
  onSelect?: () => void;
}

/**
 * TripCard component
 *
 * Photo card that opens the trip detail panel.
 *
 * @component
 *
 * @param {TripCardProps} props - The trip card props
 * @param {string} [props.className] - Additional class names
 * @param {Trip} props.trip - Trip to display
 * @param {() => void} [props.onSelect] - Selection handler
 * @returns {JSX.Element} The trip card
 */
export function TripCard({
  className = "",
  trip,
  onSelect,
}: TripCardProps): JSX.Element {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const prefersReducedMotion = useReducedMotion();
  const tripTitle = t(`trips.${trip.id}`);

  const countries = trip.getCountriesVisited();

  return (
    <LazyMotion features={domAnimation}>
      <m.article
        className={`trip-card ${className}`}
        layout
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 520, damping: 46 }
        }
      >
        <button
          aria-label={t("tripCard.openTrip", { trip: tripTitle })}
          className="trip-card__header"
          onClick={onSelect}
          type="button"
        >
          <div aria-hidden className="trip-card__image-container">
            <div className="trip-card__image-overlay" />
            <img
              alt={tripTitle}
              className="trip-card__image"
              src={trip.backgroundImgSource}
            />
          </div>

          <div className="trip-card__info">
            <Row className="trip-card__flags">
              {countries.map((country) => (
                <CountryFlag
                  className="trip-card__flag"
                  countryId={country.id}
                  key={country.id}
                />
              ))}
            </Row>

            <div className="trip-card__header-row">
              <h2 className="trip-card__title">{tripTitle}</h2>
            </div>

            {trip.sDate ? (
              <div className="trip-card__date">
                <CalendarIcon className="trip-card__date-icon" />
                <p className="trip-card__date-text">
                  {formatDateRangeShort({
                    sDateInput: trip.sDate,
                    eDateInput: trip.eDate,
                    locale: lang,
                    includeWeekday: false,
                    showYear: true,
                  })}
                </p>
              </div>
            ) : null}
          </div>
        </button>
      </m.article>
    </LazyMotion>
  );
}
