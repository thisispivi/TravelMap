import { Country as CountryCore } from "../../../core";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { SVGLoader } from "three-stdlib";
import { extend } from "@react-three/fiber";
import Country from "../../atoms/Country/Country";
extend({ ShapeBufferGeometry: THREE.ShapeGeometry });

export interface CountriesProps {
  url: string;
  visitedCountries: Record<string, CountryCore>;
  isDarkTheme: boolean;
}

/**
 * Countries component
 *
 * The countries component is used to display the countries on the map.
 * It uses three.js and react-three-fiber.
 *
 * @component
 *
 * @param {CountriesProps} props - The props of the component
 * @param {string} props.url - The url of the svg file
 * @param {Record<string, CountryCore>} props.visitedCountries - The visited countries
 * @param {boolean} props.isDarkTheme - The dark theme
 * @returns {JSX.Element} - The countries
 */
export default function Countries({
  url,
  visitedCountries,
  isDarkTheme,
}: CountriesProps): JSX.Element {
  const { paths } = useLoader(SVGLoader, url);

  const data = paths.map((path, i) => (
    <Country
      key={i}
      path={path}
      visitedCountries={visitedCountries}
      isDarkTheme={isDarkTheme}
    />
  ));
  return (
    <group scale={[1, -1, 1]} position={[-490, 310, 0]}>
      {data}
    </group>
  );
}
