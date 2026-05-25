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
 * Resolves the selected city, travel, and photo index for the lightbox route.
 *
 * @param {LoaderFunctionArgs<LightboxLoader>} data - React Router loader data
 * @returns {LightboxProps | null} Lightbox props, or null when the route is invalid
 */
export function loader(
  data: LoaderFunctionArgs<LightboxLoader>,
): LightboxProps | null {
  const { cityName, travelIdx, photoIdx } = data.params;
  const city = visitedCities.find((city) => city.name === cityName);
  if (!city || !travelIdx || !photoIdx) return null;
  return {
    city,
    travelIdx: parseInt(travelIdx, 10),
    photoIdx: parseInt(photoIdx, 10),
  };
}
