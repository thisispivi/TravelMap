import "./TooltipMap.scss";

import { ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CoinIcon from "@/assets/icons/Coin.svg?react";
import GalleryIcon from "@/assets/icons/Gallery.svg?react";
import PeopleIcon from "@/assets/icons/People.svg?react";
import TimezoneIcon from "@/assets/icons/Timezone.svg?react";
import { City } from "@/core";
import { visitedTrips } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { getTimeZoneAbbreviation } from "@/utils/timezone";
import { getCityTravels } from "@/utils/trips";

import { Button } from "../../atoms/Buttons/Button";
import { CountryFlag } from "../../atoms/CountryFlag/CountryFlag";

interface MapTooltipProps {
  city: City;
  onClose: () => void;
  onHoverCity: (city: City | null) => void;
}

/**
 * MapTooltip component
 *
 * Displays city name, flag, population, timezone, currency and gallery access
 * from a map marker.
 *
 * @component
 * @param {MapTooltipProps} props
 * @param {City} props.city - The city the marker points at
 * @returns {ReactNode} The tooltip content
 */
export function MapTooltip({
  city,
  onClose,
  onHoverCity,
}: MapTooltipProps): ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, currLanguage: lang } = useLanguage(["home"]);

  const travels = getCityTravels(city, visitedTrips).filter(
    (travel) => !travel.isFuture,
  );
  const galleryIndex = travels.findIndex(
    (travel) => travel.photos && travel.photos.length > 0,
  );
  const timeZone = getTimeZoneAbbreviation(city.timeZone);

  useEffect(() => {
    const handleVisibilityChange = () => document.hidden && onClose();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", onClose);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", onClose);
    };
  }, [onClose]);

  return (
    <div
      className="map-tooltip__container"
      onMouseEnter={() => onHoverCity(city)}
      onMouseLeave={() => onHoverCity(null)}
    >
      <div className="map-tooltip__header">
        <h2>{city.getName(t)}</h2>
        <CountryFlag countryId={city.country.id} />
      </div>

      <div className="map-tooltip__pills">
        {city.population ? (
          <span className="map-tooltip__pill">
            <PeopleIcon className="map-tooltip__pill-icon" />
            {city.population.toLocaleString(lang)}
          </span>
        ) : null}
        {timeZone ? (
          <span className="map-tooltip__pill">
            <TimezoneIcon className="map-tooltip__pill-icon" />
            {timeZone}
          </span>
        ) : null}
        {city.country.currency ? (
          <span className="map-tooltip__pill">
            <CoinIcon className="map-tooltip__pill-icon" />
            {city.country.currency}
          </span>
        ) : null}
      </div>

      {galleryIndex >= 0 ? (
        <div className="map-tooltip__footer">
          <Button
            className="map-tooltip__footer__button"
            hoverScale={1}
            onClick={() => {
              onClose();
              navigate(`/gallery/${city.name}/${galleryIndex}`, {
                state: { fromPath: `${location.pathname}${location.search}` },
              });
            }}
          >
            <GalleryIcon />
            <p>{t("galleryAlt")}</p>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
