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
}

export default function MapChart({
  visited = {},
  markers = [],
  hoveredCity,
  setHoveredCity,
  geoUrl = "",
}: MapChartProps) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
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
  return (
    <ComposableMap
      projectionConfig={{
        rotate: [0, 0, 0],
        center: [8, 48],
        scale: 800,
      }}
      width={800}
      height={400}
      className="map"
    >
      <ZoomableGroup zoom={1}>
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
          />
        ))}
        <use xlinkHref={hoveredCity?.name + "-marker"} />
      </ZoomableGroup>
    </ComposableMap>
  );
}
