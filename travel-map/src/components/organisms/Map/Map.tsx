import { useContext, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { WorldFeatureCollection } from "../../../typings/feature";
import { Country } from "../../molecules";
import { OrbitControls } from "@react-three/drei";
import { MOUSE, TOUCH } from "three";
import { HomeContext } from "../../pages/Home/Home";

export interface MapProps {
  data: WorldFeatureCollection;
}

export default function Map({ data }: MapProps): JSX.Element {
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
          shapeColor={isDarkTheme ? "#2c2c2c" : "#ffffff"}
        />
      )),
    [data.features, isDarkTheme]
  ) as JSX.Element[];

  const cameraControls = (
    <OrbitControls
      enableRotate={false}
      zoomToCursor
      enableDamping={false}
      mouseButtons={{
        LEFT: MOUSE.PAN,
      }}
      touches={{
        ONE: TOUCH.PAN,
        TWO: TOUCH.DOLLY_PAN,
      }}
      target={[x, y, 0]}
      zoomSpeed={2}
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
      </Canvas>
    </div>
  );
}
