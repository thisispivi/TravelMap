import { Geometry } from "../../../typings/feature";
import * as THREE from "three";
import { drawShapeLine, moveToPoint } from "../../../utils/topojson";

interface CountryShapeProps {
  geoCoords: Geometry;
  shapeColor: string;
}

/**
 * CountryShape component
 *
 * The country shape component is used to display a country on the map.
 *
 * @component
 *
 * @param {CountryShapeProps} props - The props of the component
 * @param {Geometry} props.geoCoords - The coordinates of the country
 * @param {string} props.shapeColor - The color of the country
 * @returns {JSX.Element} - The country shape
 */
export default function CountryShape({
  geoCoords,
  shapeColor,
}: CountryShapeProps): JSX.Element {
  const shape = new THREE.Shape();
  moveToPoint(shape, geoCoords.coordinates?.[0]);

  geoCoords.coordinates?.forEach((g) => {
    if (!g) return;
    g.forEach((p) => drawShapeLine(shape, p));
  });

  return (
    <mesh>
      <meshBasicMaterial
        attach="material"
        color={shapeColor}
        side={THREE.DoubleSide}
        opacity={1}
      />
      <shapeGeometry attach="geometry" args={[shape]} />
    </mesh>
  );
}
