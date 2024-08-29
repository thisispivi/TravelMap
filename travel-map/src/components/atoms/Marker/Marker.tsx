import { Marker as MarkerMap } from "react-simple-maps";
import "./Marker.scss";
import { City } from "../../../core";
import { MarkerIcon } from "../../../assets";

interface MarkerProps {
  city: City;
  hoveredCity?: City;
  setHoveredCity?: (city: City | undefined) => void;
  currentZoom: number;
  baseZoom?: number;
  defaultScale?: number;
  minScale?: number;
  maxScale?: number;
}

export function Marker({
  city,
  hoveredCity,
  setHoveredCity,
  currentZoom,
  baseZoom = 5,
  defaultScale = 0.15,
  minScale = 0.1,
  maxScale = 0.2,
}: MarkerProps) {
  const currScale = defaultScale * (baseZoom / currentZoom);
  const scale = Math.min(Math.max(currScale, minScale), maxScale);
  const isHovered = hoveredCity?.name === city.name;

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
        className={isHovered ? "marker-icon--hovered" : ""}
        scale={isHovered ? scale * 1.1 : scale}
      />
    </MarkerMap>
  );
}
