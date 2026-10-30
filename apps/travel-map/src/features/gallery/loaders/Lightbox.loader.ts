import { data, LoaderFunctionArgs } from "react-router";

import { Album } from "@/data/albums";

import { albumLoader, IndexParamSchema } from "./GalleryAlbum.loader";

/**
 * The album a lightbox route resolves to, plus the photo it opens on.
 * @property {Album} album - The album
 * @property {number} photoIdx - The open photo's position in the whole album
 */
export interface LightboxRouteData {
  album: Album;
  photoIdx: number;
}

/**
 * Resolves the lightbox route on top of its album, answering a photo index
 * past the end with a 404.
 * @param {LoaderFunctionArgs} args - React Router loader arguments
 * @param {Album["kind"]} kind - Which kind of album the route serves
 * @returns {LightboxRouteData} The album and photo index
 */
export function lightboxLoader(
  args: LoaderFunctionArgs,
  kind: Album["kind"],
): LightboxRouteData {
  const album = albumLoader(args, kind);
  const photoIdx = IndexParamSchema.safeParse(args.params.photoIdx);
  if (!photoIdx.success || photoIdx.data >= album.count)
    throw data(null, { status: 404 });

  return { album, photoIdx: photoIdx.data };
}
