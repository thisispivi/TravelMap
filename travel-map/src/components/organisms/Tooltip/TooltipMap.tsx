import "./TooltipMap.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { JSX, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { CoinIcon, GalleryIcon, PeopleIcon, TimezoneIcon } from "@/assets";
import { City } from "@/core";
import { visitedTrips } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { getCityTravels } from "@/utils/trips";

import { Button, CountryFlag } from "../../atoms";

interface MapTooltipProps {
  city: City;
  onMouseEnter?: (city: City) => void;
  onMouseLeave?: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

interface TooltipBackdropProps {
  side: "top" | "right" | "bottom" | "left";
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const tooltipVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { type: "tween", duration: 0.18, ease: [0.4, 0, 0.2, 1] },
  },
} as const;

const TOOLTIP_BACKDROP_SIDES: TooltipBackdropProps["side"][] = [
  "top",
  "right",
  "bottom",
  "left",
];

function TooltipBackdrop({
  side,
  onMouseEnter,
  onMouseLeave,
}: TooltipBackdropProps) {
  return (
    <div
      className={`map-tooltip__backdrop map-tooltip__backdrop--${side}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
}

function getTzAbbr(timeZone: string | undefined): string | null {
  if (!timeZone) return null;
  try {
    return (
      new Intl.DateTimeFormat("en", { timeZone, timeZoneName: "short" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value ?? null
    );
  } catch {
    return null;
  }
}

/**
 * MapTooltip component
 *
 * Displays city name, flag, population, timezone, and gallery access from a map marker.
 *
 * @component
 */
export function MapTooltip({
  city,
  onMouseEnter,
  onMouseLeave,
  setIsOpen,
}: MapTooltipProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, currLanguage: lang } = useLanguage(["home"]);

  const handleEnter = () => onMouseEnter?.(city);
  const handleLeave = () => onMouseLeave?.();

  const allTravels = getCityTravels(city, visitedTrips).filter(
    (tr) => !tr.isFuture,
  );
  const firstPhotosTravelIdx = allTravels.findIndex(
    (tr) => tr.photos && tr.photos.length > 0,
  );
  const hasPhotos = firstPhotosTravelIdx >= 0;
  const tzAbbr = getTzAbbr(city.timeZone);

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
        {TOOLTIP_BACKDROP_SIDES.map((side) => (
          <TooltipBackdrop
            key={side}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            side={side}
          />
        ))}
        <m.div
          animate="visible"
          className="map-tooltip__container"
          initial="hidden"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          variants={tooltipVariants}
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
            {tzAbbr ? (
              <span className="map-tooltip__pill">
                <TimezoneIcon className="map-tooltip__pill-icon" />
                {tzAbbr}
              </span>
            ) : null}
            {city.country.currency ? (
              <span className="map-tooltip__pill">
                <CoinIcon className="map-tooltip__pill-icon" />
                {city.country.currency}
              </span>
            ) : null}
          </div>

          {hasPhotos ? (
            <div className="map-tooltip__footer">
              <Button
                className="map-tooltip__footer__button"
                hoverScale={1}
                onClick={() =>
                  navigate(`/gallery/${city.name}/${firstPhotosTravelIdx}`, {
                    state: {
                      fromPath: `${location.pathname}${location.search}`,
                    },
                  })
                }
              >
                <GalleryIcon />
                <p>{t("galleryAlt")}</p>
              </Button>
            </div>
          ) : null}
        </m.div>
      </>
    </LazyMotion>
  );
}
