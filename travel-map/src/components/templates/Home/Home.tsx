import { JSX, PropsWithChildren, Suspense, lazy, useContext } from "react";
import InfoTab from "../../organisms/InfoTab/InfoTab";
import LeftBar from "../../organisms/LeftBar/LeftBar";
import useLocation from "@/hooks/location/location";
import { Container } from "../../molecules";
import { HomeContext } from "../../pages/Home/Home";
import { Loading } from "../../atoms";
import "./Home.scss";

const InfoTabLived = lazy(
  () => import("../../organisms/InfoTab/InfoTabCities/InfoTabLived"),
);
const InfoTabVisited = lazy(
  () => import("../../organisms/InfoTab/InfoTabTrips/InfoTabVisited"),
);
const InfoTabFuture = lazy(
  () => import("../../organisms/InfoTab/InfoTabCities/InfoTabFuture"),
);
const InfoTabStats = lazy(
  () => import("../../organisms/InfoTab/InfoTabStats/InfoTabStats"),
);
const Map = lazy(() => import("../../organisms/Map/Map"));

/**
 * Home page template.
 *
 * Keeps heavy routes/components lazy-loaded (map, tabs, gallery).
 */
export default function HomeTemplate({
  children,
}: PropsWithChildren): JSX.Element {
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
