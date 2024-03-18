import { useContext, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { WorldFeatureCollection } from "../../../typings/feature";
import { Country } from "../../molecules";
import { OrbitControls } from "@react-three/drei";
import { MOUSE, TOUCH } from "three";
import { HomeContext } from "../../pages/Home/Home";
import { City, Country as CountryCore } from "../../../core";
import { Marker } from "../../atoms";

export interface MapProps {
  data: WorldFeatureCollection;
  visitedCountries: Record<string, CountryCore>;
  visitedCities: City[];
}

export default function Map({
  data,
  visitedCountries,
  visitedCities,
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

  const markerIcons = visitedCities.map((city) => (
    <Marker key={city.name} city={city} />
  ));

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
      zoomSpeed={1.5}
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
        {cameraControls}
        <ambientLight intensity={2000} color={"#ffffff"} />
        <directionalLight position={[x, y, z]} />
        <mesh>{countries}</mesh>
        {markerIcons}
      </Canvas>
    </div>
  );
}
