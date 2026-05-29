import { LoaderFunctionArgs } from "react-router-dom";

import { visitedCities } from "../../../data";
import { GalleryProps } from "./Gallery";

type GalleryLoader = {
  cityName: string;
  travelIdx: number;
};

/**
 * Gallery loader
 *
 * Resolves the selected city and travel index for the gallery route.
 *
 * @param {LoaderFunctionArgs<GalleryLoader>} data - React Router loader data
 * @returns {GalleryProps | null} Gallery props, or null when the route is invalid
 */
export function loader(
  data: LoaderFunctionArgs<GalleryLoader>,
): GalleryProps | null {
  const { cityName, travelIdx } = data.params;
  const city = visitedCities.find((city) => city.name === cityName);
  if (!city || !travelIdx) return null;
  return { city, travelIdx: parseInt(travelIdx, 10) };
}
