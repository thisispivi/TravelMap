import { LoaderFunctionArgs } from "react-router";

import { visitedCities } from "../../../data";
import { LightboxProps } from "./Lightbox";

/**
 * Resolves the selected city, travel, and photo index for the lightbox route.
 * @param {LoaderFunctionArgs} data - React Router loader data
 * @returns {LightboxProps | null} Lightbox props, or null when the route is invalid
 */
export function loader(data: LoaderFunctionArgs): LightboxProps | null {
  const { cityName, travelIdx, photoIdx } = data.params;
  const city = visitedCities.find((city) => city.name === cityName);
  if (!city || !travelIdx || !photoIdx) return null;
  return {
    city,
    travelIdx: parseInt(travelIdx, 10),
    photoIdx: parseInt(photoIdx, 10),
  };
}
