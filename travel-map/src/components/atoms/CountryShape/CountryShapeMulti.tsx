import { Geometry } from "../../../typings/feature";
import * as THREE from "three";
import { drawShapeLine, moveToPoint } from "../../../utils/topojson";

interface CountryShapeMultiProps {
  geoCoords: Geometry;
  shapeColor: string;
}

/**
 * CountryShapeMulti component
 *
 * The country shape multi component is used to display a country on the map.
 * It is used to display a country with multiple shapes.
 *
 * @component
 *
 * @param {CountryShapeMultiProps} props - The props of the component
 * @param {Geometry} props.geoCoords - The coordinates of the country
 * @param {string} props.shapeColor - The color of the country
 * @returns {JSX.Element} - The country shape multi
 */
export default function CountryShapeMulti({
  geoCoords,
  shapeColor,
}: CountryShapeMultiProps): JSX.Element {
  const shapes: THREE.Shape[] = [];

  geoCoords.coordinates?.forEach((g) => {
    if (!g) return;
    if (g.length === 1) {
      const shape = new THREE.Shape();
      moveToPoint(shape, g[0]);
      g[0]?.forEach((p) => drawShapeLine(shape, p));
      shapes.push(shape);
    } else {
      g.forEach((i) => {
        const shape = new THREE.Shape();
        moveToPoint(shape, i);
        i?.forEach((p) => drawShapeLine(shape, p));
        shapes.push(shape);
      });
    }
  });

  return (
    <mesh>
      <shapeGeometry attach="geometry" args={[shapes]} />
      <meshBasicMaterial
        attach="material"
        color={shapeColor}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
