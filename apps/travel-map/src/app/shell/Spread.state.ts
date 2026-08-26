import { City, Trip } from "@travelmap/core";

import { MapPosition } from "@/shared/context/MapInteraction.context";
import { parameters } from "@/shared/lib/parameters";

/**
 * State shared across the spread: what the plate is looking at, and whether the
 * reading margin is expanded.
 * @property {City | null} hoveredCity - The highlighted city
 * @property {MapPosition} mapPosition - The requested map viewport
 * @property {Trip | null} selectedTrip - The journey the route has opened
 * @property {Trip | null} focusedTrip - The journey the reader is pointing at
 * @property {boolean} isMarginOpen - Whether the reading column is expanded
 */
export interface SpreadState {
  hoveredCity: City | null;
  mapPosition: MapPosition;
  selectedTrip: Trip | null;
  focusedTrip: Trip | null;
  isMarginOpen: boolean;
}

/**
 * A change to the shared spread state.
 * @property {"hoveredCity"} type - The state slice being replaced
 * @property {City | null} value - The replacement value
 */
export type SpreadAction =
  | { type: "hoveredCity"; value: City | null }
  | { type: "mapPosition"; value: MapPosition }
  | { type: "selectedTrip"; value: Trip | null }
  | { type: "focusedTrip"; value: Trip | null }
  | { type: "isMarginOpen"; value: boolean };

export const initialSpreadState: SpreadState = {
  hoveredCity: null,
  mapPosition: {
    center: parameters.map.defaultCenter,
    zoom: parameters.map.defaultZoom,
  },
  selectedTrip: null,
  focusedTrip: null,
  isMarginOpen: true,
};

/**
 * Applies one state transition to the spread.
 * @param {SpreadState} state - The current spread state
 * @param {SpreadAction} action - The state transition to apply
 * @returns {SpreadState} The next spread state
 */
export function spreadReducer(
  state: SpreadState,
  action: SpreadAction,
): SpreadState {
  switch (action.type) {
    case "hoveredCity":
      return { ...state, hoveredCity: action.value };
    case "mapPosition":
      return { ...state, mapPosition: action.value };
    case "selectedTrip":
      return { ...state, selectedTrip: action.value };
    case "focusedTrip":
      return { ...state, focusedTrip: action.value };
    case "isMarginOpen":
      return { ...state, isMarginOpen: action.value };
  }
}
