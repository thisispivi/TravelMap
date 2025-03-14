import "./TooltipMap.scss";
import { City } from "@/core";
import useLanguage from "@/hooks/language/language";
import { Button, CountryFlag } from "../../atoms";
import {
  ArrivalIcon,
  DepartureIcon,
  DoubleChevronIcon,
  GalleryIcon,
} from "@/assets";
import { memo, useEffect, useState, JSX } from "react";
import { formatDate } from "@/i18n/functions/date";

interface MapTooltipProps {
  city: City;
  onMouseEnter?: (city: City) => void;
  onMouseLeave?: () => void;
  setIsOpen: (isOpen: boolean) => void;
  onClick?: (travelIdx: number) => void;
}

/**
 * MapTooltip component
 *
 * The map tooltip component is used to display the tooltip of a city on the map.
 *
 * @component
 *
 * @param {MapTooltipProps} props - The props of the map tooltip
 * @param {City} props.city - The city to display
 * @param {(city: City) => void} [props.onMouseEnter] - The function to call when the mouse enter the tooltip
 * @param {() => void} [props.onMouseLeave] - The function to call when the mouse leave the tooltip
 * @param {boolean} [props.isOpen] - The visibility of the tooltip
 * @param {(isOpen: boolean) => void} props.setIsOpen - The function to set the visibility of the tooltip
 * @param {(travelIdx: number) => void} [props.onClick] - The function to call when the user click on the tooltip
 * @returns {JSX.Element} - The map tooltip
 */
function MapTooltip({
  city,
  onMouseEnter,
  onMouseLeave,
  setIsOpen,
  onClick,
}: MapTooltipProps): JSX.Element {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const [travelIdx, setTravelIdx] = useState(0);
  const filteredTravels = city.travels.filter((travel) => !travel.isFuture);
  const createBackdrop = (className: string) => (
    <div
      className={`map-tooltip__backdrop ${className}`}
      onMouseEnter={() => onMouseEnter && onMouseEnter(city)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
    />
  );

  useEffect(() => {
    const handleVisibilityChange = () => document.hidden && setIsOpen(false);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [setIsOpen]);

  return (
    <>
      {createBackdrop("map-tooltip__backdrop--top")}
      {createBackdrop("map-tooltip__backdrop--right")}
      {createBackdrop("map-tooltip__backdrop--bottom")}
      {createBackdrop("map-tooltip__backdrop--left")}
      <div
        className="map-tooltip__container"
        onMouseEnter={() => onMouseEnter && onMouseEnter(city)}
        onMouseLeave={() => onMouseLeave && onMouseLeave()}
      >
        <div className="map-tooltip__header">
          <h2>{city.getName(t)}</h2>
          <CountryFlag countryId={city.country.id} />
        </div>
        {filteredTravels[travelIdx] ? (
          <>
            <div className="map-tooltip__content">
              <DoubleChevronIcon
                className={`map-tooltip__content__chevron-icon map-tooltip__content__chevron-icon--left ${travelIdx > 0 ? "" : "map-tooltip__content__chevron-icon--disabled"}`}
                onClick={() => travelIdx > 0 && setTravelIdx(travelIdx - 1)}
              />

              <div className="map-tooltip__content__travel">
                <div className="map-tooltip__content__travel__info">
                  <DepartureIcon className="map-tooltip__content__travel__icon" />
                  <p>{formatDate(filteredTravels[travelIdx].sDate, lang)}</p>
                </div>
                <div className="map-tooltip__content__travel__info">
                  <ArrivalIcon className="map-tooltip__content__travel__icon" />
                  <p>{formatDate(filteredTravels[travelIdx].eDate, lang)}</p>
                </div>
              </div>
              <DoubleChevronIcon
                className={`map-tooltip__content__chevron-icon ${travelIdx < filteredTravels.length - 1 ? "" : "map-tooltip__content__chevron-icon--disabled"}`}
                onClick={() =>
                  travelIdx < filteredTravels.length - 1 &&
                  setTravelIdx(travelIdx + 1)
                }
              />
            </div>
            <div className="map-tooltip__footer">
              <Button
                className="map-tooltip__footer__button"
                onClick={() => {
                  console.log("travelIdx", travelIdx);
                  onClick?.(travelIdx);
                }}
              >
                <GalleryIcon />
                <p>{t("galleryAlt")}</p>
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

const MemoizedMapTooltip = memo(MapTooltip);
export default MemoizedMapTooltip;
