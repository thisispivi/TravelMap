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
  isFuture?: boolean;
  isLived?: boolean;
}

/**
 * Marker component
 *
 * The Marker component is an atom that displays a marker on the map.
 *
 * @param {MarkerProps} data - The data that will be used to display the component.
 * @param {City} data.city - The city
 * @param {City} data.hoveredCity - The hovered city
 * @param {function} data.setHoveredCity - The function to set the hovered city
 * @param {number} data.baseZoom - The base zoom of the map
 * @param {number} data.defaultScale - The default scale of the marker
 * @param {number} data.minScale - The minimum scale of the marker
 * @param {number} data.maxScale - The maximum scale of the marker
 * @param {boolean} data.isFuture - Whether the marker is for a future city
 * @param {boolean} data.isLived - Whether the marker is for a lived city
 * @returns {JSX.Element} The Marker component
 */
export default function Marker({
  city,
  hoveredCity,
  setHoveredCity,
  baseZoom = parameters.map.defaultZoom,
  defaultScale = parameters.map.marker.defaultScale,
  minScale = parameters.map.marker.minScale,
  maxScale = parameters.map.marker.maxScale,
  isFuture = false,
  isLived = false,
}: MarkerProps): JSX.Element {
  const { k } = useZoomPanContext();
  const currScale = defaultScale * (baseZoom / k);
  minScale = city.country.minMarkerScale || minScale;
  maxScale = city.country.maxMarkerScale || maxScale;
  const scale = Math.min(Math.max(currScale, minScale), maxScale);
  const isHovered = hoveredCity?.name === city.name;

  return (
    <MarkerMap
      coordinates={city.coordinates}
      id={city.name + "-marker"}
      key={city.name}
      onMouseEnter={() => setHoveredCity && setHoveredCity(city)}
      onMouseLeave={() => setHoveredCity && setHoveredCity(null)}
      style={{
        default: { outline: "none" },
        hover: { outline: "none" },
        pressed: { outline: "none" },
      }}
    >
      <MarkerIcon
        className={`${isHovered ? "marker-icon--hovered" : ""}
          ${isFuture ? "marker-icon--future" : ""}
          ${isLived ? "marker-icon--lived" : ""}
        `}
        scale={scale}
      />
    </MarkerMap>
  );
}
