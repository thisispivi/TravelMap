import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import MarkerIcon from "../icons/Marker";
import { City } from "../utils/city";
import { Country } from "../utils/country";

interface MapChartProps {
  visited?: Record<string, Country>;
  markers?: City[];
  hoveredCity?: City;
  setHoveredCity: (city: City | undefined) => void;
  geoUrl?: string;
}

export default function MapChart({
  visited = {},
  markers = [],
  hoveredCity,
  setHoveredCity,
  geoUrl = "",
}: MapChartProps) {
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
                className={
                  visited[geo.properties.name] ? "visited" : "not-visited"
                }
                strokeWidth={0.3}
                fill={
                  visited[geo.properties.name]
                    ? visited[geo.properties.name].fillColor
                    : "#DDD"
                }
                stroke={
                  visited[geo.properties.name]
                    ? visited[geo.properties.name].borderColor
                    : "#999"
                }
              />
            ))
          }
        </Geographies>
        {markers.map((city) => (
          <Marker
            id={city.name + "-marker"}
            key={city.name}
            coordinates={city.coordinates}
            data-tooltip-id={city.name}
            onMouseEnter={() => setHoveredCity(city)}
            onMouseLeave={() => setHoveredCity(undefined)}
          >
            <MarkerIcon active={hoveredCity?.name === city.name} />
          </Marker>
        ))}
        <use xlinkHref={hoveredCity?.name + "-marker"} />
      </ZoomableGroup>
    </ComposableMap>
  );
}
