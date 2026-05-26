import { m } from "framer-motion";
import { CSSProperties, JSX, use } from "react";
import {
  useLocation as useRouterLocation,
  useNavigate,
} from "react-router-dom";

import { CountryFlag } from "@/components/atoms";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { City } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { classNames } from "@/utils/className";

interface TripDetailTimelineDayTripRowProps {
  city: City;
  travelIdx: number;
  animDelay: number;
  showYear: boolean;
  isNested: boolean;
}

export function TripDetailTimelineDayTripRow({
  city,
  travelIdx,
  animDelay,
  showYear,
  isNested,
}: TripDetailTimelineDayTripRowProps): JSX.Element {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { setHoveredCity } = use(HomeContext)!;

  const travel = city.travels[travelIdx];
  const hasPhotos = Boolean(travel && travel.photos.length > 0);
  const fallbackTravelIdx = !hasPhotos
    ? city.travels.findIndex((tr) => tr.photos.length > 0)
    : -1;
  const isClickable = hasPhotos || fallbackTravelIdx >= 0;
  const galleryTravelIdx = hasPhotos ? travelIdx : fallbackTravelIdx;
  const thumbSrc = city.getBackgroundImgSourceByIndex(travelIdx);
  const cityLabel = t(`cities.${city.name}`) || city.name;

  return (
    <m.div
      animate={{ opacity: 1, x: 0 }}
      className="trip-detail__row trip-detail__row--day-trip"
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
        <div className="trip-detail__dot trip-detail__dot--day-trip" />
      </div>

      <div
        className={classNames(
          "trip-detail__day-trip-card",
          isClickable && "trip-detail__day-trip-card--clickable",
          isNested && "trip-detail__day-trip-card--nested",
        )}
        onClick={
          isClickable
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
        {...(isClickable ? { role: "button" as const, tabIndex: 0 } : {})}
      >
        <div className="trip-detail__day-trip-thumb">
          {thumbSrc ? (
            <img
              alt={cityLabel}
              className="trip-detail__day-trip-thumb-img"
              src={thumbSrc}
            />
          ) : (
            <div className="trip-detail__day-trip-thumb-empty" />
          )}
        </div>
        <div className="trip-detail__day-trip-info">
          <span className="trip-detail__day-trip-name">{cityLabel}</span>
          <CountryFlag
            className="trip-detail__day-trip-flag"
            countryId={city.country.id}
          />
        </div>
        {travel ? (
          <span className="trip-detail__day-trip-date">
            {formatDateRangeShort({
              sDateInput: travel.sDate,
              eDateInput: travel.eDate,
              locale: lang,
              showYear,
            })}
          </span>
        ) : null}
      </div>
    </m.div>
  );
}
