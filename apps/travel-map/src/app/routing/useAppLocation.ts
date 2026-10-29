import { useLocation } from "react-router";

import {
  AppRouteContextValue,
  NavTabId,
  PlacesFilter,
} from "@/shared/context/AppRoute.context";

const PLACES_FILTERS: readonly PlacesFilter[] = ["visited", "lived", "future"];

/**
 * Reads the trip id out of a trip detail pathname. A reloaded hash URL keeps
 * the id percent-encoded (`cefal%C3%B9-…`) while in-app navigation does not,
 * so the segment is decoded here; a malformed escape is kept as typed and
 * simply matches no trip.
 * @param {string} pathname - The router pathname
 * @returns {string | null} The trip id, or null outside a trip detail route
 */
export function readTripDetailId(pathname: string): string | null {
  const segment = pathname.match(/^\/trip\/(.+)$/)?.[1];
  if (!segment) return null;

  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Classifies a pathname into the flags and ids the shell and its panels need.
 * @param {string} pathname - The router pathname
 * @returns {AppRouteContextValue} The route state
 */
export function classifyPathname(pathname: string): AppRouteContextValue {
  const [, section = "", filter] = pathname.split("/");
  const isTripDetail = section === "trip";
  const isGallery = section === "gallery";
  const tab: NavTabId | null =
    section === "trips" || isTripDetail
      ? "trips"
      : section === "places" ||
          section === "gallery" ||
          section === "timeline" ||
          section === "stats"
        ? section
        : null;

  return {
    activeTab: tab,
    surface:
      tab === "trips" || tab === "places" ? "side" : tab ? "page" : "map",
    isTrips: section === "trips",
    isTripDetail,
    isPlaces: tab === "places",
    isGallery,
    /* `/gallery/<trip|place>/<id>/<photo>` */
    isLightbox: isGallery && pathname.split("/").length === 5,
    isTimeline: tab === "timeline",
    isStats: tab === "stats",
    tripDetailId: readTripDetailId(pathname),
    placesFilter:
      tab === "places"
        ? (PLACES_FILTERS.find((candidate) => candidate === filter) ??
          "visited")
        : null,
  };
}

/**
 * Derives structured route state from the current URL pathname.
 * @returns {AppRouteContextValue} Flags and extracted segments for the active route
 */
export function useAppLocation(): AppRouteContextValue {
  return classifyPathname(useLocation().pathname);
}
