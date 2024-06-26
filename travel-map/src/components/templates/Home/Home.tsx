import { PropsWithChildren, memo, useState } from "react";
import { City } from "../../../core";
import { WorldFeatureCollection } from "../../../typings/feature";
import { InfoTab, LeftBar, Map } from "../../organisms";
import useLocation from "../../../hooks/location/location";
import { Container } from "../../molecules";
import { futureCities, visitedCities, visitedCountries } from "../../../data";

interface HomeTemplateProps extends PropsWithChildren {
  countriesFeatures: WorldFeatureCollection;
}

/**
 * HomeTemplate component
 *
 * The home template component is used to display the home page.
 *
 * @component
 *
 * @param {HomeTemplateProps} props - The props of the component
 * @param {WorldFeatureCollection} props.countriesFeatures - The countries features
 * @param {ReactNode} props.children - The children of the component
 * @returns {JSX.Element} - The home template
 */
export default memo(function HomeTemplate(
  props: HomeTemplateProps
): JSX.Element {
  const { isInfoTabOpen, isGallery } = useLocation();
  const [currHoveredCity, setCurrHoveredCity] = useState<City | null>(null);

  return (
    <div className="home-template">
      <LeftBar />
      <InfoTab>{isInfoTabOpen ? props.children : null}</InfoTab>
      <Container isVisible={isGallery}>
        {isGallery ? props.children : null}
      </Container>
      <Map
        data={props.countriesFeatures}
        visitedCountries={visitedCountries}
        visitedCities={visitedCities}
        futureCities={futureCities}
        currHoveredCity={currHoveredCity}
        setCurrentHoveredCity={setCurrHoveredCity}
      />
    </div>
  );
});
