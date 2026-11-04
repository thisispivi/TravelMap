import { Loading } from "@travelmap/ui/components/Loading/Loading";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { easeOut, panelSpring } from "@travelmap/ui/lib/motion";
import { AnimatePresence, m } from "framer-motion";
import { PanelLeftOpen } from "lucide-react";
import { lazy, ReactNode, Suspense, useEffect, useState } from "react";

import { AppNav } from "@/features/navigation/components/AppNav/AppNav";
import { BottomSheet } from "@/shared/components/BottomSheet/BottomSheet";
import { useAppRoute } from "@/shared/context/AppRoute.context";
import { usePanel } from "@/shared/context/Panel.context";
import { ResponsiveType } from "@/shared/hooks/useResponsive";

const Map = lazy(() =>
  import("@/features/map/components/Map/Map").then((module) => ({
    default: module.Map,
  })),
);
const TripList = lazy(() =>
  import("@/features/trips/components/TripList/TripList").then((module) => ({
    default: module.TripList,
  })),
);
const TripDetail = lazy(() =>
  import("@/features/trips/components/TripDetail/TripDetail").then(
    (module) => ({ default: module.TripDetail }),
  ),
);
const PlacesPanel = lazy(() =>
  import("@/features/places/components/PlacesPanel/PlacesPanel").then(
    (module) => ({ default: module.PlacesPanel }),
  ),
);

/* The longest a page opened first leaves the map waiting for an idle moment. */
const MAP_IDLE_TIMEOUT_MS = 2000;

/**
 * Properties accepted by the PageReady component.
 * @property {() => void} onReady - Told once the page has rendered and the browser is idle
 */
interface PageReadyProps {
  onReady: () => void;
}

/**
 * PageReady component
 * Sits beside a page inside its suspense boundary, so it mounts only once the
 * page has, then waits for the browser to be idle before saying so. It draws
 * nothing.
 * @component
 * @param {PageReadyProps} props - The component props
 * @param {() => void} props.onReady - Told once the page has rendered and the browser is idle
 * @returns {ReactNode} Nothing
 */
function PageReady({ onReady }: PageReadyProps): ReactNode {
  useEffect(() => {
    /* Safari has no idle callback before 18.4; a timer stands in. */
    if (!("requestIdleCallback" in window)) {
      const timer = setTimeout(onReady, MAP_IDLE_TIMEOUT_MS);
      return () => clearTimeout(timer);
    }
    const idle = window.requestIdleCallback(onReady, {
      timeout: MAP_IDLE_TIMEOUT_MS,
    });
    return () => window.cancelIdleCallback(idle);
  }, [onReady]);

  return null;
}

/**
 * Properties accepted by the map shell layout.
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {ReactNode} outlet - The active page route's element, frozen per render
 * @property {string} pathname - The current pathname, used to key page transitions
 * @property {ResponsiveType} responsive - The current viewport
 */
interface MapShellLayoutProps {
  isDarkTheme: boolean;
  outlet: ReactNode;
  pathname: string;
  responsive: ResponsiveType;
}

/**
 * PanelFallback component
 * What a lazily loaded panel or page shows while its code arrives.
 * @component
 * @returns {ReactNode} A centred spinner
 */
function PanelFallback(): ReactNode {
  return (
    <div className="map-shell__loading">
      <Loading />
    </div>
  );
}

/**
 * SideContent component
 * The content of the side panel for the active route: the trip list, one
 * trip, or the places. Keyed by what it shows, so changing it cross-fades.
 * @component
 * @returns {ReactNode} The side panel content
 */
function SideContent(): ReactNode {
  const { isTripDetail, isPlaces, tripDetailId } = useAppRoute();
  const key = isTripDetail
    ? `trip-${tripDetailId}`
    : isPlaces
      ? "places"
      : "trips";

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <m.div
        animate={{ opacity: 1, x: 0 }}
        className="map-shell__side-content"
        exit={{ opacity: 0, x: -12 }}
        initial={{ opacity: 0, x: 12 }}
        key={key}
        transition={easeOut}
      >
        <Suspense fallback={<PanelFallback />}>
          {isTripDetail ? (
            <TripDetail />
          ) : isPlaces ? (
            <PlacesPanel />
          ) : (
            <TripList />
          )}
        </Suspense>
      </m.div>
    </AnimatePresence>
  );
}

/**
 * MapShellLayout component
 * Puts the map underneath everything, the navigation over it, and the active
 * route's content where its purpose wants it: trips and places beside the map
 * so their routes stay visible (a bottom sheet on phones), timeline, stats and
 * galleries as pages over it. A page opened first comes before the map: the
 * map, the heaviest part of the site, starts behind it once it has rendered.
 * @component
 * @param {MapShellLayoutProps} props - The layout props
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @param {ReactNode} props.outlet - The active page route's element
 * @param {string} props.pathname - The current pathname
 * @param {ResponsiveType} props.responsive - The current viewport
 * @returns {ReactNode} The application layout
 */
export function MapShellLayout({
  isDarkTheme,
  outlet,
  pathname,
  responsive,
}: MapShellLayoutProps): ReactNode {
  const { surface, activeTab } = useAppRoute();
  const { isPanelOpen, setIsPanelOpen } = usePanel();
  const { t } = useLanguage(["home"]);
  const [isMapWanted, setIsMapWanted] = useState(surface !== "page");
  /* Once a route beside the map has shown it, it stays mounted for every page after. */
  if (surface !== "page" && !isMapWanted) setIsMapWanted(true);
  const isSideDocked = surface === "side" && !responsive.isCompact;
  /* A photo opening inside an album is the album's own business, not a new page. */
  const pageKey = pathname.split("/").slice(0, 4).join("/");

  return (
    <div className="map-shell__layout">
      {isMapWanted ? (
        <Suspense fallback={<PanelFallback />}>
          <Map isDarkTheme={isDarkTheme} responsive={responsive} />
        </Suspense>
      ) : null}

      <AppNav responsive={responsive} />

      <AnimatePresence>
        {isSideDocked && isPanelOpen ? (
          <m.aside
            animate={{ opacity: 1, x: 0 }}
            className="map-shell__side"
            exit={{ opacity: 0, x: -32 }}
            initial={{ opacity: 0, x: -32 }}
            key="side"
            transition={panelSpring}
          >
            <SideContent />
          </m.aside>
        ) : null}
        {isSideDocked && !isPanelOpen ? (
          <m.button
            animate={{ opacity: 1, scale: 1 }}
            className="map-shell__reopen"
            exit={{ opacity: 0, scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.9 }}
            key="reopen"
            onClick={() => setIsPanelOpen(true)}
            transition={panelSpring}
            type="button"
          >
            <PanelLeftOpen
              aria-hidden="true"
              className="map-shell__reopen-icon"
            />
            {t(`nav.${activeTab ?? "trips"}`)}
          </m.button>
        ) : null}
        {surface === "page" ? (
          <m.main
            animate={{ opacity: 1, y: 0 }}
            className="map-shell__page"
            exit={{ opacity: 0, y: 24 }}
            initial={{ opacity: 0, y: 24 }}
            key="page"
            transition={panelSpring}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <m.div
                animate={{ opacity: 1 }}
                className="map-shell__page-content"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key={pageKey}
                transition={easeOut}
              >
                <Suspense fallback={<PanelFallback />}>
                  {outlet}
                  <PageReady onReady={() => setIsMapWanted(true)} />
                </Suspense>
              </m.div>
            </AnimatePresence>
          </m.main>
        ) : null}
      </AnimatePresence>

      {surface === "side" && responsive.isCompact ? (
        <BottomSheet isOpen={isPanelOpen} onOpenChange={setIsPanelOpen}>
          <SideContent />
        </BottomSheet>
      ) : null}
    </div>
  );
}
