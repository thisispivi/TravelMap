import { useState, JSX } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useNavigate } from "react-router-dom";
import useLanguage from "../../../hooks/language/language";
import { City, Trip } from "../../../core";
import { CalendarIcon, ChevronIcon } from "../../../assets";
import { Button, CountryFlag, Loading } from "../../atoms";
import { formatDateRangeShort } from "@/i18n/functions/date";
import "./TripCard.scss";
import Row from "../Row/Row";
import { uniqueBy } from "remeda";
import { parameters } from "@/utils/parameters";

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

export default function TripCard({
  className = "",
  trip,
  setHoveredCity,
  setMapPosition,
  isAutoPosition = false,
}: TripCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const lang = useLanguage([]).currLanguage;
  const { t } = useLanguage(["home"]);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="trip-card" id="info-tab">
      <div
        className={`trip-card__main ${isExpanded ? "is-expanded" : ""} ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleExpand();
        }}
      >
        <div className="trip-card__image-container">
          <div className="trip-card__image-overlay" />
          <img
            alt={trip.name}
            className="trip-card__image"
            src={trip.backgroundImgSource}
          />
        </div>

        <div className="trip-card__info">
          <Row className="trip-card__flags">
            {uniqueBy(
              trip.destinations.map((destination) => destination.city.country),
              (country) => country.id,
            ).map((country) => (
              <CountryFlag
                className="trip-card__flag"
                countryId={country.id}
                key={country.id}
              />
            ))}
          </Row>
          <div className="trip-card__header">
            <h2 className="trip-card__title">{trip.name}</h2>
          </div>
          {trip?.sDate ? (
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

        <Button
          aria-label={isExpanded ? "Collapse cities" : "Expand cities"}
          className={`trip-card__toggle ${isExpanded ? "is-expanded" : ""}`}
        >
          <ChevronIcon className="trip-card__toggle-icon" />
        </Button>
      </div>

      <div className={`trip-card__details ${isExpanded ? "is-open" : ""}`}>
        <div className="trip-card__details-content">
          <div className="trip-card__details-inner">
            <div className="trip-card__cities" id="info-tab">
              {trip.destinations.map((destination, index) => (
                <Button
                  aria-label={`Open ${destination.city.getName(t)} gallery`}
                  className="trip-card__city"
                  key={destination.city.name}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(
                      `/gallery/${destination.city.name}/${destination.travelIdx}`,
                    );
                  }}
                  onMouseEnter={() => {
                    console.log("hover", destination.city.name);
                    setHoveredCity(destination.city);
                    if (
                      setMapPosition &&
                      destination.city.mapCoordinates &&
                      isAutoPosition
                    )
                      setMapPosition({
                        center: destination.city.mapCoordinates,
                        zoom: parameters.map.hoveredCityZoom,
                      });
                  }}
                  onMouseLeave={() => {
                    setHoveredCity(null);
                  }}
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

                    {destination.city.travels[destination.travelIdx]?.sDate ? (
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

                  <div aria-hidden className="trip-card__city-image-container">
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
        </div>
      </div>
    </div>
  );
}
