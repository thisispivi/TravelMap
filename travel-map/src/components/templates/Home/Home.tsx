import "./Home.scss";

import {
  JSX,
  lazy,
  PropsWithChildren,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useLocation } from "@/hooks/location/location";

import { Loading } from "../../atoms";
import { Container } from "../../molecules";
import { InfoTab } from "../../organisms/InfoTab/InfoTab";
import { LeftBar } from "../../organisms/LeftBar/LeftBar";
import { HomeContext } from "../../pages/Home/HomeContext";
const importMap = () => import("../../organisms/Map/Map");
const importInfoTabLived = () =>
  import("../../organisms/InfoTab/InfoTabCities/InfoTabLived");
const importInfoTabVisited = () =>
  import("../../organisms/InfoTab/InfoTabTrips/InfoTabVisited");
const importInfoTabFuture = () =>
  import("../../organisms/InfoTab/InfoTabCities/InfoTabFuture");
const importInfoTabStats = () =>
  import("../../organisms/InfoTab/InfoTabStats/InfoTabStats");

const Map = lazy(() => importMap().then((mod) => ({ default: mod.Map })));
const InfoTabLived = lazy(() =>
  importInfoTabLived().then((mod) => ({
    default: mod.InfoTabLived,
  })),
);
const InfoTabVisited = lazy(() =>
  importInfoTabVisited().then((mod) => ({
    default: mod.InfoTabVisited,
  })),
);
const InfoTabFuture = lazy(() =>
  importInfoTabFuture().then((mod) => ({
    default: mod.InfoTabFuture,
  })),
);
const InfoTabStats = lazy(() =>
  importInfoTabStats().then((mod) => ({
    default: mod.InfoTabStats,
  })),
);

/**
 * Home page template.
 *
 * Keeps heavy routes/components lazy-loaded (map, tabs, gallery).
 */
export function HomeTemplate({ children }: PropsWithChildren): JSX.Element {
  const { isGallery, activeTab } = useLocation();
  const { isDarkTheme, handleDarkModeSwitch } = useContext(HomeContext)!;
  const [displayedTab, setDisplayedTab] = useState<string | null>(activeTab);
  const displayedTabRef = useRef<string | null>(activeTab);

  useEffect(() => {
    void importInfoTabLived();
    void importInfoTabVisited();
    void importInfoTabFuture();
    void importInfoTabStats();
  }, []);

  useEffect(() => {
    displayedTabRef.current = displayedTab;
  }, [displayedTab]);

  useEffect(() => {
    const shouldDelay =
      Boolean(activeTab) &&
      Boolean(displayedTabRef.current) &&
      activeTab !== displayedTabRef.current;
    const timeoutId = window.setTimeout(
      () => {
        setDisplayedTab(activeTab);
      },
      shouldDelay ? 300 : 0,
    );

    return () => window.clearTimeout(timeoutId);
  }, [activeTab]);

  return (
    <div className="home-template">
      <LeftBar
        handleDarkModeSwitch={handleDarkModeSwitch}
        isDarkTheme={isDarkTheme}
      />
      <InfoTab>
        {displayedTab === "lived" ? <InfoTabLived isVisible /> : null}
        {displayedTab === "visited" ? <InfoTabVisited isVisible /> : null}
        {displayedTab === "future" ? <InfoTabFuture isVisible /> : null}
        {displayedTab === "stats" ? <InfoTabStats isVisible /> : null}
      </InfoTab>
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
