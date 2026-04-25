import "./TooltipMap.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CalendarIcon,
  CoinIcon,
  DoubleChevronIcon,
  GalleryIcon,
  PeopleIcon,
} from "@/assets";
import { City } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { formatDateRangeShort } from "@/i18n/functions/date";

import { Button, CountryFlag } from "../../atoms";

interface MapTooltipProps {
  city: City;
  onMouseEnter?: (city: City) => void;
  onMouseLeave?: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

const tooltipVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { type: "tween", duration: 0.18, ease: [0.4, 0, 0.2, 1] },
  },
} as const;

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
 * @returns {JSX.Element} - The map tooltip
 */
export function MapTooltip({
  city,
  onMouseEnter,
  onMouseLeave,
  setIsOpen,
}: MapTooltipProps): JSX.Element {
  const navigate = useNavigate();
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
    const closeTooltip = () => setIsOpen(false);
    const handleVisibilityChange = () => document.hidden && closeTooltip();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", closeTooltip);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", closeTooltip);
    };
  }, [setIsOpen]);

  return (
    <LazyMotion features={domAnimation}>
      <>
        {createBackdrop("map-tooltip__backdrop--top")}
        {createBackdrop("map-tooltip__backdrop--right")}
        {createBackdrop("map-tooltip__backdrop--bottom")}
        {createBackdrop("map-tooltip__backdrop--left")}
        <m.div
          animate="visible"
          className="map-tooltip__container"
          initial="hidden"
          onMouseEnter={() => onMouseEnter && onMouseEnter(city)}
          onMouseLeave={() => onMouseLeave && onMouseLeave()}
          variants={tooltipVariants}
        >
          <div className="map-tooltip__header">
            <h2>{city.getName(t)}</h2>
            <CountryFlag countryId={city.country.id} />
          </div>
          <div className="map-tooltip__metadata">
            <div className="map-tooltip__metadata__item">
              <PeopleIcon className="map-tooltip__metadata__icon" />
              {city.population ? city.population.toLocaleString(lang) : "-"}
            </div>
            <div className="map-tooltip__metadata__item">
              <CoinIcon className="map-tooltip__metadata__icon" />
              <p className="currency-row__name">
                {t(`currency.${city.country.currency}.name`)}
              </p>
              <b className="currency-row__symbol">
                {" " + t(`currency.${city.country.currency}.symbol`)}
              </b>
            </div>
          </div>
          {filteredTravels[travelIdx] ? (
            <div className="map-tooltip__divider">
              <div className="map-tooltip__content">
                <div className="map-tooltip__content__travels">
                  <b className="map-tooltip__content__travels__title">
                    {t("selectedTravel")} {travelIdx + 1} /{" "}
                    {filteredTravels.length}
                  </b>
                  <div className="map-tooltip__content__travels__selector">
                    <DoubleChevronIcon
                      className={`map-tooltip__content__chevron-icon map-tooltip__content__chevron-icon--left ${travelIdx > 0 ? "" : "map-tooltip__content__chevron-icon--disabled"}`}
                      onClick={() =>
                        setTravelIdx((prev) => (prev > 0 ? prev - 1 : prev))
                      }
                    />
                    <div className="map-tooltip__content__travel">
                      <CalendarIcon className="map-tooltip__content__travel__icon" />
                      <p>
                        {formatDateRangeShort({
                          sDateInput: filteredTravels[travelIdx].sDate,
                          eDateInput: filteredTravels[travelIdx].eDate,
                          locale: lang,
                          includeWeekday: true,
                          showYear: true,
                        })}
                      </p>
                    </div>
                    <DoubleChevronIcon
                      className={`map-tooltip__content__chevron-icon ${travelIdx < filteredTravels.length - 1 ? "" : "map-tooltip__content__chevron-icon--disabled"}`}
                      onClick={() =>
                        setTravelIdx((prev) =>
                          prev < filteredTravels.length - 1 ? prev + 1 : prev,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              {filteredTravels[travelIdx].photos &&
              filteredTravels[travelIdx].photos.length > 0 ? (
                <div className="map-tooltip__footer">
                  <Button
                    className="map-tooltip__footer__button"
                    hoverScale={1}
                    onClick={() =>
                      navigate(`/gallery/${city.name}/${travelIdx}?from=map`)
                    }
                  >
                    <GalleryIcon />
                    <p>{t("galleryAlt")}</p>
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </m.div>
      </>
    </LazyMotion>
  );
}
