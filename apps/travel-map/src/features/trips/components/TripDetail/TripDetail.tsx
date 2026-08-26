import "./TripDetail.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { futureTrips, visitedTrips } from "@/data/world";
import { isPanelLoadingVisible } from "@/shared/components/PanelLoading/PanelLoading.state";
import { TransportModeIcon } from "@/shared/components/TransportModeIcon/TransportModeIcon";
import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { usePanel } from "@/shared/context/Panel.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";
import { formatMileage } from "@/shared/lib/format";

import {
  buildTripDetailTimelineItems,
  computeTripStats,
  summarizeTripModes,
  totalTripDistanceKm,
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
  /*
   * Planned trips are absent from the browsable list, but a link to one still
   * has to resolve, so the lookup spans both records.
   */
  const trip =
    selectedTrip ??
    [...visitedTrips, ...futureTrips].find((tr) => tr.id === tripDetailId) ??
    null;
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
  const distanceKm = totalTripDistanceKm(stats);
  const days = trip?.getDurationInDays() ?? 0;
  /* Only figures the trip actually has: a walking city break should not show a
     zero-kilometre column next to its real numbers. */
  const figures = [
    days > 0 && {
      label: days === 1 ? t("tripDetail.day") : t("tripDetail.days"),
      value: days,
    },
    stats.stops > 0 && {
      label: t("tripDetail.stops"),
      value: stats.stops,
    },
    distanceKm > 0 && {
      label: t("tripDetail.distance"),
      value: formatMileage(distanceKm, lang),
    },
    stats.timezoneCount > 1 && {
      label: t("tripDetail.timeZones"),
      value: stats.timezoneCount,
    },
  ].filter((figure) => figure !== false);
  const modes = summarizeTripModes(stats);
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

        <div className="trip-detail__summary">
          <dl className="trip-detail__figures">
            {figures.map((figure) => (
              <div className="trip-detail__figure" key={figure.label}>
                <dt className="trip-detail__figure-label eyebrow">
                  {figure.label}
                </dt>
                <dd className="trip-detail__figure-value figure">
                  {figure.value}
                </dd>
              </div>
            ))}
          </dl>

          {modes.length > 0 ? (
            <ul className="trip-detail__modes">
              {modes.map((entry) => (
                <li
                  className={`trip-detail__mode trip-detail__mode--${entry.mode}`}
                  key={entry.mode}
                >
                  <TransportModeIcon
                    className="trip-detail__mode-icon"
                    mode={entry.mode}
                  />
                  <span className="figure">{entry.count}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div
          className={classNames(
            "trip-detail__body",
            isBodyScrollable && "trip-detail__body--scrollable",
          )}
          ref={bodyRef}
        >
          <p className="trip-detail__route-label eyebrow">
            {t("tripDetail.route")}
          </p>
          <TripTimeline items={timelineItems} showYear={showYear} />
        </div>
      </m.div>
    </LazyMotion>
  );
}
