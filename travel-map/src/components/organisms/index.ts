import { lazy } from "react";

const Gallery = lazy(() => import("./Gallery/Gallery"));
const InfoTab = lazy(() => import("./InfoTab/InfoTab"));
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
const LanguageSelector = lazy(() => import("./Language/Language"));
const LeftBar = lazy(() => import("./LeftBar/LeftBar"));
const Lightbox = lazy(() => import("./Lightbox/Lightbox"));
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
