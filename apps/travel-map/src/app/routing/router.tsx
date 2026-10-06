import { createHashRouter, Navigate } from "react-router";

import { MapShell } from "../shell/MapShell";
import { FallbackPage } from "./FallbackPage";

/** Hash router for the persistent map shell and its route-owned panels. */
export const router = createHashRouter([
  {
    path: "/",
    element: <MapShell />,
    errorElement: <FallbackPage />,
    children: [
      { index: true, element: null },
      { path: "trips", element: null },
      { path: "trip/:tripId", element: null },
      { path: "places", element: null },
      { path: "places/:filter", element: null },
      {
        path: "timeline",
        lazy: async () => {
          const { TimelinePage: Component } =
            await import("@/features/timeline/components/TimelinePage/TimelinePage");
          return { Component };
        },
      },
      {
        path: "stats",
        lazy: async () => {
          const { StatsPage: Component } =
            await import("@/features/stats/components/StatsPage/StatsPage");
          return { Component };
        },
      },
      {
        path: "gallery/:cityName/:travelIdx",
        lazy: async () => {
          const [{ Gallery: Component }, { galleryLoader: loader }] =
            await Promise.all([
              import("@/features/gallery/components/Gallery/Gallery"),
              import("@/features/gallery/loaders/Gallery.loader"),
            ]);

          return { Component, loader };
        },
        children: [
          {
            path: ":photoIdx",
            lazy: async () => {
              const [{ Lightbox: Component }, { lightboxLoader: loader }] =
                await Promise.all([
                  import("@/features/gallery/components/Lightbox/Lightbox"),
                  import("@/features/gallery/loaders/Lightbox.loader"),
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
