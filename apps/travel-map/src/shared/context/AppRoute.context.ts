import { createContext, use } from "react";

/** The four top-level tabs of the floating navigation. */
export type NavTabId = "trips" | "places" | "timeline" | "stats";

/**
 * Route state exposed to feature modules by the application shell.
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
export interface AppRouteContextValue {
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
}

/** Route-state context populated by the application shell. */
export const AppRouteContext = createContext<AppRouteContextValue | null>(null);

/**
 * Reads the shell's classified route state.
 * @returns {AppRouteContextValue} The current application route state
 */
export function useAppRoute(): AppRouteContextValue {
  const value = use(AppRouteContext);

  if (!value) {
    throw new Error("useAppRoute must be used within AppRouteContext");
  }

  return value;
}
