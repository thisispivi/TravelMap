import { Loading } from "@travelmap/ui/components/Loading/Loading";
import { PanelHeader } from "@travelmap/ui/components/PanelHeader/PanelHeader";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { classNames } from "@travelmap/ui/lib/classNames";
import { easeOut, panelSpring } from "@travelmap/ui/lib/motion";
import { AnimatePresence, m } from "framer-motion";
import { PanelLeftOpen } from "lucide-react";
import { lazy, ReactNode, Suspense, useEffect, useState } from "react";
import { useLocation, useNavigation } from "react-router";

import { AppNav } from "@/features/navigation/components/AppNav/AppNav";
import { BottomSheet } from "@/shared/components/BottomSheet/BottomSheet";
import { JournalSwitcher } from "@/shared/components/JournalSwitcher/JournalSwitcher";
import { useAppRoute } from "@/shared/context/AppRoute.context";
import { usePanel } from "@/shared/context/Panel.context";
import { ResponsiveType } from "@/shared/hooks/useResponsive";
import { JOURNAL_PAGES } from "@/shared/lib/journal";

import { classifyPathname } from "../routing/useAppLocation";

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
 * Names the page a pathname shows, ignoring the photo index a lightbox adds,
 * so opening a photo inside an album is not treated as a new page.
 * @param {string} pathname - The route pathname
 * @returns {string} The first three path segments
 */
function pageKeyOf(pathname: string): string {
  return pathname.split("/").slice(0, 4).join("/");
}

/**
 * Properties accepted by the pending navigation surface.
 * @property {boolean} [isWithinPage] - Keeps loading below the persistent journal header
 */
interface PendingNavigationProps {
  isWithinPage?: boolean;
}

/**
 * PendingNavigation component
 * Shows a delayed spinner while the router downloads the destination. Fast
 * navigation completes before it appears. The current outlet stays mounted
 * underneath, and the navigation remains available to change destination.
 * @component
 * @param {PendingNavigationProps} props - The loading surface props
 * @param {boolean} [props.isWithinPage=false] - Whether the header stays outside the loading surface
 * @returns {ReactNode} A loading surface, or nothing
 */
function PendingNavigation({
  isWithinPage = false,
}: PendingNavigationProps): ReactNode {
  const navigation = useNavigation();
  const location = useLocation();
  const { t } = useLanguage(["home"]);
  const pending = navigation.location;
  if (!pending || pending.pathname === location.pathname) return null;

  const destination = classifyPathname(pending.pathname);
  const current = classifyPathname(location.pathname);
  if (
    current.isLightbox &&
    destination.isLightbox &&
    pageKeyOf(pending.pathname) === pageKeyOf(location.pathname)
  )
    return null;

  return (
    <section
      className={classNames(
        "map-shell__pending",
        isWithinPage ? "map-shell__pending--inline" : "map-shell__page",
      )}
    >
      <div
        aria-busy="true"
        aria-label={t(`nav.${destination.activeTab ?? "trips"}`)}
        className="map-shell__loading"
        role="status"
      >
        <Loading />
      </div>
    </section>
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
  const navigation = useNavigation();
  const [isMapWanted, setIsMapWanted] = useState(surface !== "page");
  /* Once a route beside the map has shown it, it stays mounted for every page after. */
  if (surface !== "page" && !isMapWanted) setIsMapWanted(true);
  const isSideDocked = surface === "side" && !responsive.isCompact;
  /* A photo opening inside an album is the album's own business, not a new page. */
  const pageKey = pageKeyOf(pathname);
  const journalPage = JOURNAL_PAGES.find((page) => page.path === pathname);
  const pendingJournalPage = JOURNAL_PAGES.find(
    (page) => page.path === navigation.location?.pathname,
  );
  /* The header follows a pending journal switch, but only from a journal page. */
  const shownJournalPage = journalPage && (pendingJournalPage ?? journalPage);
  const isJournalNavigation = Boolean(journalPage && pendingJournalPage);

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
      </AnimatePresence>

      {/* A loaded page replaces its spinner fully painted, without exposing the old outlet. */}
      {surface === "page" ? (
        <main className="map-shell__page">
          <div className="map-shell__page-content">
            {shownJournalPage ? (
              <div className="map-shell__journal-header">
                <PanelHeader surface="page" title={t(shownJournalPage.title)}>
                  <JournalSwitcher responsive={responsive} />
                </PanelHeader>
              </div>
            ) : null}
            <div className="map-shell__outlet">
              <div className="map-shell__route" key={pageKey}>
                <Suspense fallback={<PanelFallback />}>
                  {outlet}
                  <PageReady onReady={() => setIsMapWanted(true)} />
                </Suspense>
              </div>
              {isJournalNavigation ? <PendingNavigation isWithinPage /> : null}
            </div>
          </div>
        </main>
      ) : null}

      {surface === "side" && responsive.isCompact ? (
        <BottomSheet isOpen={isPanelOpen} onOpenChange={setIsPanelOpen}>
          <SideContent />
        </BottomSheet>
      ) : null}
      {!isJournalNavigation ? <PendingNavigation /> : null}
    </div>
  );
}
