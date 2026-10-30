import {
  createHashRouter,
  LoaderFunctionArgs,
  Navigate,
  RouteObject,
} from "react-router";

import { MapShell } from "../shell/MapShell";
import { FallbackPage } from "./FallbackPage";

/**
 * Builds an album route. A trip's photos and a place's photos are the same
 * album page reached by a different id, each with the lightbox as a child.
 * @param {"trip" | "place"} kind - Which kind of album the route serves
 * @returns {RouteObject} The album route with its lightbox child
 */
function albumRoute(kind: "trip" | "place"): RouteObject {
  return {
    path: `gallery/${kind}/:albumId`,
    lazy: async () => {
      const [{ GalleryAlbum: Component }, { albumLoader }] = await Promise.all([
        import("@/features/gallery/components/GalleryAlbum/GalleryAlbum"),
        import("@/features/gallery/loaders/GalleryAlbum.loader"),
      ]);
      return {
        Component,
        loader: (args: LoaderFunctionArgs) => albumLoader(args, kind),
      };
    },
    children: [
      {
        path: ":photoIdx",
        lazy: async () => {
          const [{ Lightbox: Component }, { lightboxLoader }] =
            await Promise.all([
              import("@/features/gallery/components/Lightbox/Lightbox"),
              import("@/features/gallery/loaders/Lightbox.loader"),
            ]);
          return {
            Component,
            loader: (args: LoaderFunctionArgs) => lightboxLoader(args, kind),
          };
        },
      },
    ],
  };
}

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
        path: "gallery",
        lazy: async () => {
          const { GalleryIndex: Component } =
            await import("@/features/gallery/components/GalleryIndex/GalleryIndex");
          return { Component };
        },
      },
      albumRoute("trip"),
      albumRoute("place"),
      { path: "*", element: <Navigate replace to="/trips" /> },
    ],
  },
]);
