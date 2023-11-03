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
  const handleResize = () => setWindowWidth(window.innerWidth);
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [showNames, setShowNames] = useState(false);

  return (
    <ComposableMap className="map" projection={"geoMercator"}>
      <ZoomableGroup
        maxZoom={30}
        minZoom={1}
        zoom={window.innerWidth > 1000 ? 4 : 5}
        center={[7, 49]}
        onMoveEnd={({ zoom }) => {
          if (zoom > 10 && !showNames) setShowNames(true);
          if (zoom <= 10 && showNames) setShowNames(false);
        }}
      >
        <Geographies geography={geoUrl} style={{ pointerEvents: "none" }}>
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
                strokeWidth={0.1}
                fill={
                  visited[geo.properties.name.replace(" ", "")]
                    ? visited[geo.properties.name.replace(" ", "")].fillColor
                    : "#eaeaec"
                }
                stroke={"#b7b7b9"}
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
            showNames={showNames}
            isDarkMode={isDarkMode}
          />
        ))}
        <use xlinkHref={hoveredCity?.name + "-marker"} />
      </ZoomableGroup>
    </ComposableMap>
  );
}
