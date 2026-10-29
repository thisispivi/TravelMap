import "./MapTooltip.scss";

import { City } from "@travelmap/core";
import { Clock, Coins, Images, Users } from "lucide-react";
import { ReactNode, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";

import { placeAlbum } from "@/data/albums";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { CoverImage } from "@/shared/components/CoverImage/CoverImage";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { getTimeZoneAbbreviation } from "@/shared/lib/timezone";

/**
 * Properties accepted by the MapTooltip component.
 * @property {City} city - The city the card describes
 * @property {() => void} onClose - Closes the card
 * @property {(city: City | null) => void} onHoverCity - Keeps the card open while the pointer is over it
 */
interface MapTooltipProps {
  city: City;
  onClose: () => void;
  onHoverCity: (city: City | null) => void;
}

/**
 * MapTooltip component
 * The card a map marker opens: the city's picture and name, its population,
 * time zone and currency, and a link to its photos when there are any. It
 * closes when the window loses focus, so it never lingers behind another app.
 * @component
 * @param {MapTooltipProps} props - The tooltip props
 * @param {City} props.city - The city the card describes
 * @param {() => void} props.onClose - Closes the card
 * @param {(city: City | null) => void} props.onHoverCity - Keeps the card open while hovered
 * @returns {ReactNode} The city card
 */
export function MapTooltip({
  city,
  onClose,
  onHoverCity,
}: MapTooltipProps): ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, currLanguage } = useLanguage(["home"]);
  const onCloseRef = useRef(onClose);
  const photoCount = placeAlbum(city).count;
  const timeZone = getTimeZoneAbbreviation(city.timeZone);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    /**
     * Closes the card through the latest close callback.
     * @returns {void}
     */
    const handleClose = (): void => onCloseRef.current();

    /**
     * Closes the card when the page is hidden.
     * @returns {void}
     */
    const handleVisibilityChange = (): void => {
      if (document.hidden) handleClose();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleClose);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleClose);
    };
  }, []);

  return (
    <div
      className="map-tooltip__card"
      onMouseEnter={() => onHoverCity(city)}
      onMouseLeave={() => onHoverCity(null)}
    >
      <CoverImage
        className="map-tooltip__image"
        src={city.getBackgroundImgSourceByIndex(0)}
      />
      <div className="map-tooltip__body">
        <h2 className="map-tooltip__title">
          {city.getLocalizedName(currLanguage)}
          <CountryFlag
            className="map-tooltip__flag"
            countryId={city.country.id}
          />
        </h2>
        <ul className="map-tooltip__facts">
          {city.population ? (
            <li className="map-tooltip__fact">
              <Users aria-hidden="true" className="map-tooltip__fact-icon" />
              {city.population.toLocaleString(currLanguage)}
            </li>
          ) : null}
          {timeZone ? (
            <li className="map-tooltip__fact">
              <Clock aria-hidden="true" className="map-tooltip__fact-icon" />
              {timeZone}
            </li>
          ) : null}
          {city.country.currency ? (
            <li className="map-tooltip__fact">
              <Coins aria-hidden="true" className="map-tooltip__fact-icon" />
              {t(`currency.${city.country.currency}.symbol`, {
                defaultValue: "",
              })}{" "}
              {city.country.currency}
            </li>
          ) : null}
        </ul>
        {photoCount > 0 ? (
          <button
            className="map-tooltip__photos"
            onClick={() => {
              onClose();
              navigate(`/gallery/place/${encodeURIComponent(city.id)}`, {
                state: { fromPath: location.pathname },
              });
            }}
            type="button"
          >
            <Images aria-hidden="true" className="map-tooltip__photos-icon" />
            {t("places.photos", { count: photoCount })}
          </button>
        ) : null}
      </div>
    </div>
  );
}
