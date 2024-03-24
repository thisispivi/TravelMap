import { useLocation as useLocationRouter } from "react-router-dom";

type LocationHook = {
  isVisited: boolean;
  isFuture: boolean;
  isInfoTabOpen: boolean;
  isGallery: boolean;
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
  const isVisited = location.pathname.includes("visited");
  const isFuture = location.pathname.includes("future");
  const isGallery = location.pathname.includes("gallery");
  const isInfoTabOpen = isVisited || isFuture;
  return { isVisited, isFuture, isInfoTabOpen, isGallery };
}
