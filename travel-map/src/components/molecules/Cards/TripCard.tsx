import "./TripCard.scss";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { JSX, useId, useMemo, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useNavigate } from "react-router-dom";
import { uniqueBy } from "remeda";

import { formatDateRangeShort } from "@/i18n/functions/date";
import { parameters } from "@/utils/parameters";

import { CalendarIcon, ChevronIcon } from "../../../assets";
import { City, Trip } from "../../../core";
import { useLanguage } from "../../../hooks/language/language";
import { Button, CountryFlag, Loading } from "../../atoms";
import { Row } from "../Row/Row";

interface TripCardProps {
  className?: string;
  trip: Trip;
  setHoveredCity: (city: City | null) => void;
  setMapPosition?: (position: {
    center: [number, number];
    zoom: number;
  }) => void;
  isAutoPosition?: boolean;
}

/**
 * TripCard component
 *
 * The TripCard component is a molecule that displays a trip overview card.
 * It includes the trip name, dates, countries visited, and expandable details
 * showing the cities visited during the trip.
 *
 * @param {TripCardProps} data - The data that will be used to display the component.
 * @param {string} data.className - The class to apply to the trip card
 * @param {Trip} data.trip - The trip to display
 * @param {function} data.setHoveredCity - The function to set the hovered city
 * @param {function} [data.setMapPosition] - The function to set the map position
 * @param {boolean} [data.isAutoPosition] - Whether the map should auto position to the city when hovered
 * @returns {JSX.Element} The TripCard component
 */
export function TripCard({
  className = "",
  trip,
  setHoveredCity,
  setMapPosition,
  isAutoPosition = false,
}: TripCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const { t, currLanguage: lang } = useLanguage(["home"]);
  const prefersReducedMotion = useReducedMotion();
  const detailsId = useId();

  const countries = useMemo(
    () =>
      uniqueBy(
        trip.destinations.map((destination) => destination.city.country),
        (country) => country.id,
      ),
    [trip.destinations],
  );

  /**
   * Toggles the card's expanded state.
   *
   * The expand/collapse animation is intentionally driven by a single animated
   * container (see `trip-card__details`) to avoid border-radius desync/jank.
   */
  const toggleExpand = () => setIsExpanded((prev) => !prev);

  return (
    <motion.article
      className={`trip-card ${className}`}
      layout
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 520, damping: 46 }
      }
    >
      <button
        aria-controls={detailsId}
        aria-expanded={isExpanded}
        className="trip-card__header"
        onClick={(e) => {
          e.stopPropagation();
          toggleExpand();
        }}
        type="button"
      >
        <div aria-hidden className="trip-card__image-container">
          <div className="trip-card__image-overlay" />
          <img
            alt={trip.name}
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
            <h2 className="trip-card__title">{trip.name}</h2>

            <motion.span
              animate={{ rotate: isExpanded ? 90 : -90 }}
              aria-hidden
              className="trip-card__chevron"
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 700, damping: 44 }
              }
            >
              <ChevronIcon className="trip-card__chevron-icon" />
            </motion.span>
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

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.section
            animate={{ height: "auto", opacity: 1 }}
            className="trip-card__details"
            exit={{ height: 0, opacity: 0 }}
            id={detailsId}
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }
            }
          >
            <div className="trip-card__details-inner">
              <div className="trip-card__cities">
                {trip.destinations.map((destination, index) => (
                  <Button
                    ariaLabel={`Open ${destination.city.getName(t)} gallery`}
                    className="trip-card__city"
                    key={`${destination.city.name}-${destination.travelIdx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/gallery/${destination.city.name}/${destination.travelIdx}`,
                      );
                    }}
                    onMouseEnter={() => {
                      setHoveredCity(destination.city);
                      if (
                        setMapPosition &&
                        destination.city.mapCoordinates &&
                        isAutoPosition
                      ) {
                        setMapPosition({
                          center: destination.city.mapCoordinates,
                          zoom: parameters.map.hoveredCityZoom,
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredCity(null)}
                  >
                    <div className="trip-card__city-number">{index + 1}</div>

                    <div className="trip-card__city-body">
                      <div className="trip-card__city-topline">
                        <p className="trip-card__city-name">
                          {destination.city.getName(t)}
                        </p>
                        <CountryFlag
                          className="trip-card__city-flag"
                          countryId={destination.city.country.id}
                        />
                      </div>

                      {destination.city.travels[destination.travelIdx]
                        ?.sDate ? (
                        <div className="trip-card__city-dates">
                          <CalendarIcon className="trip-card__city-dates-icon" />
                          <p className="trip-card__city-dates-text">
                            {formatDateRangeShort({
                              sDateInput:
                                destination.city.travels[destination.travelIdx]
                                  .sDate,
                              eDateInput:
                                destination.city.travels[destination.travelIdx]
                                  .eDate,
                              locale: lang,
                              includeWeekday: false,
                              showYear: true,
                            })}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div
                      aria-hidden
                      className="trip-card__city-image-container"
                    >
                      <LazyLoadImage
                        alt={destination.city.getName(t)}
                        className="trip-card__city-image"
                        effect="opacity"
                        placeholder={
                          <div className="trip-card__city-loading">
                            <Loading />
                          </div>
                        }
                        src={
                          destination.city.getBackgroundImgSourceByIndex(0) ||
                          undefined
                        }
                      />
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}
