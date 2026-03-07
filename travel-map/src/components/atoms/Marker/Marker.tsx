import "./Marker.scss";

import { JSX, useMemo } from "react";
import { Marker as MarkerMap, useZoomPanContext } from "react-simple-maps";

import { MarkerIcon } from "../../../assets";
import { City } from "../../../core";
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

/** Zoom thresholds for progressive label disclosure */
const LABEL_ZOOM_THRESHOLD = 1.2;
const LABEL_SMALL_ZOOM_THRESHOLD = 2.5;

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
export function Marker({
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

  const showLabel = useMemo(
    () => isHovered || k >= LABEL_ZOOM_THRESHOLD,
    [isHovered, k],
  );

  const showSmallLabel = useMemo(
    () => !isHovered && k >= LABEL_SMALL_ZOOM_THRESHOLD,
    [isHovered, k],
  );

  const labelFontSize = useMemo(() => {
    const base = isHovered ? 10 : showSmallLabel ? 6 : 8;
    return base / k;
  }, [isHovered, showSmallLabel, k]);

  const labelOffsetY = useMemo(() => {
    return (scale * 30 + 6) / k;
  }, [scale, k]);

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
      <g className={`marker-group ${isHovered ? "marker-group--hovered" : ""}`}>
        <MarkerIcon
          className={`${isHovered ? "marker-icon--hovered" : ""}
            ${isFuture ? "marker-icon--future" : ""}
            ${isLived ? "marker-icon--lived" : ""}
          `}
          scale={scale}
        />
        {showLabel ? (
          <text
            className={`marker-label ${isHovered ? "marker-label--hovered" : ""} ${isFuture ? "marker-label--future" : ""} ${isLived ? "marker-label--lived" : ""}`}
            dy={labelOffsetY}
            fontSize={labelFontSize * 2}
            textAnchor="middle"
          >
            {city.name}
          </text>
        ) : null}
      </g>
    </MarkerMap>
  );
}
