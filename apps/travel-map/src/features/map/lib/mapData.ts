import { City } from "@travelmap/core";
import {
  countriesGeoJson,
  CountryProperties,
} from "@travelmap/ui/map/lib/countries";
import { ringArea, ringCentroid } from "@travelmap/ui/map/lib/geo";
import { MapTheme, toOpaqueFill } from "@travelmap/ui/map/lib/mapTheme";
import type {
  Feature,
  FeatureCollection,
  Geometry,
  Point,
  Position,
} from "geojson";

import {
  futureCities,
  livedCities,
  visitedCities,
  visitedCountries,
} from "@/data/world";

/**
 * Properties stored on a generated city label.
 * @property {string} name - The city name
 * @property {number} population - The population used for label priority
 */
interface CityLabelProperties {
  name: string;
  population: number;
}

/**
 * Visibility thresholds for one population tier of city labels.
 * @property {string} id - The stable layer suffix
 * @property {number} minPopulation - The inclusive population floor
 * @property {number} maxPopulation - The exclusive population ceiling
 * @property {number} minZoom - The first zoom level at which the tier appears
 */
interface CityLabelTier {
  id: string;
  minPopulation: number;
  maxPopulation: number;
  minZoom: number;
}

export const CITY_LABEL_TIERS = [
  {
    id: "major",
    minPopulation: 1_000_000,
    maxPopulation: Infinity,
    minZoom: 2,
  },
  { id: "large", minPopulation: 300_000, maxPopulation: 1_000_000, minZoom: 3 },
  { id: "medium", minPopulation: 100_000, maxPopulation: 300_000, minZoom: 4 },
  { id: "small", minPopulation: 30_000, maxPopulation: 100_000, minZoom: 5 },
  { id: "local", minPopulation: 0, maxPopulation: 30_000, minZoom: 6 },
] as const satisfies readonly CityLabelTier[];

/**
 * Extracts the exterior rings that can anchor a country label.
 * @param {Geometry} geometry - The country geometry
 * @returns {Position[][]} Exterior polygon rings
 */
function getExteriorRings(geometry: Geometry): Position[][] {
  if (geometry.type === "Polygon") return geometry.coordinates.slice(0, 1);
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flatMap((polygon) => polygon.slice(0, 1));
  }
  return [];
}

/**
 * Creates a label point on the largest landmass of one country.
 * @param {Feature<Geometry, CountryProperties>} country - The country polygon
 * @returns {Feature<Point, CountryProperties>[]} A single label feature, when possible
 */
function createCountryLabel(
  country: Feature<Geometry, CountryProperties>,
): Feature<Point, CountryProperties>[] {
  const rings = getExteriorRings(country.geometry);
  const largestRing = rings.toSorted(
    (firstRing, secondRing) =>
      Math.abs(ringArea(secondRing)) - Math.abs(ringArea(firstRing)),
  )[0];

  if (!country.properties.name || !largestRing) return [];

  return [
    {
      type: "Feature",
      properties: { name: country.properties.name },
      geometry: {
        type: "Point",
        coordinates: ringCentroid(largestRing),
      },
    },
  ];
}

/**
 * Creates a population-ranked label point for one city.
 * @param {City} city - The city represented by the label
 * @returns {Feature<Point, CityLabelProperties>} The city label feature
 */
function createCityLabel(city: City): Feature<Point, CityLabelProperties> {
  return {
    type: "Feature",
    properties: { name: city.name, population: city.population ?? 0 },
    geometry: { type: "Point", coordinates: city.coordinates },
  };
}

export const countryLabelsGeoJson: FeatureCollection<Point, CountryProperties> =
  {
    type: "FeatureCollection",
    features: countriesGeoJson.features.flatMap(createCountryLabel),
  };

const labelCities = new Map(
  [...visitedCities, ...futureCities, ...livedCities].map((city) => [
    city.name,
    city,
  ]),
);

export const cityLabelsGeoJson: FeatureCollection<Point, CityLabelProperties> =
  {
    type: "FeatureCollection",
    features: Array.from(labelCities.values(), createCityLabel),
  };

/**
 * Builds the MapLibre colour expression that paints each visited country in
 * its own pastel, made opaque over the land, and leaves the rest as land.
 * @param {MapTheme} theme - The active map theme
 * @returns {unknown} The fill expression, or the land colour when nothing was visited
 */
export function visitedCountryFill(theme: MapTheme): unknown {
  const fills = visitedCountries.map(
    (country) =>
      [
        country,
        toOpaqueFill(
          theme.countryInk ?? country.fillColor,
          theme.land,
          theme.countryStrength,
        ),
      ] as const,
  );
  /* MapLibre rejects a `match` with no cases, which an empty dataset would give. */
  if (fills.length === 0) return theme.land;

  /*
   * A country is found by its id, the polygon's name in id form, so its
   * display name is free to differ from the map's abbreviated one. The name
   * still matches for a hand-written dataset that used the map's name as is.
   */
  return [
    "match",
    ["get", "id"],
    ...fills.flatMap(([country, fill]) => [country.id, fill]),
    [
      "match",
      ["get", "name"],
      ...fills.flatMap(([country, fill]) => [country.name, fill]),
      theme.land,
    ],
  ];
}
