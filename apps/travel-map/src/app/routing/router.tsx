import { lazy } from "react";
import { createHashRouter, Navigate } from "react-router";

import { Spread } from "../shell/Spread";
import { FallbackPage } from "./FallbackPage";

const Arrival = lazy(() =>
  import("@/features/atlas/components/Arrival/Arrival").then((module) => ({
    default: module.Arrival,
  })),
);
const RecordIndex = lazy(() =>
  import("@/features/record/components/RecordIndex/RecordIndex").then(
    (module) => ({ default: module.RecordIndex }),
  ),
);
const JourneyView = lazy(() =>
  import("@/features/trips/components/JourneyView/JourneyView").then(
    (module) => ({ default: module.JourneyView }),
  ),
);
const FiguresPage = lazy(() =>
  import("@/features/stats/components/FiguresPage/FiguresPage").then(
    (module) => ({ default: module.FiguresPage }),
  ),
);

/**
 * Hash router for the persistent spread. Every route renders into the reading
 * margin; the plate beside it is chosen by the classified route rather than by
 * a page component, which is what keeps the map and the rose continuous.
 */
export const router = createHashRouter([
  {
    path: "/",
    element: <Spread />,
    errorElement: <FallbackPage />,
    children: [
      { index: true, element: <Arrival /> },
      { path: "trips", element: <RecordIndex /> },
      { path: "trips/:order", element: <RecordIndex /> },
      { path: "places", element: <RecordIndex /> },
      { path: "places/:filter", element: <RecordIndex /> },
      { path: "trip/:tripId", element: <JourneyView /> },
      { path: "figures", element: <FiguresPage /> },
      { path: "timeline", element: <Navigate replace to="/trips" /> },
      { path: "stats", element: <Navigate replace to="/figures" /> },
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
      { path: "*", element: <Navigate replace to="/" /> },
    ],
  },
]);
