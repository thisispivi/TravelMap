import { City, Trip } from "@travelmap/core";
import { createContext, use } from "react";

/**
 * Geographic viewport shared between panels and the map.
 * @property {[number, number]} center - Longitude and latitude
 * @property {number} zoom - Application-level zoom
 */
export interface MapPosition {
  center: [number, number];
  zoom: number;
}

/**
 * Cross-feature map interaction state owned by the application shell.
 * @property {City | null} hoveredCity - The highlighted city
 * @property {(city: City | null) => void} setHoveredCity - Updates the highlighted city
 * @property {MapPosition} mapPosition - The requested map viewport
 * @property {(position: MapPosition) => void} setMapPosition - Updates the requested viewport
 * @property {Trip | null} selectedTrip - The trip coordinated with the active route
 * @property {(trip: Trip | null) => void} setSelectedTrip - Updates the selected trip
 */
export interface MapInteractionContextValue {
  hoveredCity: City | null;
  setHoveredCity: (city: City | null) => void;
  mapPosition: MapPosition;
  setMapPosition: (position: MapPosition) => void;
  selectedTrip: Trip | null;
  setSelectedTrip: (trip: Trip | null) => void;
}

/** Cross-feature map interaction context provided by the map shell. */
export const MapInteractionContext =
  createContext<MapInteractionContextValue | null>(null);

/**
 * Reads map interaction state from the persistent shell.
 * @returns {MapInteractionContextValue} The active map interaction contract
 */
export function useMapInteraction(): MapInteractionContextValue {
  const value = use(MapInteractionContext);

  if (!value) {
    throw new Error(
      "useMapInteraction must be used within MapInteractionContext",
    );
  }

  return value;
}
