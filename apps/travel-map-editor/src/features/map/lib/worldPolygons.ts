import countriesTopologyJson from "@app/assets/json/countries-50m.json";
import { splitGeometryAtAntimeridian } from "@app/features/map/lib/geo";
import type { FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

const topology = countriesTopologyJson as unknown as Topology<{
  countries: GeometryCollection;
}>;
const rawCountries = feature(
  topology,
  topology.objects.countries,
) as FeatureCollection<Geometry>;

/*
 * The public app's world polygons, so the editor reads as the same map instead
 * of a third-party tile style. They are split at the antimeridian before
 * MapLibre triangulates them, exactly as the public app does: the countries
 * that cross it otherwise fill as bands stretched across the whole map.
 * Only fills and borders are drawn here — labels would need the app's SDF
 * glyphs, which the editor does not serve.
 */
export const countriesGeoJson: FeatureCollection<Geometry> = {
  ...rawCountries,
  features: rawCountries.features.map((country) => ({
    ...country,
    geometry: splitGeometryAtAntimeridian(country.geometry),
  })),
};
