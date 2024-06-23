import { Country as CountryCore } from "../../../core";
import * as THREE from "three";
import { SVGLoader } from "three-stdlib";
import { extend } from "@react-three/fiber";
import { SVGResultPaths } from "three/examples/jsm/Addons.js";
extend({ ShapeBufferGeometry: THREE.ShapeGeometry });

export interface CountryProps {
  path: SVGResultPaths;
  visitedCountries: Record<string, CountryCore>;
  isDarkTheme: boolean;
}

/**
 * Country component
 *
 * The country component is used to display a country on the map.
 * It uses three.js and react-three-fiber.
 *
 * @component
 *
 * @param {CountryProps} props - The props of the component
 * @param {SVGResultPaths} props.path - The path of the country
 * @param {Record<string, CountryCore>} props.visitedCountries - The visited countries
 * @param {boolean} props.isDarkTheme - The dark theme
 * @returns {JSX.Element} - The country
 */
export default function Country({
  path,
  visitedCountries,
  isDarkTheme,
}: CountryProps): JSX.Element {
  const group = new THREE.Group();

  const id = path.userData?.node.getAttribute("id");
  let countryColor;
  Object.keys(visitedCountries).forEach((cId) => {
    const country = visitedCountries[cId];
    const countryId = country.id;
    if (id === countryId) countryColor = country.fillColor;
  });
  const material = new THREE.MeshBasicMaterial({
    color: countryColor ? countryColor : isDarkTheme ? "#2c2c2c" : "#000000",
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const shapes = SVGLoader.createShapes(path);

  for (let j = 0; j < shapes.length; j++) {
    const shape = shapes[j];
    const geometry = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
  }

  return (
    <>
      {group.children.map((child, index) => (
        <primitive key={index} object={child} />
      ))}
    </>
  );
}
