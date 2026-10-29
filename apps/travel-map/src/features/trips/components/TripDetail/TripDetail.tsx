import "./TripDetail.scss";

import { City, TransportModeSchema } from "@travelmap/core";
import { ArrowLeft, Images, Map as MapIcon } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import { findTripAlbum } from "@/data/albums";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { Button } from "@/shared/components/Button/Button";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { CoverImage } from "@/shared/components/CoverImage/CoverImage";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { PanelFrame } from "@/shared/components/PanelFrame/PanelFrame";
import { TransportModeIcon } from "@/shared/components/TransportModeIcon/TransportModeIcon";
import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { usePanel } from "@/shared/context/Panel.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { formatMileage } from "@/shared/lib/format";
import { parameters } from "@/shared/lib/parameters";

import { totalsOf } from "../../lib/tripItinerary";
import { findTrip } from "../../lib/trips";
import { TripItinerary } from "../TripItinerary/TripItinerary";

/**
 * TripDetail component
 * One trip: a cover with its title and dates, a pass of headline figures and
 * the modes used, links to its photos and the map, then the itinerary. Opening
 * it puts the trip in shared map state, so the route is drawn beside it.
 * @component
 * @returns {ReactNode} The trip detail
 */
export function TripDetail(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { tripDetailId } = useAppRoute();
  const { selectedTrip, setSelectedTrip, setHoveredCity, setMapPosition } =
    useMapInteraction();
  const { setIsPanelOpen } = usePanel();
  const { isCompact } = useResponsive();
  const trip = findTrip(tripDetailId) ?? selectedTrip;

  /*
   * A trip reached by its URL rather than from the list still has to draw its
   * route, which lives in shell-owned state.
   */
  useEffect(() => {
    if (trip && selectedTrip?.id !== trip.id) setSelectedTrip(trip);
  }, [selectedTrip?.id, setSelectedTrip, trip]);

  if (!trip) return <EmptyState message={t("trips.notFound")} />;

  const totals = totalsOf(trip);
  const album = findTripAlbum(trip.id);
  const totalsByMode = trip.getModeTotals();
  const modes = TransportModeSchema.options.filter(
    (mode) => totalsByMode[mode],
  );

  /**
   * Flies the map to a place from the itinerary, and on phones lowers the
   * sheet so the map can be seen.
   * @param {City} city - The place
   * @returns {void}
   */
  const focusCity = (city: City): void => {
    setMapPosition({
      center: city.coordinates,
      zoom: parameters.map.hoveredCityZoom,
    });
    setHoveredCity(city);
    if (isCompact) setIsPanelOpen(false);
  };

  return (
    <PanelFrame>
      <article className="trip-detail">
        <header className="trip-detail__hero">
          <CoverImage
            className="trip-detail__cover"
            isEager
            src={trip.backgroundImgSource}
          />
          <button
            className="trip-detail__back"
            onClick={() => {
              setSelectedTrip(null);
              navigate("/trips");
            }}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="trip-detail__back-icon" />
            {t("nav.trips")}
          </button>
          <span className="trip-detail__flags">
            {trip.getCountriesVisited().map((country) => (
              <CountryFlag
                className="trip-detail__flag"
                countryId={country.id}
                key={country.id}
              />
            ))}
          </span>
          <div className="trip-detail__heading">
            <p className="trip-detail__dates">
              {formatDateRangeShort({
                eDateInput: trip.eDate,
                locale: currLanguage,
                sDateInput: trip.sDate,
              })}
            </p>
            <h1 className="trip-detail__title">
              {trip.getLocalizedTitle(currLanguage)}
            </h1>
          </div>
        </header>

        <div className="trip-detail__content">
          <section aria-label={t("trip.summary")} className="trip-detail__pass">
            <dl className="trip-detail__figures">
              <div className="trip-detail__figure">
                <dt className="trip-detail__figure-label">{t("trip.days")}</dt>
                <dd className="trip-detail__figure-value">{totals.days}</dd>
              </div>
              <div className="trip-detail__figure">
                <dt className="trip-detail__figure-label">
                  {t("itinerary.nightsLabel")}
                </dt>
                <dd className="trip-detail__figure-value">{totals.nights}</dd>
              </div>
              <div className="trip-detail__figure">
                <dt className="trip-detail__figure-label">
                  {t("trip.places")}
                </dt>
                <dd className="trip-detail__figure-value">{totals.places}</dd>
              </div>
              <div className="trip-detail__figure">
                <dt className="trip-detail__figure-label">km</dt>
                <dd className="trip-detail__figure-value">
                  {formatMileage(totals.km, currLanguage, 0)}
                </dd>
              </div>
            </dl>
            <ul className="trip-detail__modes">
              {modes.map((mode) => (
                <li className="trip-detail__mode" key={mode}>
                  <TransportModeIcon
                    className="trip-detail__mode-icon"
                    mode={mode}
                  />
                  {t(`trip.mode.${mode}`, { count: totalsByMode[mode]?.count })}
                </li>
              ))}
            </ul>
          </section>

          {album || isCompact ? (
            <div className="trip-detail__actions">
              {album ? (
                <Button
                  onClick={() =>
                    navigate(`/gallery/trip/${encodeURIComponent(trip.id)}`, {
                      state: { fromPath: location.pathname },
                    })
                  }
                  variant="primary"
                >
                  <Images aria-hidden="true" />
                  {t("trip.photos", { count: album.count })}
                </Button>
              ) : null}
              {isCompact ? (
                <Button onClick={() => setIsPanelOpen(false)}>
                  <MapIcon aria-hidden="true" />
                  {t("trip.showMap")}
                </Button>
              ) : null}
            </div>
          ) : null}

          <h2 className="trip-detail__section-title">{t("itinerary.title")}</h2>
          <TripItinerary
            onFocusCity={focusCity}
            onHoverCity={setHoveredCity}
            trip={trip}
          />
        </div>
      </article>
    </PanelFrame>
  );
}
