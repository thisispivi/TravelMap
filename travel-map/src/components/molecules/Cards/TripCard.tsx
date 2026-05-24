import "./TripCard.scss";

import { domAnimation, LazyMotion, m, useReducedMotion } from "framer-motion";
import { JSX, useMemo } from "react";
import { uniqueBy } from "remeda";

import { formatDateRangeShort } from "@/i18n/functions/date";

import { CalendarIcon } from "../../../assets";
import { Trip } from "../../../core";
import { useLanguage } from "../../../hooks/language/language";
import { CountryFlag } from "../../atoms";

interface TripCardProps {
  className?: string;
  trip: Trip;
  onSelect?: () => void;
}

/**
 * TripCard component — simple photo card that opens the trip detail on click.
 *
 * @component
 * @param {TripCardProps} props
 */
export function TripCard({
  className = "",
  trip,
  onSelect,
}: TripCardProps): JSX.Element {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const prefersReducedMotion = useReducedMotion();

  const countries = useMemo(
    () =>
      uniqueBy(
        trip.destinations.map((d) => d.city.country),
        (c) => c.id,
      ),
    [trip.destinations],
  );

  return (
    <LazyMotion features={domAnimation}>
      <m.article
        className={`trip-card ${className}`}
        onClick={onSelect}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 520, damping: 46 }
        }
        whileHover={prefersReducedMotion ? undefined : { y: -3 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      >
        <div className="trip-card__image-container">
          <div className="trip-card__image-overlay" />
          <img
            alt={t(`trips.${trip.id}`)}
            className="trip-card__image"
            src={trip.backgroundImgSource}
          />
        </div>

        <div className="trip-card__info">
          <div className="trip-card__flags">
            {countries.map((country) => (
              <CountryFlag
                className="trip-card__flag"
                countryId={country.id}
                key={country.id}
              />
            ))}
          </div>

          <h2 className="trip-card__title">{t(`trips.${trip.id}`)}</h2>

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
      </m.article>
    </LazyMotion>
  );
}
