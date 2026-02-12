import "./Home.scss";

import { JSX, lazy, PropsWithChildren, Suspense, useContext } from "react";

import { useLocation } from "@/hooks/location/location";

import { Loading } from "../../atoms";
import { Container } from "../../molecules";
import { InfoTab } from "../../organisms/InfoTab/InfoTab";
import { LeftBar } from "../../organisms/LeftBar/LeftBar";
import { HomeContext } from "../../pages/Home/Home";
const Map = lazy(() =>
  import("../../organisms/Map/Map").then((mod) => ({ default: mod.Map })),
);
const InfoTabLived = lazy(() =>
  import("../../organisms/InfoTab/InfoTabCities/InfoTabLived").then((mod) => ({
    default: mod.InfoTabLived,
  })),
);
const InfoTabVisited = lazy(() =>
  import("../../organisms/InfoTab/InfoTabTrips/InfoTabVisited").then((mod) => ({
    default: mod.InfoTabVisited,
  })),
);
const InfoTabFuture = lazy(() =>
  import("../../organisms/InfoTab/InfoTabCities/InfoTabFuture").then((mod) => ({
    default: mod.InfoTabFuture,
  })),
);
const InfoTabStats = lazy(() =>
  import("../../organisms/InfoTab/InfoTabStats/InfoTabStats").then((mod) => ({
    default: mod.InfoTabStats,
  })),
);

/**
 * Home page template.
 *
 * Keeps heavy routes/components lazy-loaded (map, tabs, gallery).
 */
export function HomeTemplate({ children }: PropsWithChildren): JSX.Element {
  const { isVisited, isFuture, isGallery, isStats, isLived } = useLocation();
  const { isDarkTheme, handleDarkModeSwitch } = useContext(HomeContext)!;

  return (
    <div className="home-template">
      <LeftBar
        handleDarkModeSwitch={handleDarkModeSwitch}
        isDarkTheme={isDarkTheme}
      />
      <Suspense
        fallback={
          <div className="centered">
            <Loading />
          </div>
        }
      >
        <InfoTab>
          {isLived ? <InfoTabLived isVisible /> : null}
          {isVisited ? <InfoTabVisited isVisible /> : null}
          {isFuture ? <InfoTabFuture isVisible /> : null}
          {isStats ? <InfoTabStats isVisible /> : null}
        </InfoTab>
        <Container isVisible={isGallery}>
          {isGallery ? children : null}
        </Container>
        <Map />
      </Suspense>
    </div>
  );
}
