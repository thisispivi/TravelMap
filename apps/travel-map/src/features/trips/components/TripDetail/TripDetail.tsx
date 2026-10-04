import "./TripDetail.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import ChevronIcon from "@/assets/icons/Chevron.svg?react";
import { futureTrips, visitedTrips } from "@/data/world";
import { isPanelLoadingVisible } from "@/shared/components/PanelLoading/PanelLoading.state";
import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { usePanel } from "@/shared/context/Panel.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";

import { TripDetailHero } from "../TripDetailHero/TripDetailHero";
import { TripItinerary } from "../TripItinerary/TripItinerary";

/**
 * TripDetail component
 * Floating panel showing the full route timeline and transport stats for
 * the selected trip. Slides in from the left and persists the trip in
 * shell-owned map interaction state so the route overlay stays visible.
 * @component
 * @returns {ReactNode} The trip detail panel, or null when no trip is selected
 */
export function TripDetail(): ReactNode {
  const { t } = useLanguage(["home"]);
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
    [...visitedTrips, ...futureTrips].find((tr) => tr.id === tripDetailId) ??
    selectedTrip;
  useEffect(() => {
    if (trip && selectedTrip?.id !== trip.id) setSelectedTrip(trip);
  }, [selectedTrip?.id, setSelectedTrip, trip]);

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
        <button
          className="trip-detail__back"
          onClick={() => {
            setSelectedTrip(null);
            navigate("/trips");
          }}
          type="button"
        >
          <ChevronIcon className="trip-detail__back-chevron" />
          <span>{t("visited.title")}</span>
        </button>

        <div
          className={classNames(
            "trip-detail__body",
            isBodyScrollable && "trip-detail__body--scrollable",
          )}
          ref={bodyRef}
        >
          <TripDetailHero
            countries={countries}
            onViewMap={() => setIsPanelOpen(false)}
            trip={trip}
          />
          <p className="trip-detail__route-label">{t("tripDetail.route")}</p>
          <TripItinerary trip={trip} />
        </div>
      </m.div>
    </LazyMotion>
  );
}
