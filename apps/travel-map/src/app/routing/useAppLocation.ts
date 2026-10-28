import { useLocation as useLocationRouter } from "react-router";

import { AppRouteContextValue } from "@/shared/context/AppRoute.context";

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
 * Derives structured route state from the current URL pathname.
 * @returns {AppRouteContextValue} Flags and extracted segments for the active route
 */
export function useAppLocation(): AppRouteContextValue {
  const location = useLocationRouter();
  const pathname = location.pathname;
  return (() => {
    const isGallery = pathname.includes("gallery");
    const isLightbox = pathname.split("/").length === 5;
    const isTimeline = pathname.startsWith("/timeline");
    const isStats = pathname.startsWith("/stats");
    const isTripDetail = pathname.startsWith("/trip/");
    const isPlaces = pathname.startsWith("/places");
    const isTrips = pathname === "/trips" || isTripDetail;
    const tripDetailId = readTripDetailId(pathname);
    const placesFilterMatch = pathname.match(
      /^\/places\/(lived|visited|future)$/,
    );
    const placesFilter = placesFilterMatch
      ? (placesFilterMatch[1] as "lived" | "visited" | "future")
      : isPlaces
        ? "visited"
        : null;
    const activeTab = isTimeline
      ? "timeline"
      : isStats
        ? "stats"
        : isPlaces
          ? "places"
          : isTrips
            ? "trips"
            : null;
    return {
      isTrips,
      isPlaces,
      isTripDetail,
      isTimeline,
      isStats,
      isGallery,
      isLightbox,
      activeTab,
      tripDetailId,
      placesFilter,
    };
  })();
}
