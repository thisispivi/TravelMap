import { useMemo } from "react";
import { useLocation as useLocationRouter } from "react-router-dom";

export type UseLocationReturn = {
  isTrips: boolean;
  isPlaces: boolean;
  isTripDetail: boolean;
  isTimeline: boolean;
  isStats: boolean;
  isGallery: boolean;
  isLightbox: boolean;
  activeTab: "trips" | "places" | "timeline" | "stats" | null;
  tripDetailId: string | null;
  placesFilter: "lived" | "visited" | "future" | null;
};

/**
 * Derives structured route state from the current URL pathname.
 *
 * @returns {UseLocationReturn} Flags and extracted segments for the active route.
 */
export function useLocation(): UseLocationReturn {
  const location = useLocationRouter();
  const pathname = location.pathname;

  return useMemo(() => {
    const isGallery = pathname.includes("gallery");
    const isLightbox = pathname.split("/").length === 5;
    const isTimeline = pathname.startsWith("/timeline");
    const isStats = pathname.startsWith("/stats");
    const isTripDetail = pathname.startsWith("/trip/");
    const isPlaces = pathname.startsWith("/places");
    const isTrips = pathname === "/trips" || isTripDetail;

    const tripDetailMatch = pathname.match(/^\/trip\/(.+)$/);
    const tripDetailId = tripDetailMatch ? tripDetailMatch[1] : null;

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
  }, [pathname]);
}
