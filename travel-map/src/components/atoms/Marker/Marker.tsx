import "./Marker.scss";

import { JSX, useMemo } from "react";
import { Marker as MarkerMap, useZoomPanContext } from "react-simple-maps";

import { MarkerIcon } from "../../../assets";
import { City } from "../../../core";
import { getMinZoomForPopulation } from "../../../utils/labelVisibility";
import { parameters } from "../../../utils/parameters";

interface MarkerProps {
  city: City;
  hoveredCity: City | null;
  setHoveredCity: (city: City | null) => void;
  showLabel?: boolean;
  baseZoom?: number;
  defaultScale?: number;
  minScale?: number;
  maxScale?: number;
  isFuture?: boolean;
  isLived?: boolean;
}

/** Base font size in screen pixels for labels. */
const LABEL_BASE_FONT_SIZE = 16;
/** Slightly larger font size for hovered labels. */
const LABEL_HOVERED_FONT_SIZE = 19;
/** Screen-pixel offset below the marker tip. */
const LABEL_OFFSET_PX = 20;

const MARKER_STYLE = {
  default: { outline: "none" },
  hover: { outline: "none" },
  pressed: { outline: "none" },
} as const;

/**
 * Marker component
 *
 * Displays a map pin marker with an optional city-name label underneath.
 * The label fades in when the zoom level is sufficient for the city's
 * population tier.
 */
export function Marker({
  city,
  hoveredCity,
  setHoveredCity,
  showLabel = false,
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

  // Real-time zoom check: ensure the label should be visible at the current
  // live zoom level (the `showLabel` prop may lag slightly behind during zoom
  // gestures since it's computed on move-end).
  const labelVisible = useMemo(() => {
    if (isHovered) return true;
    if (!showLabel) return false;
    return k >= getMinZoomForPopulation(city.population ?? 0);
  }, [isHovered, showLabel, k, city.population]);

  const labelFontSize = useMemo(
    () => (isHovered ? LABEL_HOVERED_FONT_SIZE : LABEL_BASE_FONT_SIZE) / k,
    [isHovered, k],
  );

  const labelOffsetY = useMemo(() => LABEL_OFFSET_PX / k, [k]);

  return (
    <MarkerMap
      coordinates={city.coordinates}
      id={city.name + "-marker"}
      key={city.name}
      onMouseEnter={() => setHoveredCity && setHoveredCity(city)}
      onMouseLeave={() => setHoveredCity && setHoveredCity(null)}
      style={MARKER_STYLE}
    >
      <g className={`marker-group ${isHovered ? "marker-group--hovered" : ""}`}>
        <MarkerIcon
          className={`${isHovered ? "marker-icon--hovered" : ""}
            ${isFuture ? "marker-icon--future" : ""}
            ${isLived ? "marker-icon--lived" : ""}
          `}
          scale={scale}
        />
        {labelVisible ? (
          <text
            className={`marker-label ${isHovered ? "marker-label--hovered" : ""} ${isFuture ? "marker-label--future" : ""} ${isLived ? "marker-label--lived" : ""}`}
            dy={labelOffsetY}
            fontSize={labelFontSize}
            textAnchor="middle"
          >
            {city.name}
          </text>
        ) : null}
      </g>
    </MarkerMap>
  );
}
