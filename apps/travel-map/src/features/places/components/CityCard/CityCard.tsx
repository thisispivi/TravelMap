import "./CityCard.scss";

import { City } from "@travelmap/core";
import { MouseEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import PositionIcon from "@/assets/icons/Position.svg?react";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { Loading } from "@/shared/components/Loading/Loading";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";
import { isActivationKey } from "@/shared/lib/keyboard";
import { parameters } from "@/shared/lib/parameters";

import { useCachedImageSource } from "../../lib/useImageCache";

/* The grid shows one plate per place, so it always opens on the first travel
   with photos; the gallery's own selector moves between later visits. */
const FIRST_TRAVEL_INDEX = 0;

/**
 * Properties accepted by the CityCard component.
 * @property {City} city - The city to display
 * @property {boolean} [isClickable] - Whether the card opens the city's gallery
 * @property {boolean} [isReturned] - Whether the place was stayed in more than once
 * @property {(city: City | null) => void} setHoveredCity - Highlights the city's map marker
 * @property {(position: { center: [number, number]; zoom: number }) => void} [setMapPosition] - Centers the map on the city
 */
interface CityCardProps {
  city: City;
  isClickable?: boolean;
  isReturned?: boolean;
  setHoveredCity: (city: City | null) => void;
  setMapPosition?: (position: {
    center: [number, number];
    zoom: number;
  }) => void;
}

/**
 * CityCard component
 * A photo plate representing one place. Lazily loads its background through an
 * IntersectionObserver and caches it with the service worker, highlights the
 * matching map marker on hover, and opens the place's gallery when clickable.
 * @component
 * @param {CityCardProps} props - The city card props
 * @param {City} props.city - The city to display
 * @param {boolean} [props.isClickable=false] - Whether clicking opens the gallery
 * @param {boolean} [props.isReturned=false] - Whether to give the place a wider plate
 * @param {(city: City | null) => void} props.setHoveredCity - Highlights the city on the map
 * @param {(position: { center: [number, number]; zoom: number }) => void} [props.setMapPosition] - Centers the map on the city
 * @returns {ReactNode} The city card
 */
export function CityCard({
  city,
  isClickable = false,
  isReturned = false,
  setHoveredCity,
  setMapPosition,
}: CityCardProps): ReactNode {
  const lang = useLanguage([]).currLanguage;
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage(["home"]);
  const cityName = city.getLocalizedName(lang);
  const cardRef = useRef<HTMLDivElement>(null);
  const [shouldLoadImage, setShouldLoadImage] = useState(
    () => typeof window !== "undefined" && !("IntersectionObserver" in window),
  );
  const backgroundSource =
    city.getBackgroundImgSourceByIndex(FIRST_TRAVEL_INDEX);
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

  /**
   * Highlights the corresponding city marker when the card is hovered.
   * @returns {void}
   */
  const handleMouseEnter = (): void => {
    setHoveredCity(city);
  };

  /**
   * Clears the corresponding city marker highlight.
   * @returns {void}
   */
  const handleMouseLeave = (): void => {
    setHoveredCity(null);
  };

  /**
   * Centers the map on the card's city without opening the gallery.
   * @param {MouseEvent} event - The center-map button event
   * @returns {void}
   */
  const handleCenterMap = (event: MouseEvent): void => {
    event.stopPropagation();
    if (setMapPosition) {
      setMapPosition({
        center: city.coordinates,
        zoom: parameters.map.hoveredCityZoom,
      });
      setHoveredCity(city);
    }
  };

  /**
   * Opens gallery.
   * @returns {void}
   */
  const openGallery = () => {
    navigate(`/gallery/${city.name}/${FIRST_TRAVEL_INDEX}`, {
      state: { fromPath: `${location.pathname}${location.search}` },
    });
  };
  return (
    <div
      className={classNames(
        "city-card",
        isClickable && "city-card--clickable",
        isReturned && "city-card--returned",
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
      <div className="city-card__background">
        {cachedBackgroundSource ? (
          <img
            alt={cityName}
            className="city-card__background-img"
            src={cachedBackgroundSource}
          />
        ) : (
          <div className="city-card__loading">
            <Loading />
          </div>
        )}
        <div className="city-card__background-overlay" />
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

        <h2 className="city-card__name">{cityName}</h2>
      </div>

      <span aria-hidden className="city-card__edge" />
    </div>
  );
}
