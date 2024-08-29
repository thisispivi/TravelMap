import { Marker as MarkerMap } from "react-simple-maps";
import "./Marker.scss";
import { City } from "../../../core";
import { MarkerIcon } from "../../../assets";

interface MarkerProps {
  city: City;
  hoveredCity?: City;
  setHoveredCity?: (city: City | undefined) => void;
}

export function Marker({ city, hoveredCity, setHoveredCity }: MarkerProps) {
  return (
    <MarkerMap
      id={city.name + "-marker"}
      key={city.name}
      coordinates={city.coordinates}
      data-tooltip-id={city.name}
      onMouseEnter={() => setHoveredCity && setHoveredCity(city)}
      onMouseLeave={() => setHoveredCity && setHoveredCity(undefined)}
      style={{
        default: { outline: "none" },
        hover: { outline: "none" },
        pressed: { outline: "none" },
      }}
    >
      <MarkerIcon
        className={
          hoveredCity?.name === city.name
            ? "marker-icon marker-icon--hovered"
            : "marker-icon"
        }
      />
    </MarkerMap>
  );
}
