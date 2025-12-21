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
 * The gallery loader is used to load the gallery data.
 *
 * @param {LoaderFunctionArgs<GalleryLoader>} data - The loader data
 * @returns {GalleryProps | null} - The gallery props
 */
export function loader(
  data: LoaderFunctionArgs<GalleryLoader>
): GalleryProps | null {
  const { cityName, travelIdx } = data.params;
  const city = visitedCities.find((city) => city.name === cityName);
  if (!city || !travelIdx) return null;
  return { city, travelIdx: parseInt(travelIdx) };
}
