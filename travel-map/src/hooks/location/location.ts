import { useLocation as useLocationRouter } from "react-router-dom";

type LocationHook = {
  isVisited: boolean;
  isFuture: boolean;
  isInfoTabOpen: boolean;
};

/**
 * The useLocation hook
 *
 * The useLocation hook is used to get the location of the user.
 *
 * @returns {LocationHook} - The location hook
 */
export default function useLocation(): LocationHook {
  const location = useLocationRouter();
  const isVisited = location.pathname === "/visited";
  const isFuture = location.pathname === "/future";
  const isInfoTabOpen = isVisited || isFuture;
  return { isVisited, isFuture, isInfoTabOpen };
}
