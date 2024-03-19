import { CountryShape, CountryShapeMulti } from "../../atoms";
import { FeaturesEntity } from "../../../typings/feature";
import { Country as CountryCore } from "../../../core";

interface CountryProps {
  country: FeaturesEntity;
  visitedCountries?: Record<string, CountryCore>;
  isDarkTheme?: boolean;
}

/**
 * Country component
 *
 * The country component is used to display a country on the map.
 *
 * @component
 *
 * @param {CountryProps} props - The props of the component
 * @param {FeaturesEntity} props.country - The country to display
 * @param {Record<string, CountryCore>} [props.visitedCountries] - The visited countries
 * @param {boolean} [props.isDarkTheme] - The theme of the map
 * @returns {JSX.Element} - The country
 */
export default function Country({
  country: { geometry, properties },
  isDarkTheme = false,
  visitedCountries = {},
}: CountryProps): JSX.Element {
  const isMultiPolygon = geometry.type === "MultiPolygon";

  const shapeColor = Object.keys(visitedCountries).includes(
    properties.name.replace(" ", "")
  )
    ? visitedCountries[
        properties.name.replace(" ", "") as keyof typeof visitedCountries
      ].fillColor
    : isDarkTheme
      ? "#2c2c2c"
      : "#ffffff";

  return (
    <>
      {isMultiPolygon ? (
        <CountryShapeMulti geoCoords={geometry} shapeColor={shapeColor} />
      ) : (
        <CountryShape geoCoords={geometry} shapeColor={shapeColor} />
      )}
    </>
  );
}
