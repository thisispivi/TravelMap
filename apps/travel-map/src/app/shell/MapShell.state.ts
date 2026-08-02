import { City, Trip } from "@travelmap/core";

import { MapPosition } from "@/shared/context/MapInteraction.context";
import { parameters } from "@/shared/lib/parameters";

/**
 * Represents the map-shell state.
 * @property {City | null} hoveredCity - The hovered city
 * @property {MapPosition} mapPosition - The map position
 * @property {Trip | null} selectedTrip - The selected trip
 * @property {boolean} isPanelOpen - Whether a content panel is open
 */
export interface MapShellState {
  hoveredCity: City | null;
  mapPosition: MapPosition;
  selectedTrip: Trip | null;
  isPanelOpen: boolean;
}

/**
 * Represents a map-shell action.
 * @property {"hoveredCity"} type - The type
 * @property {City | null} value - The value
 */
export type MapShellAction =
  | { type: "hoveredCity"; value: City | null }
  | { type: "mapPosition"; value: MapPosition }
  | { type: "selectedTrip"; value: Trip | null }
  | { type: "isPanelOpen"; value: boolean };

export const initialMapShellState: MapShellState = {
  hoveredCity: null,
  mapPosition: {
    center: parameters.map.defaultCenter,
    zoom: parameters.map.defaultZoom,
  },
  selectedTrip: null,
  isPanelOpen: true,
};

/**
 * Applies a map or panel state transition to the map shell.
 * @param {MapShellState} state - The current map-shell state
 * @param {MapShellAction} action - The state transition to apply
 * @returns {MapShellState} The next map-shell state
 */
export function mapShellReducer(
  state: MapShellState,
  action: MapShellAction,
): MapShellState {
  switch (action.type) {
    case "hoveredCity":
      return { ...state, hoveredCity: action.value };
    case "mapPosition":
      return { ...state, mapPosition: action.value };
    case "selectedTrip":
      return { ...state, selectedTrip: action.value };
    case "isPanelOpen":
      return { ...state, isPanelOpen: action.value };
  }
}
