import { useLocation } from "react-router";

/**
 * Where the reader is in the record, read from the URL rather than from route
 * elements. The shell needs this because the photographs a stay produced are
 * shown on the plate, above the route that names them — so the shell has to
 * classify the path itself instead of receiving it through an outlet.
 * @property {string | null} tripId - The journey being read, when there is one
 * @property {number | null} spanIndex - The stay whose photographs are open
 */
export interface AppLocation {
  tripId: string | null;
  spanIndex: number | null;
}

/**
 * Classifies the current pathname into the record's reading position.
 * @returns {AppLocation} The journey and stay the URL points at
 */
export function useAppLocation(): AppLocation {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/journey\/([^/]+)(?:\/(\d+))?\/?$/);
  if (!match) return { tripId: null, spanIndex: null };

  return {
    tripId: decodeURIComponent(match[1]),
    spanIndex: match[2] === undefined ? null : Number(match[2]),
  };
}
