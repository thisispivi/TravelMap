import "./styles/_global.scss";
import "./styles/_typography.scss";
import "./styles/_mixins.scss";
import "./styles/_scrollbar.scss";
import "./i18n/i18n";

import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import type { TooltipRefProps } from "react-tooltip";
import { Tooltip } from "react-tooltip";

import { Fallback, Home } from "./components/pages";
import { mobileAndTabletCheck } from "./utils/responsive";

const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Fallback />,
    children: [
      { path: "lived", element: null },
      { path: "visited", element: null },
      { path: "future", element: null },
      { path: "stats", element: null },
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
    ],
  },
]);

const isMobileOrTablet = mobileAndTabletCheck();

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
    <RouterProvider router={router} />
    {!isMobileOrTablet ? <BaseTooltip /> : null}
  </React.StrictMode>,
);
