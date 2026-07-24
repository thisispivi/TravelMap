import "./Home.scss";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { lazy, PropsWithChildren, ReactNode, Suspense, use } from "react";

import ChevronIcon from "@/assets/icons/Chevron.svg?react";
import { useLanguage } from "@/hooks/language/language";
import { useLocation } from "@/hooks/location/location";

import { Loading } from "../../atoms/Loading/Loading";
import { Container } from "../../molecules/Container/Container";
import { PanelLoading } from "../../molecules/PanelLoading/PanelLoading";
import { FloatingNav } from "../../organisms/FloatingNav/FloatingNav";
import { HomeContext } from "../../pages/Home/HomeContext";

const Map = lazy(() =>
  import("../../organisms/Map/Map").then((mod) => ({ default: mod.Map })),
);
const TripBrowser = lazy(() =>
  import("../../organisms/TripBrowser/TripBrowser").then((mod) => ({
    default: mod.TripBrowser,
  })),
);
const PlacesBrowser = lazy(() =>
  import("../../organisms/PlacesBrowser/PlacesBrowser").then((mod) => ({
    default: mod.PlacesBrowser,
  })),
);
const TripDetail = lazy(() =>
  import("../../organisms/TripDetail/TripDetail").then((mod) => ({
    default: mod.TripDetail,
  })),
);

const bottomPanelMotion = {
  animate: { scale: 1, x: "-50%", y: 0 },
  exit: { scale: 0.98, x: "-50%", y: "100vh" },
  initial: { scale: 0.98, x: "-50%", y: "100vh" },
  transition: { duration: 0.22, ease: [0.35, 0, 0.25, 1] },
} as const;

/**
 * HomeTemplate component
 *
 * Root layout template for the home route. Composes the FloatingNav, the
 * lazily-loaded side panels (TripBrowser, TripDetail, PlacesBrowser), the
 * animated bottom panel for Timeline and Stats, the Gallery container, and the
 * Map underneath everything.
 *
 * @component
 *
 * @param {React.PropsWithChildren} props
 * @param {React.ReactNode} props.children - The active route element (lazy page)
 * @returns {ReactNode} The main application layout
 */
export function HomeTemplate({ children }: PropsWithChildren): ReactNode {
  const { isGallery, isTrips, isPlaces, isTripDetail, isStats, isTimeline } =
    useLocation();
  const { isDarkTheme, handleDarkModeSwitch, isPanelOpen, setIsPanelOpen } =
    use(HomeContext)!;
  const { t } = useLanguage(["home"]);

  return (
    <div className="home-template">
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
              className="home-template__bottom-panel"
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
              className="home-template__back-to-trip"
              exit={{ opacity: 0, y: 8 }}
              initial={{ opacity: 0, y: 8 }}
              onClick={() => setIsPanelOpen(true)}
              transition={{ duration: 0.18, ease: [0.35, 0, 0.25, 1] }}
              type="button"
            >
              <ChevronIcon className="home-template__back-to-trip-chevron" />
              {t("tripDetail.backToTrip")}
            </m.button>
          ) : null}
        </AnimatePresence>
      </LazyMotion>

      <Container isVisible={isGallery}>
        {isGallery ? (
          <Suspense
            fallback={
              <div className="centered">
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
          <div className="centered">
            <Loading />
          </div>
        }
      >
        <Map />
      </Suspense>
    </div>
  );
}
