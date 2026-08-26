import { createContext, use } from "react";

/** The three places the reader can be: the arrival, the record, its figures. */
export type SectionId = "atlas" | "record" | "figures";

/** How the journeys in the record are ordered. */
export type JourneyOrder = "when" | "where" | "far";

/** Which set of places the record is showing. */
export type PlacesFilter = "visited" | "lived" | "future";

/**
 * Route state exposed to feature modules by the application shell.
 * @property {SectionId | null} section - The active top-level section
 * @property {boolean} isAtlas - Whether the arrival route is active
 * @property {boolean} isJourneys - Whether the record is listing journeys
 * @property {boolean} isPlaces - Whether the record is listing places
 * @property {boolean} isTrip - Whether a single journey is open
 * @property {boolean} isFigures - Whether the figures route is active
 * @property {boolean} isGallery - Whether a gallery route is active
 * @property {boolean} isLightbox - Whether a lightbox route is active
 * @property {boolean} isTakeover - Whether the active route claims the whole spread
 * @property {JourneyOrder} journeyOrder - The active journey ordering
 * @property {PlacesFilter} placesFilter - The active places filter
 * @property {string | null} tripId - The open journey identifier
 */
export interface AppRouteContextValue {
  section: SectionId | null;
  isAtlas: boolean;
  isJourneys: boolean;
  isPlaces: boolean;
  isTrip: boolean;
  isFigures: boolean;
  isGallery: boolean;
  isLightbox: boolean;
  isTakeover: boolean;
  journeyOrder: JourneyOrder;
  placesFilter: PlacesFilter;
  tripId: string | null;
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
