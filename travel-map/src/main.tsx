import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/_global.scss";
import "./styles/_typography.scss";
import "./styles/_variables.module.scss";
import "./styles/_mixins.scss";
import "./styles/_scrollbar.scss";
import "./i18n/i18n";
import { RouterProvider, createHashRouter } from "react-router-dom";
import {
  Gallery,
  InfoTabFuture,
  InfoTabLived,
  InfoTabStats,
  InfoTabVisited,
  Lightbox,
} from "./components/organisms";
import { loader as galleryLoader } from "./components/organisms/Gallery/loader";
import { loader as lightboxLoader } from "./components/organisms/Lightbox/loader";
import { Tooltip } from "react-tooltip";
import { mobileAndTabletCheck } from "./utils/responsive";
import { Home, Fallback } from "./components/pages";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider
      router={createHashRouter([
        {
          path: "/",
          element: <Home />,
          errorElement: <Fallback />,
          children: [
            { path: "lived", element: <InfoTabLived /> },
            { path: "visited", element: <InfoTabVisited /> },
            { path: "future", element: <InfoTabFuture /> },
            { path: "stats", element: <InfoTabStats /> },
            {
              path: "gallery/:cityName/:travelIdx",
              element: <Gallery />,
              loader: galleryLoader,
              children: [
                {
                  path: ":photoIdx",
                  element: <Lightbox />,
                  loader: lightboxLoader,
                },
              ],
            },
          ],
        },
      ])}
    />
    {!mobileAndTabletCheck() ? (
      <Tooltip
        className="tooltip"
        delayShow={300}
        id="base-tooltip"
        noArrow
        opacity={1}
      />
    ) : null}
  </React.StrictMode>,
);
