import type { FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

import countriesTopologyJson from "@/assets/json/countries-50m.json";

import { splitGeometryAtAntimeridian } from "./geo";

/**
 * Properties stored on a country polygon and its generated label.
 * @property {string} name - The country name
 */
export interface CountryProperties {
  name: string;
}

const countriesTopology = countriesTopologyJson as unknown as Topology<{
  countries: GeometryCollection;
}>;

/**
 * Splits country geometries at the antimeridian before MapLibre triangulates
 * them, preventing polygons from stretching across the world.
 * @returns {FeatureCollection<Geometry, CountryProperties>} The normalized country polygons
 */
function createCountriesGeoJson(): FeatureCollection<
  Geometry,
  CountryProperties
> {
  const rawCountries = feature(
    countriesTopology,
    countriesTopology.objects.countries,
  ) as FeatureCollection<Geometry, CountryProperties>;

  return {
    ...rawCountries,
    features: rawCountries.features.map((country) => ({
      ...country,
      geometry: splitGeometryAtAntimeridian(country.geometry),
    })),
  };
}

/*
 * Shared with the editor, which draws the same world. Keep this module free of
 * dataset imports so the editor does not bundle the public app's world.
 */
export const countriesGeoJson = createCountriesGeoJson();
