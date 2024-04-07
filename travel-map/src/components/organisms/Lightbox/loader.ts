import { LoaderFunctionArgs } from "react-router-dom";
import { visitedCities } from "../../../data";
import { LightboxProps } from "./Lightbox";

type LightboxLoader = {
  cityName: string;
  travelIdx: number;
  photoIdx: number;
};

/**
 * Lightbox loader
 *
 * The lightbox loader is used to load the lightbox data.
 *
 * @param {LoaderFunctionArgs<LightboxLoader>} data - The loader data
 * @returns {LightboxProps | null} - The lightbox props
 */
export function loader(
  data: LoaderFunctionArgs<LightboxLoader>
): LightboxProps | null {
  const { cityName, travelIdx, photoIdx } = data.params;
  const city = visitedCities.find((city) => city.name === cityName);
  if (!city || !travelIdx || !photoIdx) return null;
  return { city, travelIdx: parseInt(travelIdx), photoIdx: parseInt(photoIdx) };
}
