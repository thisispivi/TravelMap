import { data, LoaderFunctionArgs } from "react-router";

import {
  galleryLoader,
  GalleryRouteData,
  IndexParamSchema,
} from "./Gallery.loader";

/**
 * The gallery a lightbox route resolves to, plus the photo it opens on.
 * @property {number} photoIdx - The selected media index within the travel
 */
export interface LightboxRouteData extends GalleryRouteData {
  photoIdx: number;
}

/**
 * Resolves the lightbox route on top of its parent gallery, answering a photo
 * index past the end of the travel with a 404.
 * @param {LoaderFunctionArgs} args - React Router loader arguments
 * @returns {LightboxRouteData} The resolved gallery and photo index
 */
export function lightboxLoader(args: LoaderFunctionArgs): LightboxRouteData {
  const gallery = galleryLoader(args);
  const photoIdx = IndexParamSchema.safeParse(args.params.photoIdx);
  if (!photoIdx.success || photoIdx.data >= gallery.travel.photos.length)
    throw data(null, { status: 404 });

  return { ...gallery, photoIdx: photoIdx.data };
}
