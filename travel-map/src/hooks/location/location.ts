import { useLocation as useLocationRouter } from "react-router-dom";

/**
 * The four top-level tabs of the floating nav.
 */
export type NavTabId = "trips" | "places" | "timeline" | "stats";

/**
 * Structured route state derived from the current location.
 * @property {boolean} isTrips - Whether the trips route is active
 * @property {boolean} isPlaces - Whether the places route is active
 * @property {boolean} isTripDetail - Whether a trip detail route is active
 * @property {boolean} isTimeline - Whether the timeline route is active
 * @property {boolean} isStats - Whether the statistics route is active
 * @property {boolean} isGallery - Whether a gallery route is active
 * @property {boolean} isLightbox - Whether a lightbox route is active
 * @property {NavTabId | null} activeTab - The active navigation tab
 * @property {string | null} tripDetailId - The selected trip identifier
 * @property {"lived" | "visited" | "future" | null} placesFilter - The active places filter
 */
export type UseLocationReturn = {
  isTrips: boolean;
  isPlaces: boolean;
  isTripDetail: boolean;
  isTimeline: boolean;
  isStats: boolean;
  isGallery: boolean;
  isLightbox: boolean;
  activeTab: NavTabId | null;
  tripDetailId: string | null;
  placesFilter: "lived" | "visited" | "future" | null;
};
/**
 * Derives structured route state from the current URL pathname.
 * @returns {UseLocationReturn} Flags and extracted segments for the active route.
 */
export function useLocation(): UseLocationReturn {
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
  })();
}
