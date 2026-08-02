import "./TripDetail.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import AirplaneIcon from "@/assets/icons/Airplane.svg?react";
import BusIcon from "@/assets/icons/Bus.svg?react";
import CalendarIcon from "@/assets/icons/Calendar.svg?react";
import CarIcon from "@/assets/icons/Car.svg?react";
import FerryIcon from "@/assets/icons/Ferry.svg?react";
import TaxiIcon from "@/assets/icons/Taxi.svg?react";
import TimezoneIcon from "@/assets/icons/Timezone.svg?react";
import TrainIcon from "@/assets/icons/Train.svg?react";
import { visitedTrips } from "@/data/world";
import { isPanelLoadingVisible } from "@/shared/components/PanelLoading/PanelLoading.state";
import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { usePanel } from "@/shared/context/Panel.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";
import { formatMileage } from "@/shared/lib/format";

import {
  buildTripDetailTimelineItems,
  computeTripStats,
  formatTripDetailDuration,
} from "../../lib/tripDetailTimeline";
import { TripDetailHero } from "../TripDetailHero/TripDetailHero";
import { TripTimeline } from "../TripTimeline/TripTimeline";

/**
 * TripDetail component
 * Floating panel showing the full route timeline and transport stats for
 * the selected trip. Slides in from the left and persists the trip in
 * shell-owned map interaction state so the route overlay stays visible.
 * @component
 * @returns {ReactNode} The trip detail panel, or null when no trip is selected
 */
export function TripDetail(): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { tripDetailId } = useAppRoute();
  const { selectedTrip, setSelectedTrip } = useMapInteraction();
  const { setIsPanelOpen } = usePanel();
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [skipEntrance] = useState(isPanelLoadingVisible);
  const [isBodyScrollable, setIsBodyScrollable] = useState(false);
  const trip =
    selectedTrip ?? visitedTrips.find((tr) => tr.id === tripDetailId) ?? null;
  useEffect(() => {
    if (trip && selectedTrip?.id !== trip.id) setSelectedTrip(trip);
  }, [selectedTrip?.id, setSelectedTrip, trip]);
  const timelineItems = trip ? buildTripDetailTimelineItems(trip) : [];

  /**
   * Recomputes whether the trip detail body overflows its container, so the
   * scroll-shadow/back-to-trip affordances only show up when there's
   * actually more content to scroll to.
   * @returns {void}
   */
  const updateBodyScrollable = () => {
    const body = bodyRef.current;
    if (!body) return;
    setIsBodyScrollable(body.scrollHeight > body.clientHeight + 1);
  };
  const updateBodyScrollableRef = useRef(updateBodyScrollable);

  useEffect(() => {
    updateBodyScrollableRef.current = updateBodyScrollable;
  });

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    /**
     * Recalculates whether the trip-detail body can scroll.
     * @returns {void}
     */
    const handleScrollableChange = (): void =>
      updateBodyScrollableRef.current();

    handleScrollableChange();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(handleScrollableChange);
    observer?.observe(body);
    window.addEventListener("resize", handleScrollableChange);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", handleScrollableChange);
    };
  }, [trip?.id]);
  const showYear = trip
    ? trip.sDate.getFullYear() !== trip.eDate.getFullYear()
    : false;
  const stats = computeTripStats(timelineItems);
  if (!trip) return null;
  const countries = trip.getCountriesVisited();
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={{ scale: 1, x: 0 }}
        className="trip-detail"
        exit={{ scale: 0.98, x: "-120%" }}
        initial={skipEntrance ? false : { scale: 0.98, x: "-120%" }}
        key={trip.id}
        layout="position"
        transition={{ duration: 0.22, ease: [0.35, 0, 0.25, 1] }}
      >
        <TripDetailHero
          countries={countries}
          onBack={() => {
            setSelectedTrip(null);
            navigate("/trips");
          }}
          onViewMap={() => setIsPanelOpen(false)}
          trip={trip}
        />

        <div className="trip-detail__stats">
          {trip.getDurationInDays() > 0 ? (
            <span className="trip-detail__stat-pill">
              <CalendarIcon className="trip-detail__stat-pill-icon" />
              {trip.getDurationInDays()}{" "}
              {trip.getDurationInDays() === 1
                ? t("tripDetail.day")
                : t("tripDetail.days")}
            </span>
          ) : null}
          {stats.flights > 0 ? (
            <span className="trip-detail__stat-pill trip-detail__stat-pill--plane">
              <AirplaneIcon className="trip-detail__stat-pill-icon" />
              {stats.flights}{" "}
              {stats.flights === 1
                ? t("tripDetail.flight")
                : t("tripDetail.flights")}
              {stats.flightKm > 0
                ? ` · ${formatMileage(stats.flightKm, lang)} km`
                : ""}
              {stats.flightMinutes > 0
                ? ` · ~${formatTripDetailDuration(stats.flightMinutes)}`
                : ""}
            </span>
          ) : null}
          {stats.ferries > 0 ? (
            <span className="trip-detail__stat-pill trip-detail__stat-pill--ferry">
              <FerryIcon className="trip-detail__stat-pill-icon" />
              {stats.ferries}{" "}
              {stats.ferries === 1
                ? t("tripDetail.ferry")
                : t("tripDetail.ferries")}
              {stats.ferryKm > 0
                ? ` · ${formatMileage(stats.ferryKm, lang)} km`
                : ""}
              {stats.ferryMinutes > 0
                ? ` · ~${formatTripDetailDuration(stats.ferryMinutes)}`
                : ""}
            </span>
          ) : null}
          {stats.trains > 0 ? (
            <span className="trip-detail__stat-pill trip-detail__stat-pill--train">
              <TrainIcon className="trip-detail__stat-pill-icon" />
              {stats.trains}{" "}
              {stats.trains === 1
                ? t("tripDetail.train")
                : t("tripDetail.trains")}
              {stats.trainKm > 0
                ? ` · ${formatMileage(stats.trainKm, lang)} km`
                : ""}
              {stats.trainMinutes > 0
                ? ` · ~${formatTripDetailDuration(stats.trainMinutes)}`
                : ""}
            </span>
          ) : null}
          {stats.buses > 0 ? (
            <span className="trip-detail__stat-pill trip-detail__stat-pill--bus">
              <BusIcon className="trip-detail__stat-pill-icon" />
              {stats.buses}{" "}
              {stats.buses === 1 ? t("tripDetail.bus") : t("tripDetail.buses")}
              {stats.busKm > 0
                ? ` · ${formatMileage(stats.busKm, lang)} km`
                : ""}
              {stats.busMinutes > 0
                ? ` · ~${formatTripDetailDuration(stats.busMinutes)}`
                : ""}
            </span>
          ) : null}
          {stats.cars > 0 ? (
            <span className="trip-detail__stat-pill trip-detail__stat-pill--car">
              <CarIcon className="trip-detail__stat-pill-icon" />
              {stats.cars}{" "}
              {stats.cars === 1
                ? t("tripDetail.drive")
                : t("tripDetail.drives")}
              {stats.carKm > 0
                ? ` · ${formatMileage(stats.carKm, lang)} km`
                : ""}
              {stats.carMinutes > 0
                ? ` · ~${formatTripDetailDuration(stats.carMinutes)}`
                : ""}
            </span>
          ) : null}
          {stats.taxis > 0 ? (
            <span className="trip-detail__stat-pill trip-detail__stat-pill--taxi">
              <TaxiIcon className="trip-detail__stat-pill-icon" />
              {stats.taxis}{" "}
              {stats.taxis === 1 ? t("tripDetail.taxi") : t("tripDetail.taxis")}
              {stats.taxiKm > 0
                ? ` · ${formatMileage(stats.taxiKm, lang)} km`
                : ""}
              {stats.taxiMinutes > 0
                ? ` · ~${formatTripDetailDuration(stats.taxiMinutes)}`
                : ""}
            </span>
          ) : null}
          {stats.timezoneCount > 1 ? (
            <span className="trip-detail__stat-pill">
              <TimezoneIcon className="trip-detail__stat-pill-icon" />
              {stats.timezoneCount}{" "}
              {stats.timezoneCount === 1
                ? t("tripDetail.timeZone")
                : t("tripDetail.timeZones")}
            </span>
          ) : null}
        </div>

        <div
          className={classNames(
            "trip-detail__body",
            isBodyScrollable && "trip-detail__body--scrollable",
          )}
          ref={bodyRef}
        >
          <p className="trip-detail__route-label">{t("tripDetail.route")}</p>
          <TripTimeline items={timelineItems} showYear={showYear} />
        </div>
      </m.div>
    </LazyMotion>
  );
}
