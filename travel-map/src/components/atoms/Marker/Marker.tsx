import "./Marker.scss";

import { ReactNode } from "react";
import { Marker as MapLibreMarker } from "react-map-gl/maplibre";

import { City } from "@/core";
import { classNames } from "@/utils/className";
import { isActivationKey } from "@/utils/keyboard";

export type MarkerVariant = "visited" | "future" | "lived" | "layover";

interface MarkerProps {
  city: City;
  hoveredCity: City | null;
  onHoverCity: (city: City | null) => void;
  onSelectCity: (city: City) => void;
  variant?: MarkerVariant;
}

/**
 * Marker component
 *
 * A map pin for a single city, coloured by how the city was visited.
 *
 * @component
 * @param {MarkerProps} props
 * @param {City} props.city - The city the pin points at
 * @param {City | null} props.hoveredCity - The city currently hovered on the map
 * @param {MarkerVariant} [props.variant] - Which palette the pin uses
 * @returns {ReactNode} The map pin
 */
export function Marker({
  city,
  hoveredCity,
  onHoverCity,
  onSelectCity,
  variant = "visited",
}: MarkerProps): ReactNode {
  const isHovered = hoveredCity?.name === city.name;

  return (
    <MapLibreMarker
      anchor="bottom"
      latitude={city.coordinates[1]}
      longitude={city.coordinates[0]}
      onClick={(event) => {
        event.originalEvent.stopPropagation();
        onSelectCity(city);
      }}
    >
      <span
        aria-label={city.name}
        className={classNames(
          "map-city-marker",
          `map-city-marker--${variant}`,
          isHovered && "map-city-marker--hovered",
        )}
        id={`${city.name}-marker`}
        onKeyDown={(event) => isActivationKey(event) && onSelectCity(city)}
        onMouseEnter={() => onHoverCity(city)}
        onMouseLeave={() => onHoverCity(null)}
        role="button"
        tabIndex={0}
      >
        <svg aria-hidden="true" viewBox="0 0 466.7 666.7">
          <path d="M233.3,0C104.5,0,0,104.5,0,233.3c0,128.9,233.3,433.3,233.3,433.3s233.3-304.5,233.3-433.3C466.7,104.5,362.2,0,233.3,0L233.3,0z M233.3,350c-64.4,0-116.7-52.2-116.7-116.7s52.2-116.7,116.7-116.7l0,0c64.4,0,116.7,52.2,116.7,116.7S297.8,350,233.3,350z" />
          <circle cx="233.3" cy="233.3" r="116.7" />
        </svg>
      </span>
    </MapLibreMarker>
  );
}
