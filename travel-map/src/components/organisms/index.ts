import { lazy } from "react";

import Gallery from "./Gallery/Gallery";
import InfoTab from "./InfoTab/InfoTab";
const InfoTabCities = lazy(
  () => import("./InfoTab/InfoTabCities/InfoTabCities")
);
const InfoTabFuture = lazy(
  () => import("./InfoTab/InfoTabCities/InfoTabFuture")
);
const InfoTabLived = lazy(() => import("./InfoTab/InfoTabCities/InfoTabLived"));
const InfoTabVisited = lazy(
  () => import("./InfoTab/InfoTabCities/InfoTabVisited")
);
const InfoTabStats = lazy(() => import("./InfoTab/InfoTabStats/InfoTabStats"));
import LanguageSelector from "./Language/Language";
import LeftBar from "./LeftBar/LeftBar";
import Lightbox from "./Lightbox/Lightbox";
const Map = lazy(() => import("./Map/Map"));
const MapTooltip = lazy(() => import("./Tooltip/TooltipMap"));
const Tooltip = lazy(() => import("./Tooltip/Tooltip"));

export {
  Gallery,
  InfoTab,
  InfoTabCities,
  InfoTabFuture,
  InfoTabLived,
  InfoTabVisited,
  InfoTabStats,
  LanguageSelector,
  LeftBar,
  Lightbox,
  Map,
  MapTooltip,
  Tooltip,
};
