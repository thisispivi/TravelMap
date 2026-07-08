import "./Marker.scss";

import { ReactNode } from "react";
import { Marker as MarkerMap, useZoomPanContext } from "react-simple-maps";

import { MarkerIcon } from "../../../assets";
import { City } from "../../../core";
import { getMinZoomForPopulation } from "../../../utils/labelVisibility";
import { parameters } from "../../../utils/parameters";

type MarkerVariant = "visited" | "future" | "lived" | "layover";

interface MarkerProps {
  city: City;
  hoveredCity: City | null;
  setHoveredCity: (city: City | null) => void;
  showLabel?: boolean;
  baseZoom?: number;
  defaultScale?: number;
  minScale?: number;
  maxScale?: number;
  variant?: MarkerVariant;
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
 *
 * @component
 *
 * @param {MarkerProps} props - The marker props
 * @param {City} props.city - The city to mark
 * @param {City | null} props.hoveredCity - Currently hovered city (for highlight)
 * @param {(city: City | null) => void} props.setHoveredCity - Hover state setter
 * @param {boolean} [props.showLabel] - Whether to show the city name label at low zoom
 * @param {number} [props.baseZoom] - Reference zoom level for marker scale calculation
 * @param {number} [props.defaultScale] - Default marker scale at base zoom
 * @param {number} [props.minScale] - Minimum allowed marker scale
 * @param {number} [props.maxScale] - Maximum allowed marker scale
 * @param {MarkerVariant} [props.variant] - Marker styling variant
 * @returns {ReactNode} The map marker
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
  variant = "visited",
}: MarkerProps): ReactNode {
  const { k } = useZoomPanContext();
  const currScale = defaultScale * (baseZoom / k);
  minScale = city.minMarkerScale || city.country.minMarkerScale || minScale;
  maxScale = city.country.maxMarkerScale || maxScale;
  const scale = Math.min(Math.max(currScale, minScale), maxScale);
  const isHovered = hoveredCity?.name === city.name;

  const labelVisible = (() => {
    if (isHovered) return true;
    if (!showLabel) return false;
    return k >= getMinZoomForPopulation(city.population ?? 0);
  })();

  const labelFontSize =
    (isHovered ? LABEL_HOVERED_FONT_SIZE : LABEL_BASE_FONT_SIZE) / k;

  const labelOffsetY = LABEL_OFFSET_PX / k;
  const variantClass = variant === "visited" ? "" : `marker-icon--${variant}`;
  const labelVariantClass =
    variant === "visited" ? "" : `marker-label--${variant}`;

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
          className={`${isHovered ? "marker-icon--hovered" : ""} ${variantClass}`}
          scale={scale}
        />
        {labelVisible ? (
          <text
            className={`marker-label ${isHovered ? "marker-label--hovered" : ""} ${labelVariantClass}`}
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
