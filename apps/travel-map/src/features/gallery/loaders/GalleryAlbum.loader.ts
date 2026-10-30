import { data, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { Album, findTripAlbum, placeAlbum } from "@/data/albums";
import { visitedCities } from "@/data/world";

/** A zero-based index as it appears in a route segment. */
export const IndexParamSchema = z.string().regex(/^\d+$/).transform(Number);

/* A hand-typed or stale URL is the normal way to reach an album that is gone. */
const AlbumParamsSchema = z.object({ albumId: z.string().min(1) });

/**
 * Resolves the album a route names, a trip's or a place's. An unknown id, or
 * a place with no photos, is a 404 so the router's error page explains it.
 * @param {LoaderFunctionArgs} args - React Router loader arguments
 * @param {LoaderFunctionArgs["params"]} args.params - The route's raw path segments
 * @param {Album["kind"]} kind - Which kind of album the route serves
 * @returns {Album} The album
 */
export function albumLoader(
  { params }: LoaderFunctionArgs,
  kind: Album["kind"],
): Album {
  const parsed = AlbumParamsSchema.safeParse(params);
  const album = !parsed.success
    ? undefined
    : kind === "place"
      ? (() => {
          const city = visitedCities.find(
            (candidate) => candidate.id === parsed.data.albumId,
          );
          return city ? placeAlbum(city) : undefined;
        })()
      : findTripAlbum(parsed.data.albumId);
  if (!album || album.count === 0) throw data(null, { status: 404 });

  return album;
}
