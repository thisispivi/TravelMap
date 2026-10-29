import { createContext, use } from "react";

/** A primary navigation tab. */
export type NavTabId = "trips" | "places" | "gallery" | "timeline" | "stats";

/** A filter the places panel can show. */
export type PlacesFilter = "visited" | "lived" | "future";

/**
 * Where the active route draws its content: nowhere (the map alone), in the
 * side panel beside the map, or as a page over it.
 */
type RouteSurface = "map" | "side" | "page";

/**
 * Structured state derived from the active route.
 * @property {NavTabId | null} activeTab - The highlighted navigation tab
 * @property {RouteSurface} surface - Where the route's content is drawn
 * @property {boolean} isTrips - Whether the trip list is open
 * @property {boolean} isTripDetail - Whether one trip is open
 * @property {boolean} isPlaces - Whether the places panel is open
 * @property {boolean} isGallery - Whether any gallery page is open
 * @property {boolean} isLightbox - Whether one photo is open full screen
 * @property {boolean} isTimeline - Whether the timeline is open
 * @property {boolean} isStats - Whether the statistics are open
 * @property {string | null} tripDetailId - The open trip's id
 * @property {PlacesFilter | null} placesFilter - The places filter, when places are open
 */
export interface AppRouteContextValue {
  activeTab: NavTabId | null;
  surface: RouteSurface;
  isTrips: boolean;
  isTripDetail: boolean;
  isPlaces: boolean;
  isGallery: boolean;
  isLightbox: boolean;
  isTimeline: boolean;
  isStats: boolean;
  tripDetailId: string | null;
  placesFilter: PlacesFilter | null;
}

/** Route state published by the map shell. */
export const AppRouteContext = createContext<AppRouteContextValue | null>(null);

/**
 * Reads the active route's meaning, classified once by the shell.
 * @returns {AppRouteContextValue} The route state
 */
export function useAppRoute(): AppRouteContextValue {
  const value = use(AppRouteContext);

  if (!value) {
    throw new Error("useAppRoute must be used within AppRouteContext");
  }

  return value;
}
