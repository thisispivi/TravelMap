import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import MarkerIcon from "../icons/Marker";
import { City } from "../utils/city";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

export type VisitedType = {
  name: string;
  fill: string;
  stroke: string;
};

interface MapChartProps {
  visited?: VisitedType[];
  markers?: City[];
  hoveredCity?: City;
  setHoveredCity: (city: City | undefined) => void;
}

export default function MapChart({
  visited = [],
  markers = [],
  hoveredCity,
  setHoveredCity,
}: MapChartProps) {
  const otherMarkers = markers.filter((m) => m !== hoveredCity);

  return (
    <ComposableMap
      projectionConfig={{
        rotate: [0, 0, 0],
        center: [10, 48],
        scale: 600,
      }}
      width={800}
      height={400}
      style={{ width: "100vw", height: "100vh", gridArea: "1 / 1 / 2 / 2" }}
    >
      <ZoomableGroup zoom={1}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={
                  visited.find((v) => v.name === geo.properties.name)?.fill ||
                  "#DDD"
                }
                stroke={
                  visited.find((v) => v.name === geo.properties.name)?.stroke ||
                  "#999"
                }
                strokeWidth={0.3}
              />
            ))
          }
        </Geographies>
        {markers.map((city) => (
          <Marker
            key={city.name}
            coordinates={city.coordinates}
            onMouseEnter={() => setHoveredCity(city)}
            onMouseLeave={() => setHoveredCity(undefined)}
            data-tooltip-id={city.name}
          >
            <MarkerIcon active={false} />
          </Marker>
        ))}
      </ZoomableGroup>
    </ComposableMap>
  );
}
