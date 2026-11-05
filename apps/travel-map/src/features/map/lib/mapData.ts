import { City, COUNTRIES, Country, findCountry } from "@travelmap/core";
import { SUPPORTED_LOCALES } from "@travelmap/ui/i18n/locale";
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
import { env } from "@/shared/lib/env";

/**
 * A label's text in every language the site speaks, by locale, so the map can
 * switch language without rebuilding its sources.
 * @property {string} name - The canonical name, for a locale with no entry
 * @property {Record<string, string>} names - The name in each supported locale
 */
interface LabelProperties {
  name: string;
  names: Record<string, string>;
}

/**
 * Properties stored on a generated city label.
 * @property {number} population - The population used for label priority
 */
interface CityLabelProperties extends LabelProperties {
  population: number;
}

/**
 * Names a place in every supported locale.
 * @param {Country | City} place - A country or city
 * @returns {Record<string, string>} Its name by locale
 */
function namesOf(place: Country | City): Record<string, string> {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, place.getLocalizedName(locale)]),
  );
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
 * @returns {Feature<Point, LabelProperties>[]} A single label feature, when possible
 */
function createCountryLabel(
  country: Feature<Geometry, CountryProperties>,
): Feature<Point, LabelProperties>[] {
  const rings = getExteriorRings(country.geometry);
  const largestRing = rings.toSorted(
    (firstRing, secondRing) =>
      Math.abs(ringArea(secondRing)) - Math.abs(ringArea(firstRing)),
  )[0];

  if (!country.properties.name || !largestRing) return [];

  const drawn = findCountry(country.properties.id ?? "");
  return [
    {
      type: "Feature",
      properties: {
        name: country.properties.name,
        names: drawn ? namesOf(drawn) : {},
      },
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
    properties: {
      name: city.name,
      names: namesOf(city),
      population: city.population ?? 0,
    },
    geometry: { type: "Point", coordinates: city.coordinates },
  };
}

export const countryLabelsGeoJson: FeatureCollection<Point, LabelProperties> = {
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
 * `VITE_COLOR_ALL_COUNTRIES` paints every country instead, to preview them all.
 * @param {MapTheme} theme - The active map theme
 * @returns {unknown} The fill expression, or the land colour when nothing was visited
 */
export function visitedCountryFill(theme: MapTheme): unknown {
  const painted = env.VITE_COLOR_ALL_COUNTRIES
    ? [...COUNTRIES.values()]
    : visitedCountries;
  const fills = painted.map(
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

  /* A polygon carries its country's code, so the display name is free to differ from the map's. */
  return [
    "match",
    ["get", "id"],
    ...fills.flatMap(([country, fill]) => [country.id, fill]),
    theme.land,
  ];
}
