import { LoaderFunctionArgs } from "react-router";

import { visitedCities } from "@/data/world";

import { GalleryProps } from "../components/Gallery/Gallery";

/**
 * Resolves the selected city and travel index for the gallery route.
 * @param {LoaderFunctionArgs} data - React Router loader data
 * @returns {GalleryProps | null} Gallery props, or null when the route is invalid
 */
export function galleryLoader(data: LoaderFunctionArgs): GalleryProps | null {
  const { cityName, travelIdx } = data.params;
  const city = visitedCities.find((city) => city.name === cityName);
  if (!city || !travelIdx) return null;
  return { city, travelIdx: parseInt(travelIdx, 10) };
}
