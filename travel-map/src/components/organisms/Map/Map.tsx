import { memo, useContext, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { WorldFeatureCollection } from "../../../typings/feature";
import { Country } from "../../molecules";
import { OrbitControls } from "@react-three/drei";
import { MOUSE, TOUCH } from "three";
import { HomeContext } from "../../pages/Home/Home";
import { City, Country as CountryCore } from "../../../core";
import { Marker, Tween } from "../../atoms";

export interface MapProps {
  data: WorldFeatureCollection;
  visitedCountries: Record<string, CountryCore>;
  visitedCities: City[];
  futureCities: City[];
  currHoveredCity: City | null;
  setCurrentHoveredCity: (city: City | null) => void;
}

/**
 * Map component
 *
 * The map component is used to display the map of the world. Uses three.js and react-three-fiber.
 * It displays the countries and the visited cities. It also handles the camera controls.
 * It uses the HomeContext to get the dark theme.
 *
 * @component
 *
 * @param {MapProps} props - The props of the component
 * @param {WorldFeatureCollection} props.data - The data of the map
 * @param {Record<string, CountryCore>} props.visitedCountries - The visited countries
 * @param {City[]} props.visitedCities - The visited cities
 * @param {City[]} props.futureCities - The future cities
 * @param {City | null} props.currHoveredCity - The current hovered city
 * @param {function} props.setCurrentHoveredCity - The function to set the current hovered city
 * @returns {JSX.Element} - The map
 */
export default memo(function Map({
  data,
  visitedCountries,
  visitedCities,
  futureCities,
  setCurrentHoveredCity,
}: MapProps): JSX.Element {
  const context = useContext(HomeContext);
  const { isDarkTheme } = context!;
  const mapRef = useRef<HTMLDivElement>(null);

  const x = 6;
  const y = 46;
  const z = 30;
  const countries = useMemo(
    () =>
      data.features?.map((feature) => (
        <Country
          key={feature.id}
          country={feature}
          visitedCountries={visitedCountries}
          isDarkTheme={isDarkTheme}
        />
      )),
    [data, visitedCountries, isDarkTheme]
  ) as JSX.Element[];

  const sortByLongitude = (a: City, b: City) =>
    b.coordinates[1] - a.coordinates[1];

  const markerIcons = useMemo(
    () =>
      visitedCities
        .sort(sortByLongitude)
        .map((city) => (
          <Marker
            key={city.name}
            city={city}
            setCurrHoveredCity={setCurrentHoveredCity}
          />
        )),
    [visitedCities, setCurrentHoveredCity]
  );

  const futureMarkerIcons = useMemo(
    () =>
      futureCities
        .sort(sortByLongitude)
        .map((city) => (
          <Marker
            key={city.name}
            city={city}
            isFuture
            setCurrHoveredCity={setCurrentHoveredCity}
          />
        )),
    [futureCities, setCurrentHoveredCity]
  );

  const cameraControls = (
    <OrbitControls
      enableRotate={false}
      zoomToCursor
      enableDamping={true}
      dampingFactor={0.2}
      mouseButtons={{
        LEFT: MOUSE.PAN,
      }}
      touches={{
        ONE: TOUCH.PAN,
        TWO: TOUCH.DOLLY_PAN,
      }}
      target={[x, y, 0]}
      zoomSpeed={1.1}
      maxDistance={100}
      minDistance={2}
    />
  );

  return (
    <div
      className="map"
      ref={mapRef}
      style={{
        width: window.innerWidth,
        height: window.innerHeight,
      }}
    >
      <Canvas
        camera={{
          position: [x, y, z],
          scale: [1, 0.8, 1],
        }}
        style={{
          backgroundColor: isDarkTheme ? "#121212" : "#ffffff",
          transition: "background-color 0.3s ease-in-out",
        }}
      >
        <Tween />
        {cameraControls}
        <ambientLight intensity={2000} color={"#ffffff"} />
        <directionalLight position={[x, y, z]} />
        <mesh key="countries-mesh">{countries}</mesh>
        {futureMarkerIcons}
        {markerIcons}
        {/* {currHoveredCity && (
          <Html
            position={
              new THREE.Vector3(
                currHoveredCity.coordinates[0],
                currHoveredCity.coordinates[1],
                0
              )
            }
            onMouseEnter={() => {
              setCurrentHoveredCity(currHoveredCity);
            }}
          >
            <div className="tooltip">{currHoveredCity.name}</div>
          </Html>
        )} */}
      </Canvas>
    </div>
  );
});
