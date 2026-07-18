import "./styles/_global.scss";
import "./styles/_typography.scss";
import "./styles/_mixins.scss";
import "./styles/_scrollbar.scss";
import "./i18n/i18n";

import React, { Suspense, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";
import type { TooltipRefProps } from "react-tooltip";
import { Tooltip } from "react-tooltip";

import { Loading } from "./components/atoms/Loading/Loading";
import { Fallback } from "./components/pages/Fallback/Fallback";
import { Home } from "./components/pages/Home/Home";
import { mobileAndTabletCheck } from "./utils/responsive";

const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Fallback />,
    children: [
      { index: true, element: null },
      { path: "trips", element: null },
      { path: "trip/:tripId", element: null },
      { path: "places", element: null },
      { path: "places/:filter", element: null },
      {
        path: "timeline",
        lazy: async () => {
          const { TimelinePage } =
            await import("./components/pages/Timeline/Timeline");
          return { Component: TimelinePage };
        },
      },
      {
        path: "stats",
        lazy: async () => {
          const { StatsPage } = await import("./components/pages/Stats/Stats");
          return { Component: StatsPage };
        },
      },
      {
        path: "gallery/:cityName/:travelIdx",
        lazy: async () => {
          const [{ default: Component }, { loader }] = await Promise.all([
            import("./components/organisms/Gallery/Gallery"),
            import("./components/organisms/Gallery/loader"),
          ]);
          return { Component, loader };
        },
        children: [
          {
            path: ":photoIdx",
            lazy: async () => {
              const [{ default: Component }, { loader }] = await Promise.all([
                import("./components/organisms/Lightbox/Lightbox"),
                import("./components/organisms/Lightbox/loader"),
              ]);
              return { Component, loader };
            },
          },
        ],
      },
      { path: "*", element: <Navigate replace to="/trips" /> },
    ],
  },
]);

const isMobileOrTablet = mobileAndTabletCheck();

/**
 * BaseTooltip component
 *
 * Global `react-tooltip` instance used for all `data-tooltip-id="base-tooltip"`
 * anchors. Automatically closes when the window loses focus or the tab becomes
 * hidden to prevent stale tooltips after context switches.
 *
 * @component
 *
 * @returns {ReactNode} The shared tooltip element
 */
function BaseTooltip() {
  const tooltipRef = useRef<TooltipRefProps>(null);

  useEffect(() => {
    const closeTooltip = () => tooltipRef.current?.close({ delay: 0 });
    const handleVisibilityChange = () => document.hidden && closeTooltip();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", closeTooltip);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", closeTooltip);
    };
  }, []);

  return (
    <Tooltip
      className="tooltip"
      delayShow={300}
      globalCloseEvents={{ clickOutsideAnchor: true, escape: true }}
      id="base-tooltip"
      noArrow
      opacity={1}
      ref={tooltipRef}
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense
      fallback={
        <div className="app-loading">
          <Loading />
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
    {!isMobileOrTablet ? <BaseTooltip /> : null}
  </React.StrictMode>,
);
