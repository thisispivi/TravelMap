import { useMemo } from "react";
import { useLocation as useLocationRouter } from "react-router-dom";

type LocationHook = {
  isVisited: boolean;
  isFuture: boolean;
  isInfoTabOpen: boolean;
  isGallery: boolean;
  isStats: boolean;
  isLived: boolean;
  isLightbox: boolean;
  activeTab: string | null;
  isCurrentTabOpen: (tab: string) => boolean;
};

/**
 * The useLocation hook
 *
 * The useLocation hook is used to get the location of the user.
 *
 * @returns {LocationHook} - The location hook
 */
export function useLocation(): LocationHook {
  const location = useLocationRouter();
  const pathname = location.pathname;

  return useMemo(() => {
    const isVisited = pathname.includes("visited");
    const isFuture = pathname.includes("future");
    const isGallery = pathname.includes("gallery");
    const isStats = pathname.includes("stats");
    const isLived = pathname.includes("lived");
    const isLightbox = pathname.split("/").length === 5;
    const isInfoTabOpen = isVisited || isFuture || isStats || isLived;

    const activeTab = isLived
      ? "lived"
      : isVisited
        ? "visited"
        : isFuture
          ? "future"
          : isStats
            ? "stats"
            : null;

    const isCurrentTabOpen = (tab: string) => pathname.includes(tab);

    return {
      isVisited,
      isFuture,
      isInfoTabOpen,
      isGallery,
      isStats,
      isLived,
      isCurrentTabOpen,
      isLightbox,
      activeTab,
    };
  }, [pathname]);
}
