import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { WorldFeatureCollection } from "../../../typings/feature";
import { Country } from "../../molecules";

export interface MapProps {
  data: WorldFeatureCollection;
}

export default function Map({ data }: MapProps): JSX.Element {
  const mapRef = useRef<HTMLDivElement>(null);

  const d = data.features?.map((feature) => (
    <Country key={feature.id} country={feature} />
  ));

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
          position: [0, 0, 100],
          fov: 75,
          aspect: 1.65,
          near: 0.1,
          far: 1000,
        }}
      >
        <ambientLight intensity={0.1} />
        <directionalLight position={[0, 10, 5]} />
        <mesh>{d}</mesh>
      </Canvas>
    </div>
  );
}
