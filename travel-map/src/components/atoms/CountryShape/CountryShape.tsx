import { Geometry } from "../../../typings/feature";
import * as THREE from "three";
import { drawShapeLine, moveToPoint } from "../../../utils/topojson";

interface CountryShapeProps {
  geoCoords: Geometry;
  shapeColor: string;
}

export default function CountryShape({
  geoCoords,
  shapeColor,
}: CountryShapeProps): JSX.Element {
  if (geoCoords.type === "MultiPolygon") {
    console.log("multi polygon", geoCoords.type, geoCoords.coordinates);
    return <></>;
  }

  const shape = new THREE.Shape();
  moveToPoint(shape, geoCoords.coordinates?.[0]);

  geoCoords.coordinates?.forEach((g) => {
    if (!g) return;
    g.forEach((p) => drawShapeLine(shape, p));
  });

  return (
    <mesh>
      <shapeGeometry attach="geometry" args={[shape]} />
      <meshBasicMaterial
        attach="material"
        color={shapeColor}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
