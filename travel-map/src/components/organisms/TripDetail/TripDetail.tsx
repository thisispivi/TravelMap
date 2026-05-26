import "./TripDetail.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { JSX, use, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { TripDetailHero, TripDetailTimeline } from "@/components/molecules";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { visitedTrips } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { useLocation } from "@/hooks/location/location";
import { buildTripDetailTimelineItems } from "@/utils/tripDetailTimeline";

export function TripDetail(): JSX.Element | null {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { tripDetailId } = useLocation();
  const { selectedTrip, setSelectedTrip } = use(HomeContext)!;

  const trip = useMemo(
    () =>
      selectedTrip ?? visitedTrips.find((tr) => tr.id === tripDetailId) ?? null,
    [selectedTrip, tripDetailId],
  );

  useEffect(() => {
    if (trip && selectedTrip?.id !== trip.id) setSelectedTrip(trip);
  }, [selectedTrip?.id, setSelectedTrip, trip]);

  const timelineItems = useMemo(
    () => (trip ? buildTripDetailTimelineItems(trip) : []),
    [trip],
  );

  const showYear = trip
    ? trip.sDate.getFullYear() !== trip.eDate.getFullYear()
    : false;

  if (!trip) return null;

  const countries = trip.getCountriesVisited();

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={{ scale: 1, x: 0 }}
        className="trip-detail"
        exit={{ scale: 0.98, x: "-120%" }}
        initial={{ scale: 0.98, x: "-120%" }}
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
          trip={trip}
        />

        <div className="trip-detail__body">
          <p className="trip-detail__route-label">{t("tripDetail.route")}</p>
          <TripDetailTimeline items={timelineItems} showYear={showYear} />
        </div>
      </m.div>
    </LazyMotion>
  );
}
