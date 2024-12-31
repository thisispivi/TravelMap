import { lazy } from "react";

import Gallery from "./Gallery/Gallery";
import InfoTab from "./InfoTab/InfoTab";
import InfoTabCities from "./InfoTab/InfoTabCities/InfoTabCities";
import InfoTabFuture from "./InfoTab/InfoTabCities/InfoTabFuture";
import InfoTabLived from "./InfoTab/InfoTabCities/InfoTabLived";
import InfoTabVisited from "./InfoTab/InfoTabCities/InfoTabVisited";
import InfoTabStats from "./InfoTab/InfoTabStats/InfoTabStats";
import LanguageSelector from "./Language/Language";
import LeftBar from "./LeftBar/LeftBar";
import Lightbox from "./Lightbox/Lightbox";
import MapTooltip from "./Tooltip/TooltipMap";
import Tooltip from "./Tooltip/Tooltip";
const Map = lazy(() => import("./Map/Map"));

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
