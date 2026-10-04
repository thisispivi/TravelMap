import { City, Travel } from "@travelmap/core";
import { data, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { visitedCities, visitedTrips } from "@/data/world";
import { getTravelByCityIndex } from "@/shared/lib/travelQueries";

/** A zero-based index as it appears in a route segment. */
export const IndexParamSchema = z.string().regex(/^\d+$/).transform(Number);

/* A hand-typed or stale URL is the normal way to reach a gallery that is gone. */
const GalleryParamsSchema = z.object({
  cityName: z.string(),
  travelIdx: IndexParamSchema,
});

/**
 * The gallery a route resolves to.
 * @property {City} city - The city whose gallery is displayed
 * @property {number} travelIdx - The selected travel's index among the city's photo travels
 * @property {Travel} travel - The selected travel
 */
export interface GalleryRouteData {
  city: City;
  travelIdx: number;
  travel: Travel;
}

/**
 * Resolves the gallery route's city and travel, answering an unknown city or an
 * out-of-range index with a 404 so the router's error page explains it.
 * @param {LoaderFunctionArgs} args - React Router loader arguments
 * @param {LoaderFunctionArgs["params"]} args.params - The route's raw path segments
 * @returns {GalleryRouteData} The resolved gallery
 */
export function galleryLoader({
  params,
}: LoaderFunctionArgs): GalleryRouteData {
  const parsed = GalleryParamsSchema.safeParse(params);
  const city = parsed.success
    ? visitedCities.find((candidate) => candidate.name === parsed.data.cityName)
    : undefined;
  const travel =
    city && parsed.success
      ? getTravelByCityIndex(city, parsed.data.travelIdx, visitedTrips)
      : undefined;
  if (!city || !travel || !parsed.success) throw data(null, { status: 404 });

  return { city, travel, travelIdx: parsed.data.travelIdx };
}
