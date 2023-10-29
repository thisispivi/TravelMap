import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Country } from "../../../classes/Country";
import { City } from "../../../classes/City";
import { Marker } from "../../atoms";
import "./Map.scss";
import { useEffect, useState } from "react";

interface MapChartProps {
  visited?: Record<string, Country>;
  markers?: City[];
  hoveredCity?: City;
  setHoveredCity: (city: City | undefined) => void;
  geoUrl?: string;
  isDarkMode?: boolean;
}

export default function MapChart({
  visited = {},
  markers = [],
  hoveredCity,
  setHoveredCity,
  geoUrl = "",
  isDarkMode = false,
}: MapChartProps) {
  const [, setWindowWidth] = useState(window.innerWidth);
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  // Add this useEffect to listen for window resize events and update the windowWidth state accordingly
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [currentZoom, setCurrentZoom] = useState(
    window.innerWidth > 1000 ? 4 : 5
  );
  return (
    <ComposableMap className="map" projection={"geoMercator"}>
      <ZoomableGroup
        maxZoom={22}
        minZoom={1}
        zoom={window.innerWidth > 1000 ? 4 : 5}
        center={[7, 49]}
        onMoveEnd={({ zoom }) => {
          setCurrentZoom(zoom);
        }}
        onMove={({ zoom }) => {
          setCurrentZoom(zoom);
        }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                className={
                  visited[geo.properties.name.replace(" ", "")]
                    ? "visited"
                    : "not-visited"
                }
                strokeWidth={0.3}
                fill={
                  visited[geo.properties.name.replace(" ", "")]
                    ? visited[geo.properties.name.replace(" ", "")].fillColor
                    : "#DDD"
                }
                stroke={
                  visited[geo.properties.name.replace(" ", "")]
                    ? visited[geo.properties.name.replace(" ", "")].borderColor
                    : "#999"
                }
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        {markers.map((city) => (
          <Marker
            key={city.name}
            city={city}
            hoveredCity={hoveredCity}
            setHoveredCity={setHoveredCity}
            currentZoom={currentZoom}
            isDarkMode={isDarkMode}
          />
        ))}
        <use xlinkHref={hoveredCity?.name + "-marker"} />
      </ZoomableGroup>
    </ComposableMap>
  );
}
