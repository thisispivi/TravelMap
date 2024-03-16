import { CountryShape, CountryShapeMulti } from "../../atoms";
import { FeaturesEntity } from "../../../typings/feature";

interface CountryProps {
  country: FeaturesEntity;
  lineColor?: string;
  shapeColor?: string;
}

export default function Country({
  country: { geometry },
  shapeColor = "#000000",
}: CountryProps): JSX.Element {
  const isMultiPolygon = geometry.type === "MultiPolygon";

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
