import { PropsWithChildren, memo, useContext } from "react";
import { InfoTab, LeftBar, Map, Tooltip } from "../../organisms";
import useLocation from "../../../hooks/location/location";
import { Container } from "../../molecules";
import { futureCities, visitedCities, visitedCountries } from "../../../data";
import { HomeContext } from "../../pages/Home/Home";

interface HomeTemplateProps extends PropsWithChildren {}

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
export default memo(function HomeTemplate(
  props: HomeTemplateProps
): JSX.Element {
  const { isInfoTabOpen, isGallery } = useLocation();
  const { hoveredCity, setHoveredCity } = useContext(HomeContext)!;

  return (
    <div className="home-template">
      <LeftBar />
      <InfoTab>{isInfoTabOpen ? props.children : null}</InfoTab>
      <Container isVisible={isGallery}>
        {isGallery ? props.children : null}
      </Container>
      <Map
        visitedCountries={visitedCountries}
        visitedCities={visitedCities}
        futureCities={futureCities}
        currHoveredCity={hoveredCity}
        setCurrentHoveredCity={setHoveredCity}
      />
      {visitedCities.map((city) => (
        <Tooltip
          key={city.name}
          city={city}
          onMouseEnter={() => setHoveredCity(city)}
          onMouseLeave={() => setHoveredCity(null)}
        />
      ))}
    </div>
  );
});
