import "./TripDetail.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { JSX, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { CalendarIcon, ChevronIcon } from "@/assets";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { visitedTrips } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { useLocation } from "@/hooks/location/location";
import { useResponsive } from "@/hooks/style/responsive";
import { formatDateRangeShort } from "@/i18n/functions/date";

import { CountryFlag } from "../../atoms";
import { CityCard } from "../../molecules";

export function TripDetail(): JSX.Element | null {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { tripDetailId } = useLocation();
  const { selectedTrip, setSelectedTrip, setHoveredCity, setMapPosition } =
    useContext(HomeContext)!;
  const {
    window: { width },
  } = useResponsive();
  const isMobile = width <= 680;

  const trip = useMemo(
    () =>
      selectedTrip ?? visitedTrips.find((tr) => tr.id === tripDetailId) ?? null,
    [selectedTrip, tripDetailId],
  );

  useEffect(() => {
    if (trip && selectedTrip?.id !== trip.id) {
      setSelectedTrip(trip);
    }
  }, [selectedTrip?.id, setSelectedTrip, trip]);

  if (!trip) return null;

  const countries = trip.getCountriesVisited();

  const handleClose = () => {
    setSelectedTrip(null);
    navigate("/trips");
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="trip-detail"
        key={trip.id}
        layout="position"
        transition={{ duration: 0 }}
      >
        <button
          className="trip-detail__back"
          onClick={handleClose}
          type="button"
        >
          <ChevronIcon className="trip-detail__back-chevron" />
          <span>{t("visited.title")}</span>
        </button>

        <div className="trip-detail__hero">
          {trip.backgroundImgSource ? (
            <img
              alt={t(`trips.${trip.id}`)}
              className="trip-detail__hero-image"
              src={trip.backgroundImgSource}
            />
          ) : null}
          <div className="trip-detail__hero-overlay" />
          <div className="trip-detail__flags">
            {countries.map((c) => (
              <CountryFlag
                className="trip-detail__flag"
                countryId={c.id}
                key={c.id}
              />
            ))}
          </div>
          <div className="trip-detail__hero-content">
            <h2 className="trip-detail__title">{t(`trips.${trip.id}`)}</h2>
          </div>
        </div>

        <div className="trip-detail__body">
          <div className="trip-detail__meta">
            <div className="trip-detail__date">
              <CalendarIcon className="trip-detail__date-icon" />
              <p>
                {formatDateRangeShort({
                  sDateInput: trip.sDate,
                  eDateInput: trip.eDate,
                  locale: lang,
                  includeWeekday: false,
                  showYear: true,
                })}
              </p>
            </div>
            <span className="trip-detail__duration-badge">
              {trip.getDurationInDays()}{" "}
              {trip.getDurationInDays() === 1
                ? t("tripDetail.day")
                : t("tripDetail.days")}
            </span>
          </div>

          <div className="trip-detail__route">
            <h3>{t("tripDetail.route")}</h3>
            <div className="trip-detail__route-line">
              {trip.route.map((cityName, i) => (
                <div
                  className="trip-detail__route-stop"
                  key={`${cityName}-${i}`}
                >
                  <div className="trip-detail__route-dot" />
                  {i < trip.route.length - 1 ? (
                    <div className="trip-detail__route-connector" />
                  ) : null}
                  <span className="trip-detail__route-name">
                    {t(`cities.${cityName}`) || cityName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="trip-detail__cities">
            <h3>{t("tripDetail.cities")}</h3>
            <div className="trip-detail__cities-grid">
              {trip.destinations.map((dest) => (
                <CityCard
                  city={dest.city}
                  isClickable
                  key={`${dest.city.name}-${dest.travelIdx}`}
                  setHoveredCity={setHoveredCity}
                  setMapPosition={isMobile ? undefined : setMapPosition}
                  travel={dest.city.travels[dest.travelIdx]}
                  travelIdx={dest.travelIdx}
                />
              ))}
            </div>
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
}
