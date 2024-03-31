import { PropsWithChildren, memo, useState } from "react";
import { City } from "../../../core";
import { WorldFeatureCollection } from "../../../typings/feature";
import { InfoTab, LeftBar, Map } from "../../organisms";
import useLocation from "../../../hooks/location/location";
import { Backdrop } from "../../atoms";
import { useNavigate } from "react-router-dom";
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
 * @param {Record<string, Country>} props.visitedCountries - The visited countries
 * @param {City[]} props.visitedCities - The visited cities
 * @param {Record<string, Country>} props.futureCountries - The future countries
 * @param {City[]} props.futureCities - The future cities
 * @returns {JSX.Element} - The home template
 */
export default memo(function HomeTemplate(
  props: HomeTemplateProps
): JSX.Element {
  const navigate = useNavigate();
  const { isInfoTabOpen, isGallery } = useLocation();
  const [currHoveredCity, setCurrHoveredCity] = useState<City | null>(null);

  return (
    <div className="home-template">
      <LeftBar />
      <InfoTab>{isInfoTabOpen ? props.children : null}</InfoTab>
      {isGallery ? <Backdrop onClick={() => navigate("/TravelMap/")} /> : null}
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
