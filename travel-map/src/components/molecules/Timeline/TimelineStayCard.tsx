import "./TimelineStayCard.scss";

import { m } from "framer-motion";
import { CSSProperties, JSX, use } from "react";
import {
  useLocation as useRouterLocation,
  useNavigate,
} from "react-router-dom";

import { CountryFlag } from "@/components/atoms";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { City, TripStop } from "@/core";
import { visitedTrips } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { classNames } from "@/utils/className";
import { getPhotoTravelIndex } from "@/utils/trips";

interface TimelineStayCardProps {
  city: City;
  travelIdx: number;
  stop: TripStop;
  nights: number;
  animDelay: number;
  showYear: boolean;
}

export function TimelineStayCard({
  city,
  travelIdx,
  stop,
  nights,
  animDelay,
  showYear,
}: TimelineStayCardProps): JSX.Element {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { setHoveredCity } = use(HomeContext)!;

  const galleryTravelIdx = getPhotoTravelIndex(city, stop.sDate, visitedTrips);
  const hasPhotos = galleryTravelIdx >= 0;
  const thumbSrc = city.getBackgroundImgSourceByIndex(
    hasPhotos ? galleryTravelIdx : travelIdx,
  );
  const cityLabel = t(`cities.${city.name}`) || city.name;

  const dateRange = formatDateRangeShort({
    sDateInput: stop.sDate,
    eDateInput: stop.eDate,
    locale: lang,
    showYear,
  });
  const nightsLabel =
    nights === 1 ? t("tripDetail.night") : t("tripDetail.nights");

  return (
    <m.div
      animate={{ opacity: 1, x: 0 }}
      className="trip-detail__row trip-detail__row--stay"
      initial={{ opacity: 0, x: -8 }}
      style={
        {
          "--dot-color": city.country.borderColor,
          "--dot-color-faint": city.country.fillColor,
        } as CSSProperties
      }
      transition={{
        delay: animDelay,
        duration: 0.18,
        ease: [0.35, 0, 0.25, 1],
      }}
    >
      <div className="trip-detail__track">
        <div className="trip-detail__stay-dot" />
      </div>

      <div
        className={classNames(
          "trip-detail__stay-card",
          hasPhotos && "trip-detail__stay-card--clickable",
        )}
        onClick={
          hasPhotos
            ? () =>
                navigate(`/gallery/${city.name}/${galleryTravelIdx}`, {
                  state: {
                    fromPath: `${routerLocation.pathname}${routerLocation.search}`,
                  },
                })
            : undefined
        }
        onMouseEnter={() => setHoveredCity(city)}
        onMouseLeave={() => setHoveredCity(null)}
        {...(hasPhotos ? { role: "button" as const, tabIndex: 0 } : {})}
      >
        <div className="trip-detail__stay-thumb">
          {thumbSrc ? (
            <img
              alt={cityLabel}
              className="trip-detail__stay-thumb-img"
              src={thumbSrc}
            />
          ) : (
            <div className="trip-detail__stay-thumb-empty" />
          )}
        </div>

        <div className="trip-detail__stay-body">
          <div className="trip-detail__stay-header">
            <span className="trip-detail__stay-name">{cityLabel}</span>
            <CountryFlag
              className="trip-detail__stay-flag"
              countryId={city.country.id}
            />
          </div>
          <span className="trip-detail__stay-meta">
            <span className="trip-detail__stay-date">{dateRange}</span>
          </span>
        </div>

        {/* Nights pill — right side of card */}
        {nights > 0 ? (
          <div className="trip-detail__stay-nights-pill">
            {nights} {nightsLabel}
          </div>
        ) : null}
      </div>
    </m.div>
  );
}
