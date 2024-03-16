import { Geometry } from "../../../typings/feature";
import * as THREE from "three";

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
  const coordinates = geoCoords.coordinates;
  const firstPoint = coordinates?.[0]?.[0];
  const firstX = firstPoint?.[0];
  const firstY = firstPoint?.[1];
  if (!firstX || !firstY) return <></>;
  shape.moveTo(firstX as number, firstY as number);

  coordinates?.forEach((g) => {
    if (!g) return;
    g.forEach((p) => {
      if (!p || p.length < 2 || !p[0] || !p[1]) return;
      const point = new THREE.Vector2(p[0] as number, p[1] as number);
      shape.lineTo(point.x, point.y);
    });
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
