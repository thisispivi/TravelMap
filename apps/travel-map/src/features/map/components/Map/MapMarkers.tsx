import { City } from "@travelmap/core";
import { ReactNode } from "react";

import { futureCities, livedCities, visitedCities } from "@/data/world";

import { Marker, MarkerVariant } from "../Marker/Marker";

/**
 * Properties accepted by the grouped map markers.
 * @property {City | null} hoveredCity - The currently highlighted city
 * @property {City[]} layoverCities - Auxiliary cities shown as layovers
 * @property {(city: City | null) => void} onHoverCity - Updates the highlighted city
 * @property {(city: City) => void} onSelectCity - Selects a city marker
 */
interface MapMarkersProps {
  hoveredCity: City | null;
  layoverCities: City[];
  onHoverCity: (city: City | null) => void;
  onSelectCity: (city: City) => void;
}

/**
 * Orders markers north-to-south and then west-to-east for stable rendering.
 * @param {City} firstCity - The first city to compare
 * @param {City} secondCity - The second city to compare
 * @returns {number} The relative sort order
 */
function sortByCoordinates(firstCity: City, secondCity: City): number {
  const [firstLongitude, firstLatitude] = firstCity.coordinates;
  const [secondLongitude, secondLatitude] = secondCity.coordinates;

  if (firstLatitude !== secondLatitude) {
    return firstLatitude < secondLatitude ? 1 : -1;
  }
  if (firstLongitude !== secondLongitude) {
    return firstLongitude < secondLongitude ? -1 : 1;
  }
  return 0;
}

/**
 * MapMarkers component
 * Renders every city marker in its corresponding visit-state group.
 * @component
 * @param {MapMarkersProps} props
 * @param {City | null} props.hoveredCity - The currently highlighted city
 * @param {City[]} props.layoverCities - Auxiliary cities shown as layovers
 * @param {(city: City | null) => void} props.onHoverCity - Updates the highlighted city
 * @param {(city: City) => void} props.onSelectCity - Selects a city marker
 * @returns {ReactNode} The grouped city markers
 */
export function MapMarkers({
  hoveredCity,
  layoverCities,
  onHoverCity,
  onSelectCity,
}: MapMarkersProps): ReactNode {
  const groups: [City[], MarkerVariant][] = [
    [visitedCities, "visited"],
    [futureCities, "future"],
    [livedCities, "lived"],
    [layoverCities, "layover"],
  ];

  return (
    <>
      {groups.map(([cities, variant]) =>
        cities
          .toSorted(sortByCoordinates)
          .map((city) => (
            <Marker
              city={city}
              hoveredCity={hoveredCity}
              key={`${variant}-${city.name}`}
              onHoverCity={onHoverCity}
              onSelectCity={onSelectCity}
              variant={variant}
            />
          )),
      )}
    </>
  );
}
