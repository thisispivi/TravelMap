import "./Spread.scss";

import { City, Trip } from "@travelmap/core";
import { lazy, ReactNode, Suspense, useReducer, useState } from "react";
import { Outlet } from "react-router";

import { Masthead } from "@/features/navigation/components/Masthead/Masthead";
import { Loading } from "@/shared/components/Loading/Loading";
import { AppRouteContext } from "@/shared/context/AppRoute.context";
import {
  MapInteractionContext,
  MapInteractionContextValue,
} from "@/shared/context/MapInteraction.context";
import {
  MarginContext,
  MarginContextValue,
} from "@/shared/context/Margin.context";
import { useThemeDetector } from "@/shared/hooks/useThemeDetector";
import { classNames } from "@/shared/lib/classNames";

import { useAppLocation } from "../routing/useAppLocation";
import { MarginHandle } from "./MarginHandle";
import { initialSpreadState, spreadReducer, SpreadState } from "./Spread.state";

const CompassRose = lazy(() =>
  import("@/features/atlas/components/CompassRose/CompassRose").then(
    (module) => ({ default: module.CompassRose }),
  ),
);
const Map = lazy(() =>
  import("@/features/map/components/Map/Map").then((module) => ({
    default: module.Map,
  })),
);
/* The routed element is the same node whether it renders into the margin or
   under the gallery cover, so it is built once rather than per render. */
const routed = <Outlet />;

/**
 * Spread component
 * The whole application is one bound spread: a reading margin fixed to the left
 * edge and a full-bleed plate beside it. The plate is the rose on arrival and
 * the map everywhere else, so stepping into the record resolves the abstract
 * picture of the travel into the geography it came from. Routes render into the
 * margin; only the gallery ever covers the spread.
 * @component
 * @returns {ReactNode} The application spread
 */
export function Spread(): ReactNode {
  const appRoute = useAppLocation();
  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();
  const [state, dispatch] = useReducer(spreadReducer, initialSpreadState);
  /* The map keeps its WebGL context once it has been built, so leaving the
     arrival hides the rose over a live map instead of tearing the map down and
     paying for a fresh one on the way back. Before that first visit the map is
     not mounted at all, so the arrival costs no tiles. */
  const [isMapBuilt, setIsMapBuilt] = useState(false);
  if (!isMapBuilt && !appRoute.isAtlas) setIsMapBuilt(true);

  const mapInteraction: MapInteractionContextValue = {
    hoveredCity: state.hoveredCity,
    mapPosition: state.mapPosition,
    selectedTrip: state.selectedTrip,
    focusedTrip: state.focusedTrip,
    setHoveredCity: (value: City | null) =>
      dispatch({ type: "hoveredCity", value }),
    setMapPosition: (value: SpreadState["mapPosition"]) =>
      dispatch({ type: "mapPosition", value }),
    setSelectedTrip: (value: Trip | null) =>
      dispatch({ type: "selectedTrip", value }),
    setFocusedTrip: (value: Trip | null) =>
      dispatch({ type: "focusedTrip", value }),
  };
  const margin: MarginContextValue = {
    isMarginOpen: state.isMarginOpen,
    setIsMarginOpen: (value: boolean) =>
      dispatch({ type: "isMarginOpen", value }),
  };
  return (
    <div
      className={classNames(
        "spread",
        isDarkTheme ? "spread--dark" : "spread--light",
        appRoute.isAtlas && "spread--atlas",
        appRoute.isFigures && "spread--wide",
        !state.isMarginOpen && "spread--margin-closed",
        appRoute.isGallery && "spread--covered",
      )}
    >
      <AppRouteContext.Provider value={appRoute}>
        <MapInteractionContext.Provider value={mapInteraction}>
          <MarginContext.Provider value={margin}>
            <section className="spread__margin">
              <Masthead
                handleDarkModeSwitch={handleDarkModeSwitch}
                isDarkTheme={isDarkTheme}
              />
              <div className="spread__reading">
                <Suspense fallback={<div className="spread__pending" />}>
                  {appRoute.isGallery ? null : routed}
                </Suspense>
              </div>
            </section>

            <div className="spread__plate">
              <Suspense
                fallback={
                  <div className="spread__pending">
                    <Loading />
                  </div>
                }
              >
                {isMapBuilt ? <Map isDarkTheme={isDarkTheme} /> : null}
                <div
                  aria-hidden={!appRoute.isAtlas}
                  className={classNames(
                    "spread__rose",
                    appRoute.isAtlas && "spread__rose--shown",
                  )}
                >
                  <CompassRose />
                </div>
              </Suspense>
              <MarginHandle />
            </div>

            {appRoute.isGallery ? (
              <div className="spread__cover">
                <Suspense
                  fallback={
                    <div className="spread__pending">
                      <Loading />
                    </div>
                  }
                >
                  {routed}
                </Suspense>
              </div>
            ) : null}
          </MarginContext.Provider>
        </MapInteractionContext.Provider>
      </AppRouteContext.Provider>
    </div>
  );
}
