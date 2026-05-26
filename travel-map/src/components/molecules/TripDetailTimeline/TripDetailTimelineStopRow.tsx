import { m } from "framer-motion";
import { CSSProperties, JSX, use } from "react";
import {
  useLocation as useRouterLocation,
  useNavigate,
} from "react-router-dom";

import { MoonIcon } from "@/assets";
import { CountryFlag } from "@/components/atoms";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { City } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { classNames } from "@/utils/className";

interface TripDetailTimelineStopRowProps {
  city: City;
  travelIdx: number;
  nights: number;
  isLayover: boolean;
  animDelay: number;
  showYear: boolean;
}

export function TripDetailTimelineStopRow({
  city,
  travelIdx,
  nights,
  isLayover,
  animDelay,
  showYear,
}: TripDetailTimelineStopRowProps): JSX.Element {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { setHoveredCity } = use(HomeContext)!;

  const travel = city.travels[travelIdx];
  const thumbSrc = city.getBackgroundImgSourceByIndex(travelIdx);
  const hasPhotos = Boolean(!isLayover && travel && travel.photos.length > 0);
  const cityLabel = t(`cities.${city.name}`) || city.name;

  return (
    <m.div
      animate={{ opacity: 1, x: 0 }}
      className={classNames(
        "trip-detail__row trip-detail__row--stop",
        isLayover && "trip-detail__row--layover",
      )}
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
        <div
          className={classNames(
            "trip-detail__dot",
            isLayover && "trip-detail__dot--layover",
          )}
        />
      </div>

      <div
        className={classNames(
          "trip-detail__stop-card",
          hasPhotos && "trip-detail__stop-card--clickable",
          isLayover && "trip-detail__stop-card--layover",
        )}
        onClick={
          hasPhotos
            ? () =>
                navigate(`/gallery/${city.name}/${travelIdx}`, {
                  state: {
                    fromPath: `${routerLocation.pathname}${routerLocation.search}`,
                  },
                })
            : undefined
        }
        onMouseEnter={!isLayover ? () => setHoveredCity(city) : undefined}
        onMouseLeave={!isLayover ? () => setHoveredCity(null) : undefined}
        {...(hasPhotos ? { role: "button" as const, tabIndex: 0 } : {})}
      >
        {!isLayover ? (
          <div className="trip-detail__stop-thumb">
            {thumbSrc ? (
              <img
                alt={cityLabel}
                className="trip-detail__stop-thumb-img"
                src={thumbSrc}
              />
            ) : (
              <div className="trip-detail__stop-thumb-empty" />
            )}
          </div>
        ) : null}

        <div className="trip-detail__stop-info">
          <div className="trip-detail__stop-top">
            <span className="trip-detail__stop-name">{cityLabel}</span>
            <CountryFlag
              className="trip-detail__stop-flag"
              countryId={city.country.id}
            />
            {isLayover ? (
              <span className="trip-detail__layover-label">
                {t("tripDetail.layover") || "Transit"}
              </span>
            ) : null}
          </div>
          {!isLayover && travel ? (
            <span className="trip-detail__stop-dates">
              {formatDateRangeShort({
                sDateInput: travel.sDate,
                eDateInput: travel.eDate,
                locale: lang,
                showYear,
              })}
            </span>
          ) : null}
        </div>

        {!isLayover && nights > 0 ? (
          <span className="trip-detail__stop-nights">
            <MoonIcon className="trip-detail__stop-nights-icon" />
            {nights}
          </span>
        ) : null}
      </div>
    </m.div>
  );
}
