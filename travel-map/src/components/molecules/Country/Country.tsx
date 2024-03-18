import { CountryShape, CountryShapeMulti } from "../../atoms";
import { FeaturesEntity } from "../../../typings/feature";
import { Country as CountryCore } from "../../../core";

interface CountryProps {
  country: FeaturesEntity;
  visitedCountries?: Record<string, CountryCore>;
  isDarkTheme?: boolean;
}

export default function Country({
  country: { geometry, properties },
  isDarkTheme = false,
  visitedCountries = {},
}: CountryProps): JSX.Element {
  const isMultiPolygon = geometry.type === "MultiPolygon";

  const shapeColor = Object.keys(visitedCountries).includes(properties.name)
    ? visitedCountries[properties.name as keyof typeof visitedCountries]
        .fillColor
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
