import { createContext } from "react";

import { City } from "@/core";
import { ResponsiveType } from "@/hooks/style/responsive";
import { ThemeDetector } from "@/hooks/style/theme";

export type HomeContextType = ThemeDetector & {
  hoveredCity: City | null;
  setHoveredCity: (city: City | null) => void;
  mapPosition: { center: [number, number]; zoom: number };
  setMapPosition: (position: {
    center: [number, number];
    zoom: number;
  }) => void;
  isAutoPosition: boolean;
  setIsAutoPosition: (isAutoPosition: boolean) => void;
  responsive: ResponsiveType;
};

export const HomeContext = createContext<HomeContextType | undefined>(
  undefined,
);
