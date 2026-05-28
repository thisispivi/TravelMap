import "./TimelineStayGroup.scss";

import { m } from "framer-motion";
import { CSSProperties, JSX, use } from "react";
import {
  useLocation as useRouterLocation,
  useNavigate,
} from "react-router-dom";

import { AirplaneIcon, BusIcon, CarIcon, FerryIcon, TrainIcon } from "@/assets";
import { CountryFlag } from "@/components/atoms";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { City, TransportMode, TripStop } from "@/core";
import { visitedTrips } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { classNames } from "@/utils/className";
import { formatMileage } from "@/utils/format";
import { formatTripDetailDuration } from "@/utils/tripDetailTimeline";
import { getPhotoTravelIndex } from "@/utils/trips";

/** A single excursion (nested day trip) to be rendered under a stay group. */
export interface ExcursionItem {
  city: City;
  travelIdx: number;
  stop: TripStop;
  key: string;
  inboundTransport?: {
    mode: TransportMode;
    distanceKm: number;
    durationMinutes: number;
  };
}

interface TimelineStayGroupProps {
  city: City;
  travelIdx: number;
  stop: TripStop;
  nights: number;
  excursions: ExcursionItem[];
  animDelay: number;
  showYear: boolean;
}

function ModeIcon({
  mode,
  className,
}: {
  mode: TransportMode;
  className?: string;
}) {
  if (mode === "plane") return <AirplaneIcon className={className} />;
  if (mode === "ferry") return <FerryIcon className={className} />;
  if (mode === "bus") return <BusIcon className={className} />;
  if (mode === "train") return <TrainIcon className={className} />;
  if (mode === "car") return <CarIcon className={className} />;
  return null;
}

/**
 * Renders a base-city stay card together with its nested excursion rows.
 * Excursions are connected to the stay via a vertical branch line drawn
 * entirely in CSS (no extending past the last tick).
 */
export function TimelineStayGroup({
  city,
  travelIdx,
  stop,
  nights,
  excursions,
  animDelay,
  showYear,
}: TimelineStayGroupProps): JSX.Element {
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
      className="trip-detail__row trip-detail__row--stay-group"
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

      <div className="stay-group__content">
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

          {nights > 0 ? (
            <div className="trip-detail__stay-nights-pill">
              {nights} {nightsLabel}
            </div>
          ) : null}
        </div>

        {excursions.length > 0 ? (
          <div className="stay-group__excursions">
            {excursions.map((exc) => {
              const excLabel = t(`cities.${exc.city.name}`) || exc.city.name;
              const excGalleryIdx = getPhotoTravelIndex(
                exc.city,
                exc.stop.sDate,
                visitedTrips,
              );
              const excHasPhotos = excGalleryIdx >= 0;
              const excThumbSrc = exc.city.getBackgroundImgSourceByIndex(
                excHasPhotos ? excGalleryIdx : exc.travelIdx,
              );
              const excDate = formatDateRangeShort({
                sDateInput: exc.stop.sDate,
                eDateInput: exc.stop.eDate,
                locale: lang,
                showYear: false,
              });
              const tp = exc.inboundTransport ?? null;

              return (
                <div
                  className={classNames(
                    "stay-group__excursion",
                    excHasPhotos && "stay-group__excursion--clickable",
                  )}
                  key={exc.key}
                  onClick={
                    excHasPhotos
                      ? () =>
                          navigate(
                            `/gallery/${exc.city.name}/${excGalleryIdx}`,
                            {
                              state: {
                                fromPath: `${routerLocation.pathname}${routerLocation.search}`,
                              },
                            },
                          )
                      : undefined
                  }
                  onMouseEnter={() => setHoveredCity(exc.city)}
                  onMouseLeave={() => setHoveredCity(null)}
                  {...(excHasPhotos
                    ? { role: "button" as const, tabIndex: 0 }
                    : {})}
                >
                  <div className="stay-group__exc-thumb">
                    {excThumbSrc ? (
                      <img
                        alt={excLabel}
                        className="stay-group__exc-thumb-img"
                        src={excThumbSrc}
                      />
                    ) : (
                      <div className="stay-group__exc-thumb-empty" />
                    )}
                  </div>

                  <div className="stay-group__exc-body">
                    <div className="stay-group__exc-header">
                      <span className="stay-group__exc-name">{excLabel}</span>
                      <CountryFlag
                        className="stay-group__exc-flag"
                        countryId={exc.city.country.id}
                      />
                    </div>
                    <span className="stay-group__exc-meta">
                      <span className="stay-group__exc-date">{excDate}</span>
                    </span>
                  </div>

                  {tp ? (
                    <div
                      className={`stay-group__exc-transport-pill stay-group__exc-transport-pill--${tp.mode}`}
                    >
                      <div className="stay-group__exc-pill-row">
                        <ModeIcon
                          className="stay-group__exc-pill-icon"
                          mode={tp.mode}
                        />
                        {tp.distanceKm > 0 ? (
                          <span>{formatMileage(tp.distanceKm, lang)} km</span>
                        ) : null}
                      </div>
                      {tp.durationMinutes > 0 ? (
                        <div className="stay-group__exc-pill-duration">
                          ~{formatTripDetailDuration(tp.durationMinutes)}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </m.div>
  );
}
