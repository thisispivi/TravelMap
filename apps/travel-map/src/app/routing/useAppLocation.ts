import { useLocation as useLocationRouter } from "react-router";

import {
  AppRouteContextValue,
  JourneyOrder,
  PlacesFilter,
} from "@/shared/context/AppRoute.context";

const JOURNEY_ORDERS: JourneyOrder[] = ["when", "where", "far"];
const PLACES_FILTERS: PlacesFilter[] = ["visited", "lived", "future"];

/**
 * Derives structured route state from the current URL pathname. The spread is
 * persistent, so the pathname is classified here rather than read through route
 * params by whichever surface happens to need it.
 * @returns {AppRouteContextValue} Flags and extracted segments for the active route
 */
export function useAppLocation(): AppRouteContextValue {
  const { pathname } = useLocationRouter();
  const segments = pathname.split("/").filter(Boolean);
  const isGallery = segments[0] === "gallery";
  const isLightbox = isGallery && segments.length === 4;
  const isFigures = segments[0] === "figures";
  const isTrip = segments[0] === "trip";
  const isPlaces = segments[0] === "places";
  const isJourneys = segments[0] === "trips";
  const isAtlas = segments.length === 0;
  const orderSegment = segments[1] as JourneyOrder | undefined;
  const filterSegment = segments[1] as PlacesFilter | undefined;

  return {
    section: isAtlas
      ? "atlas"
      : isFigures
        ? "figures"
        : isJourneys || isPlaces || isTrip
          ? "record"
          : null,
    isAtlas,
    isJourneys,
    isPlaces,
    isTrip,
    isFigures,
    isGallery,
    isLightbox,
    isTakeover: isFigures || isGallery,
    journeyOrder:
      orderSegment && JOURNEY_ORDERS.includes(orderSegment)
        ? orderSegment
        : "when",
    placesFilter:
      filterSegment && PLACES_FILTERS.includes(filterSegment)
        ? filterSegment
        : "visited",
    tripId: isTrip ? (segments[1] ?? null) : null,
  };
}
