import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { lazy, ReactNode, Suspense } from "react";

import { useAppLocation } from "@/app/routing/useAppLocation";
import ChevronIcon from "@/assets/icons/Chevron.svg?react";
import { FloatingNav } from "@/features/navigation/components/FloatingNav/FloatingNav";
import { Container } from "@/shared/components/Container/Container";
import { Loading } from "@/shared/components/Loading/Loading";
import { PanelLoading } from "@/shared/components/PanelLoading/PanelLoading";
import { usePanel } from "@/shared/context/Panel.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { ResponsiveType } from "@/shared/hooks/useResponsive";

const Map = lazy(() =>
  import("@/features/map/components/Map/Map").then((module) => ({
    default: module.Map,
  })),
);

/**
 * Properties accepted by the map shell layout.
 * @property {ReactNode} children - The active routed panel
 * @property {() => void} handleDarkModeSwitch - Toggles the application theme
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {ResponsiveType} responsive - The current responsive viewport state
 */
interface MapShellLayoutProps {
  children: ReactNode;
  handleDarkModeSwitch: () => void;
  isDarkTheme: boolean;
  responsive: ResponsiveType;
}
const TripBrowser = lazy(() =>
  import("@/features/trips/components/TripBrowser/TripBrowser").then(
    (module) => ({
      default: module.TripBrowser,
    }),
  ),
);
const PlacesBrowser = lazy(() =>
  import("@/features/places/components/PlacesBrowser/PlacesBrowser").then(
    (module) => ({
      default: module.PlacesBrowser,
    }),
  ),
);
const TripDetail = lazy(() =>
  import("@/features/trips/components/TripDetail/TripDetail").then(
    (module) => ({
      default: module.TripDetail,
    }),
  ),
);

/**
 * MapShellLayout component
 * Root layout for the persistent map shell. Composes the FloatingNav, the
 * lazily-loaded side panels (TripBrowser, TripDetail, PlacesBrowser), the
 * animated bottom panel for Timeline and Stats, the Gallery container, and the
 * Map underneath everything.
 * @component
 * @param {MapShellLayoutProps} props - The map shell layout props
 * @param {ReactNode} props.children - The active route element (lazy page)
 * @param {() => void} props.handleDarkModeSwitch - Toggles the application theme
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @param {ResponsiveType} props.responsive - The current responsive viewport state
 * @returns {ReactNode} The main application layout
 */
export function MapShellLayout({
  children,
  handleDarkModeSwitch,
  isDarkTheme,
  responsive,
}: MapShellLayoutProps): ReactNode {
  const { isGallery, isTrips, isPlaces, isTripDetail, isStats, isTimeline } =
    useAppLocation();
  const { isPanelOpen, setIsPanelOpen } = usePanel();
  const { t } = useLanguage(["home"]);

  const bottomPanelMotion = {
    animate: { scale: 1, x: "-50%", y: 0 },
    exit: { scale: 0.98, x: "-50%", y: "100vh" },
    initial: { scale: 0.98, x: "-50%", y: "100vh" },
    transition: { duration: 0.22, ease: [0.35, 0, 0.25, 1] },
  } as const;

  return (
    <div className="map-shell__layout">
      <FloatingNav
        handleDarkModeSwitch={handleDarkModeSwitch}
        isDarkTheme={isDarkTheme}
      />

      <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait">
          {(isTrips || isTripDetail) && isPanelOpen ? (
            <Suspense
              fallback={<PanelLoading variant="side" />}
              key="trip-panel"
            >
              {isTripDetail ? <TripDetail /> : <TripBrowser />}
            </Suspense>
          ) : null}
          {isPlaces && isPanelOpen ? (
            <Suspense fallback={<PanelLoading variant="side" />} key="places">
              <PlacesBrowser />
            </Suspense>
          ) : null}
          {(isTimeline || isStats) && isPanelOpen ? (
            <m.div
              animate={bottomPanelMotion.animate}
              className="map-shell__bottom-panel"
              exit={bottomPanelMotion.exit}
              initial={bottomPanelMotion.initial}
              key={isTimeline ? "timeline" : "stats"}
              transition={bottomPanelMotion.transition}
            >
              <Suspense fallback={<PanelLoading variant="bottom" />}>
                {children}
              </Suspense>
            </m.div>
          ) : null}
        </AnimatePresence>
      </LazyMotion>

      <LazyMotion features={domAnimation}>
        <AnimatePresence>
          {isTripDetail && !isPanelOpen ? (
            <m.button
              animate={{ opacity: 1, y: 0 }}
              className="map-shell__back-to-trip"
              exit={{ opacity: 0, y: 8 }}
              initial={{ opacity: 0, y: 8 }}
              onClick={() => setIsPanelOpen(true)}
              transition={{ duration: 0.18, ease: [0.35, 0, 0.25, 1] }}
              type="button"
            >
              <ChevronIcon className="map-shell__back-to-trip-chevron" />
              {t("tripDetail.backToTrip")}
            </m.button>
          ) : null}
        </AnimatePresence>
      </LazyMotion>

      <Container isVisible={isGallery}>
        {isGallery ? (
          <Suspense
            fallback={
              <div className="map-shell__loading">
                <Loading />
              </div>
            }
          >
            {children}
          </Suspense>
        ) : null}
      </Container>

      <Suspense
        fallback={
          <div className="map-shell__loading">
            <Loading />
          </div>
        }
      >
        <Map isDarkTheme={isDarkTheme} responsive={responsive} />
      </Suspense>
    </div>
  );
}
