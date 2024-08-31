import { Marker as MarkerMap, useZoomPanContext } from "react-simple-maps";
import "./Marker.scss";
import { City } from "../../../core";
import { MarkerIcon } from "../../../assets";
import { parameters } from "../../../utils/parameters";

interface MarkerProps {
  city: City;
  hoveredCity: City | null;
  setHoveredCity: (city: City | null) => void;
  baseZoom?: number;
  defaultScale?: number;
  minScale?: number;
  maxScale?: number;
}

export function Marker({
  city,
  hoveredCity,
  setHoveredCity,
  baseZoom = parameters.map.defaultZoom,
  defaultScale = 0.15,
  minScale = 0.1,
  maxScale = 0.2,
}: MarkerProps) {
  const { k } = useZoomPanContext();
  const currScale = defaultScale * (baseZoom / k);
  const scale = Math.min(Math.max(currScale, minScale), maxScale);
  const isHovered = hoveredCity?.name === city.name;

  return (
    <MarkerMap
      id={city.name + "-marker"}
      key={city.name}
      coordinates={city.coordinates}
      onMouseEnter={() => setHoveredCity && setHoveredCity(city)}
      onMouseLeave={() => setHoveredCity && setHoveredCity(null)}
      style={{
        default: { outline: "none" },
        hover: { outline: "none" },
        pressed: { outline: "none" },
      }}
    >
      <MarkerIcon
        className={isHovered ? "marker-icon--hovered" : ""}
        scale={scale}
      />
    </MarkerMap>
  );
}
