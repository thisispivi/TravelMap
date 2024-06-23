import { Suspense, memo, useContext, useEffect, useRef } from "react";
import { HomeContext } from "../../pages/Home/Home";
import { City, Country as CountryCore } from "../../../core";
import map from "../../../assets/json/map.svg";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { MOUSE, TOUCH } from "three";
import { Countries } from "../../molecules";
extend({ ShapeBufferGeometry: THREE.ShapeGeometry });

export interface MapProps {
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
  visitedCountries,
  visitedCities,
  futureCities,
  currHoveredCity,
  setCurrentHoveredCity,
}: MapProps): JSX.Element {
  const context = useContext(HomeContext);
  const { isDarkTheme } = context!;
  const mapRef = useRef<HTMLDivElement>(null);

  console.log(
    "Map component rendered with visitedCountries, visitedCities, futureCities, currHoveredCity, setCurrentHoveredCity",
    visitedCountries,
    visitedCities,
    futureCities,
    currHoveredCity,
    setCurrentHoveredCity
  );

  useEffect(() => {
    const resize = () => {
      if (mapRef.current) {
        const { innerWidth, innerHeight } = window;
        mapRef.current.style.width = `${innerWidth}px`;
        mapRef.current.style.height = `${innerHeight}px`;
      }
    };
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

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
      target={[0, 0, 0]}
      zoomSpeed={1.1}
      minZoom={2}
      maxZoom={20}
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
        frameloop="demand"
        orthographic
        style={{
          backgroundColor: isDarkTheme ? "#121212" : "#ffffff",
          transition: "background-color 0.3s ease-in-out",
        }}
        camera={{
          position: [0, 0, 1],
          zoom: 6,
        }}
      >
        <Suspense fallback={null}>
          {cameraControls}
          <Countries
            url={map}
            visitedCountries={visitedCountries}
            isDarkTheme={isDarkTheme}
          />
        </Suspense>
      </Canvas>
    </div>
  );
});
