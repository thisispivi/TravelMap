import "./Home.scss";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { JSX, lazy, PropsWithChildren, Suspense, useContext } from "react";

import { useLocation } from "@/hooks/location/location";

import { Loading } from "../../atoms";
import { Container } from "../../molecules";
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

export function HomeTemplate({ children }: PropsWithChildren): JSX.Element {
  const { isGallery, isTrips, isPlaces, isTripDetail } = useLocation();
  const { isDarkTheme, handleDarkModeSwitch, isPanelOpen } =
    useContext(HomeContext)!;

  return (
    <div className="home-template">
      <FloatingNav
        handleDarkModeSwitch={handleDarkModeSwitch}
        isDarkTheme={isDarkTheme}
      />

      <LazyMotion features={domAnimation}>
        <Suspense fallback={null}>
          <AnimatePresence mode="wait">
            {(isTrips || isTripDetail) && isPanelOpen ? (
              <m.div
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key="trip-panel"
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              >
                {isTripDetail ? <TripDetail /> : <TripBrowser />}
              </m.div>
            ) : null}
            {isPlaces && isPanelOpen ? <PlacesBrowser key="places" /> : null}
          </AnimatePresence>
        </Suspense>
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
