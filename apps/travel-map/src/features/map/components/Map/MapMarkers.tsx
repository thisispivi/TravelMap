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
 * @property {Map<string, number> | null} tripStopOrder - Route positions of the open trip's stops
 */
interface MapMarkersProps {
  hoveredCity: City | null;
  layoverCities: City[];
  onHoverCity: (city: City | null) => void;
  onSelectCity: (city: City) => void;
  tripStopOrder: Map<string, number> | null;
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
 * Renders every city marker in its corresponding visit-state group. While a
 * trip is open, its own stops are numbered and every other city recedes, so the
 * map shows that one journey instead of every place ever visited.
 * @component
 * @param {MapMarkersProps} props
 * @param {City | null} props.hoveredCity - The currently highlighted city
 * @param {City[]} props.layoverCities - Auxiliary cities shown as layovers
 * @param {(city: City | null) => void} props.onHoverCity - Updates the highlighted city
 * @param {(city: City) => void} props.onSelectCity - Selects a city marker
 * @param {Map<string, number> | null} props.tripStopOrder - Route positions of the open trip's stops
 * @returns {ReactNode} The grouped city markers
 */
export function MapMarkers({
  hoveredCity,
  layoverCities,
  onHoverCity,
  onSelectCity,
  tripStopOrder,
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
        cities.toSorted(sortByCoordinates).map((city) => {
          const order = tripStopOrder?.get(city.name);
          const isOutsideTrip =
            tripStopOrder !== null &&
            variant !== "layover" &&
            order === undefined;

          return (
            <Marker
              city={city}
              hoveredCity={hoveredCity}
              isDimmed={isOutsideTrip}
              key={`${variant}-${city.name}`}
              onHoverCity={onHoverCity}
              onSelectCity={onSelectCity}
              order={order}
              variant={variant}
            />
          );
        }),
      )}
    </>
  );
}
