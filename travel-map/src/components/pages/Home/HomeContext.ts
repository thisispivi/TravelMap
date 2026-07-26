import { createContext } from "react";

import { City, Trip } from "@/core";
import { ResponsiveType } from "@/hooks/style/responsive";
import { ThemeDetector } from "@/hooks/style/theme";

/**
 * The panel currently displayed beside the map.
 */
export type ActiveView = "trips" | "places" | null;

/**
 * Shared state exposed by the home page layout.
 * @property {City | null} hoveredCity - The city highlighted on the map
 * @property {(city: City | null) => void} setHoveredCity - Updates the highlighted city
 * @property {{ center: [number, number]; zoom: number }} mapPosition - The current map viewport
 * @property {(position: { center: [number, number]; zoom: number }) => void} setMapPosition - Updates the map viewport
 * @property {ResponsiveType} responsive - The current responsive viewport state
 * @property {Trip | null} selectedTrip - The trip selected for detail display
 * @property {(trip: Trip | null) => void} setSelectedTrip - Updates the selected trip
 * @property {ActiveView} activeView - The active map side panel
 * @property {(view: ActiveView) => void} setActiveView - Updates the active panel
 * @property {boolean} isPanelOpen - Whether the active panel is open
 * @property {(open: boolean) => void} setIsPanelOpen - Updates the panel visibility
 */
export type HomeContextType = ThemeDetector & {
  hoveredCity: City | null;
  setHoveredCity: (city: City | null) => void;
  mapPosition: { center: [number, number]; zoom: number };
  setMapPosition: (position: {
    center: [number, number];
    zoom: number;
  }) => void;
  responsive: ResponsiveType;
  selectedTrip: Trip | null;
  setSelectedTrip: (trip: Trip | null) => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
};

/**
 * React context carrying the shared home page state.
 */
export const HomeContext = createContext<HomeContextType | undefined>(
  undefined,
);
