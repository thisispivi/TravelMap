import { createContext } from "react";

import { City, Trip } from "@/core";
import { ResponsiveType } from "@/hooks/style/responsive";
import { ThemeDetector } from "@/hooks/style/theme";

export type ActiveView = "trips" | "places" | null;

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

export const HomeContext = createContext<HomeContextType | undefined>(
  undefined,
);
