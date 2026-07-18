import "./CityCard.scss";

import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CalendarIcon from "@/assets/icons/Calendar.svg?react";
import PositionIcon from "@/assets/icons/Position.svg?react";
import { CountryFlag } from "@/components/atoms/CountryFlag/CountryFlag";
import { Loading } from "@/components/atoms/Loading/Loading";
import { City, Travel } from "@/core";
import { useCachedImageSource } from "@/hooks/image/cache";
import { useLanguage } from "@/hooks/language/language";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { classNames } from "@/utils/className";
import { isActivationKey } from "@/utils/keyboard";
import { computeMapCenter } from "@/utils/mapCenter";
import { parameters } from "@/utils/parameters";

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
/**
 * CityCard component
 *
 * A photo card representing a single city visit. Lazily loads the background
 * image via an IntersectionObserver and caches it using the service worker.
 * Highlights the corresponding map marker on hover and, when clickable,
 * navigates to the photo gallery for that travel.
 *
 * @component
 *
 * @param {CityCardProps} props
 * @param {string} [props.className] - Additional class names
 * @param {City} props.city - The city to display
 * @param {Travel} [props.travel] - The specific travel entry to show dates for
 * @param {number} [props.travelIdx] - Visit index used for the background image
 * @param {boolean} [props.isClickable] - Whether clicking opens the gallery
 * @param {(city: City | null) => void} props.setHoveredCity - Highlights the city on the map
 * @param {(position: { center: [number, number]; zoom: number }) => void} [props.setMapPosition] - Centers the map on the city
 * @param {boolean} [props.isHidden] - Hides the card (CSS only, keeps it in the DOM)
 * @param {boolean} [props.showDates] - Whether to show the travel date range
 * @returns {ReactNode} The city card
 */
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
}: CityCardProps): ReactNode {
  const lang = useLanguage([]).currLanguage;
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage(["home"]);
  const cityName = city.getName(t);
  const cardRef = useRef<HTMLDivElement>(null);
  const [shouldLoadImage, setShouldLoadImage] = useState(
    () => typeof window !== "undefined" && !("IntersectionObserver" in window),
  );
  const backgroundSource = city.getBackgroundImgSourceByIndex(travelIdx);
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
  const handleMouseEnter = () => {
    setHoveredCity(city);
  };
  const handleMouseLeave = () => {
    setHoveredCity(null);
  };
  const handleCenterMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (setMapPosition) {
      setMapPosition({
        center: computeMapCenter(
          city.coordinates,
          parameters.map.hoveredCityZoom,
        ),
        zoom: parameters.map.hoveredCityZoom,
      });
      setHoveredCity(city);
    }
  };
  const openGallery = () => {
    navigate(`/gallery/${city.name}/${travelIdx}`, {
      state: { fromPath: `${location.pathname}${location.search}` },
    });
  };
  return (
    <div
      className={classNames(
        "city-card",
        isClickable ? "city-card--clickable" : "city-card--not-clickable",
        isHidden ? "city-card--hidden" : "city-card--visible",
      )}
      ref={cardRef}
      {...(isClickable
        ? {
            onClick: openGallery,
            onKeyDown: (event) => isActivationKey(event) && openGallery(),
            role: "button" as const,
            tabIndex: 0,
          }
        : {})}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={classNames(
          "city-card__top",
          className,
          city.name,
          `${city.name}-${travelIdx}`,
        )}
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

        {setMapPosition ? (
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
