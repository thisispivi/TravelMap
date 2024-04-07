import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./components/pages/Home/Home";
import "./styles/_global.scss";
import "./styles/_typography.scss";
import "./styles/_variables.scss";
import "./styles/_mixins.scss";
import "./styles/_scrollbar.scss";
import "./styles/_images.scss";
import "./i18n/i18n";
import { RouterProvider, createHashRouter } from "react-router-dom";
import {
  Gallery,
  InfoTabFuture,
  InfoTabVisited,
  Lightbox,
} from "./components/organisms";
import { loader as galleryLoader } from "./components/organisms/Gallery/loader";
import { loader as lightboxLoader } from "./components/organisms/Lightbox/loader";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider
      router={createHashRouter([
        {
          path: "/",
          element: <Home />,
          children: [
            { path: "visited", element: <InfoTabVisited /> },
            { path: "future", element: <InfoTabFuture /> },
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
  </React.StrictMode>
);
