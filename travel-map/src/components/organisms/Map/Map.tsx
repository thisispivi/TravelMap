import { useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { WorldFeatureCollection } from "../../../typings/feature";
import { Country } from "../../molecules";
import { OrbitControls } from "@react-three/drei";
import { MOUSE, TOUCH } from "three";

export interface MapProps {
  data: WorldFeatureCollection;
}

export default function Map({ data }: MapProps): JSX.Element {
  const mapRef = useRef<HTMLDivElement>(null);

  const x = 10;
  const y = 43;
  const z = 30;

  const countries = useMemo(
    () =>
      data.features?.map((feature) => (
        <Country key={feature.id} country={feature} />
      )),
    [data.features]
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
        height: "100dvh",
        width: "100dvw",
      }}
    >
      <Canvas
        camera={{
          position: [x, y, z],
          fov: 75,
        }}
      >
        {cameraControls}
        <ambientLight intensity={0.1} />
        <directionalLight position={[0, 10, 5]} />
        <mesh>{countries}</mesh>
      </Canvas>
    </div>
  );
}
