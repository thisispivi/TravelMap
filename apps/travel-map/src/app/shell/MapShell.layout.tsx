import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { easeOut, panelSpring } from "@travelmap/ui/lib/motion";
import { AnimatePresence, m } from "framer-motion";
import { PanelLeftOpen } from "lucide-react";
import { lazy, ReactNode, Suspense } from "react";

import { AppNav } from "@/features/navigation/components/AppNav/AppNav";
import { BottomSheet } from "@/shared/components/BottomSheet/BottomSheet";
import { Loading } from "@/shared/components/Loading/Loading";
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

/**
 * Properties accepted by the map shell layout.
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {() => void} onToggleTheme - Switches between light and dark
 * @property {ReactNode} outlet - The active page route's element, frozen per render
 * @property {string} pathname - The current pathname, used to key page transitions
 * @property {ResponsiveType} responsive - The current viewport
 */
interface MapShellLayoutProps {
  isDarkTheme: boolean;
  onToggleTheme: () => void;
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
 * galleries as pages over it.
 * @component
 * @param {MapShellLayoutProps} props - The layout props
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @param {() => void} props.onToggleTheme - Switches between light and dark
 * @param {ReactNode} props.outlet - The active page route's element
 * @param {string} props.pathname - The current pathname
 * @param {ResponsiveType} props.responsive - The current viewport
 * @returns {ReactNode} The application layout
 */
export function MapShellLayout({
  isDarkTheme,
  onToggleTheme,
  outlet,
  pathname,
  responsive,
}: MapShellLayoutProps): ReactNode {
  const { surface, activeTab } = useAppRoute();
  const { isPanelOpen, setIsPanelOpen } = usePanel();
  const { t } = useLanguage(["home"]);
  const isSideDocked = surface === "side" && !responsive.isCompact;
  /* A photo opening inside an album is the album's own business, not a new page. */
  const pageKey = pathname.split("/").slice(0, 4).join("/");

  return (
    <div className="map-shell__layout">
      <Suspense fallback={<PanelFallback />}>
        <Map isDarkTheme={isDarkTheme} responsive={responsive} />
      </Suspense>

      <AppNav
        isCompact={responsive.isCompact}
        isDarkTheme={isDarkTheme}
        onToggleTheme={onToggleTheme}
      />

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
                <Suspense fallback={<PanelFallback />}>{outlet}</Suspense>
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
