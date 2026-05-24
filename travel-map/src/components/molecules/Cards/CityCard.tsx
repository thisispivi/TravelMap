import "./CityCard.scss";

import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PositionIcon } from "@/assets";
import { useCachedImageSource } from "@/hooks/image/cache";
import { formatDateRangeShort } from "@/i18n/functions/date";

import { CalendarIcon } from "../../../assets";
import { City, Travel } from "../../../core";
import { useLanguage } from "../../../hooks/language/language";
import { parameters } from "../../../utils/parameters";
import { CountryFlag, Loading } from "../../atoms";

interface CityCardProps {
  className?: string;
  city: City;
  travel?: Travel;
  travelIdx?: number;
  isClickable?: boolean;
  setHoveredCity: (city: City | null) => void;
  setMapPosition?: (position: {
    center: [number, number];
    zoom: number;
  }) => void;
  isHidden?: boolean;
  showDates?: boolean;
}

export function CityCard({
  className = "",
  city,
  travel,
  travelIdx = 0,
  isClickable = false,
  setHoveredCity,
  setMapPosition,
  isHidden = false,
  showDates = true,
}: CityCardProps): JSX.Element {
  const lang = useLanguage([]).currLanguage;
  const navigate = useNavigate();
  const { t } = useLanguage(["home"]);
  const cityName = city.getName(t);
  const cardRef = useRef<HTMLDivElement>(null);
  const [shouldLoadImage, setShouldLoadImage] = useState(
    () => typeof window !== "undefined" && !("IntersectionObserver" in window),
  );
  const backgroundSource = useMemo(
    () => city.getBackgroundImgSourceByIndex(travelIdx),
    [city, travelIdx],
  );
  const cachedBackgroundSource = useCachedImageSource(
    backgroundSource,
    shouldLoadImage,
  );

  useEffect(() => {
    if (shouldLoadImage) return;

    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoadImage(true);
        observer.disconnect();
      },
      { rootMargin: "25%" },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [shouldLoadImage]);

  const handleMouseEnter = useCallback(() => {
    setHoveredCity(city);
  }, [city, setHoveredCity]);

  const handleMouseLeave = useCallback(() => {
    setHoveredCity(null);
  }, [setHoveredCity]);

  const handleCenterMap = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (setMapPosition && city.mapCoordinates) {
        setMapPosition({
          center: city.mapCoordinates,
          zoom: parameters.map.hoveredCityZoom,
        });
        setHoveredCity(city);
      }
    },
    [city, setMapPosition, setHoveredCity],
  );

  return (
    <div
      className={`city-card ${isClickable ? "city-card--clickable" : "city-card--not-clickable"} ${isHidden ? "city-card--hidden" : "city-card--visible"}`}
      ref={cardRef}
      {...(isClickable
        ? {
            onClick: () => navigate(`/gallery/${city.name}/${travelIdx}`),
            onKeyDown: (e) =>
              (e.key === "Enter" || e.key === " ") &&
              navigate(`/gallery/${city.name}/${travelIdx}`),
            role: "button" as const,
            tabIndex: 0,
          }
        : {})}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`city-card__top ${className} ${city.name} ${city.name}-${travelIdx}`}
      >
        <div className="city-card__background">
          <div className="city-card__background-overlay" />
          {cachedBackgroundSource ? (
            <img
              alt={cityName}
              className="city-card__background-img"
              src={cachedBackgroundSource}
            />
          ) : (
            <div className="centered">
              <Loading />
            </div>
          )}
        </div>
      </div>

      <div className="city-card__content">
        <CountryFlag
          className="city-card__country"
          countryId={city.country.id}
        />

        {setMapPosition && city.mapCoordinates ? (
          <button
            aria-label={t("places.centerMap", { city: cityName })}
            className="city-card__center-btn"
            data-tooltip-content={t("places.centerMap", { city: cityName })}
            data-tooltip-id="base-tooltip"
            onClick={handleCenterMap}
            type="button"
          >
            <PositionIcon className="city-card__center-icon" />
          </button>
        ) : null}

        <div className="city-card__title">
          <h2>{cityName}</h2>
        </div>
        {showDates && travel?.sDate ? (
          <div className="travel-card__info">
            <CalendarIcon className="travel-card__icon" />
            <p>
              {formatDateRangeShort({
                sDateInput: travel.sDate,
                eDateInput: travel.eDate,
                locale: lang,
                includeWeekday: true,
                showYear: false,
              })}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
