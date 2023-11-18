import { City } from "../../../classes/City";
import { Marker as MarkerMap } from "react-simple-maps";
import "./Marker.scss";
import { MarkerIcon, MarkerText } from "../../atoms";

interface MarkerProps {
  city: City;
  hoveredCity?: City;
  setHoveredCity: (city: City | undefined) => void;
  scaleFactor?: number;
  isDarkMode?: boolean;
}

export function Marker({
  city,
  hoveredCity,
  setHoveredCity,
  scaleFactor = 1,
  isDarkMode = false,
}: MarkerProps) {
  return (
    <MarkerMap
      id={city.name + "-marker"}
      key={city.name}
      coordinates={city.coordinates}
      data-tooltip-id={city.name}
      onMouseEnter={() => setHoveredCity(city)}
      onMouseLeave={() => setHoveredCity(undefined)}
      style={{
        default: { outline: "none" },
        hover: { outline: "none" },
        pressed: { outline: "none" },
      }}
    >
      <MarkerIcon
        active={hoveredCity?.name === city.name}
        scaleFactor={scaleFactor}
      />
      {scaleFactor >= 10 && (
        <MarkerText
          city={city}
          scaleFactor={scaleFactor}
          isDarkMode={isDarkMode}
          hoveredCity={hoveredCity}
        />
      )}
    </MarkerMap>
  );
}
