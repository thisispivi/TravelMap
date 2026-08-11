import { lazy } from "react";
import { createHashRouter, Navigate } from "react-router";

import { MapShell } from "../shell/MapShell";
import { FallbackPage } from "./FallbackPage";

const TimelinePage = lazy(() =>
  import("@/features/timeline/components/TimelinePage/TimelinePage").then(
    (module) => ({ default: module.TimelinePage }),
  ),
);
const StatsPage = lazy(() =>
  import("@/features/stats/components/StatsPage/StatsPage").then((module) => ({
    default: module.StatsPage,
  })),
);

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
      { path: "timeline", element: <TimelinePage /> },
      { path: "stats", element: <StatsPage /> },
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
