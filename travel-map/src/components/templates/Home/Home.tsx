import { JSX, PropsWithChildren, Suspense, useContext } from "react";
import {
  InfoTab,
  InfoTabFuture,
  InfoTabLived,
  InfoTabStats,
  InfoTabVisited,
  LeftBar,
  Map,
} from "../../organisms";
import useLocation from "@/hooks/location/location";
import { Container } from "../../molecules";
import {
  futureCities,
  livedCities,
  visitedCities,
  visitedCountries,
} from "@/data";
import { HomeContext } from "../../pages/Home/Home";
import { Loading } from "../../atoms";
import "./Home.scss";

/**
 * HomeTemplate component
 *
 * The home template component is used to display the home page.
 *
 * @component
 *
 * @param {HomeTemplateProps} props - The props of the component
 * @param {ReactNode} props.children - The children of the component
 * @returns {JSX.Element} - The home template
 */
export default function HomeTemplate({
  children,
}: PropsWithChildren): JSX.Element {
  const { isVisited, isFuture, isGallery, isStats, isLived } = useLocation();
  const { hoveredCity, setHoveredCity, isDarkTheme, handleDarkModeSwitch } =
    useContext(HomeContext)!;

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
          <InfoTabLived isVisible={isLived} />
          <InfoTabVisited isVisible={isVisited} />
          <InfoTabFuture isVisible={isFuture} />
          <InfoTabStats isVisible={isStats} />
        </InfoTab>
        <Container isVisible={isGallery}>
          {isGallery ? children : null}
        </Container>
        <Map
          currHoveredCity={hoveredCity}
          futureCities={futureCities}
          livedCities={livedCities}
          setCurrentHoveredCity={setHoveredCity}
          visitedCities={visitedCities}
          visitedCountries={visitedCountries}
        />
      </Suspense>
    </div>
  );
}
