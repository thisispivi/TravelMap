import { lazy } from "react";
import Gallery from "./Gallery/Gallery";
import { InfoTab } from "./InfoTab/InfoTab";
import { InfoTabCities } from "./InfoTab/InfoTabCities/InfoTabCities";
import { InfoTabFuture } from "./InfoTab/InfoTabCities/InfoTabFuture";
import { InfoTabLived } from "./InfoTab/InfoTabCities/InfoTabLived";
import { InfoTabStats } from "./InfoTab/InfoTabStats/InfoTabStats";
import { InfoTabVisited } from "./InfoTab/InfoTabTrips/InfoTabVisited";
import { InfoTabTrips } from "./InfoTab/InfoTabTrips/InfoTabTrips";
import { LanguageSelector } from "./Language/Language";
import { LeftBar } from "./LeftBar/LeftBar";
import Lightbox from "./Lightbox/Lightbox";
import { MapTooltip } from "./Tooltip/TooltipMap";
const Map = lazy(() =>
  import("./Map/Map").then((module) => ({ default: module.Map })),
);

export {
  Gallery,
  InfoTab,
  InfoTabCities,
  InfoTabFuture,
  InfoTabLived,
  InfoTabVisited,
  InfoTabStats,
  InfoTabTrips,
  LanguageSelector,
  LeftBar,
  Lightbox,
  Map,
  MapTooltip,
};
