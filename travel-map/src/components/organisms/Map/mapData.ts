import type { FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

import countriesTopologyJson from "@/assets/json/countries-50m.json";
import { futureCities, livedCities, visitedCities } from "@/data";
import {
  ringArea,
  ringCentroid,
  splitGeometryAtAntimeridian,
} from "@/utils/geo";

/** Colours for one theme, resolved once and shared by every map layer. */
export interface MapTheme {
  ocean: string;
  land: string;
  border: string;
  countryLabel: string;
  countryLabelHalo: string;
  cityLabel: string;
  cityLabelHalo: string;
}

export const MAP_THEMES: Record<"dark" | "light", MapTheme> = {
  dark: {
    ocean: "#0a0a12",
    land: "#181a26",
    border: "rgba(138, 142, 164, 0.22)",
    countryLabel: "#8a8ea4",
    countryLabelHalo: "#11131c",
    cityLabel: "#e4e6f0",
    cityLabelHalo: "rgba(10, 10, 18, 0.94)",
  },
  light: {
    ocean: "#eef1f5",
    land: "#dfe3ea",
    border: "rgba(60, 70, 90, 0.16)",
    countryLabel: "#676b7d",
    countryLabelHalo: "#e7e8ec",
    cityLabel: "#1a1a2e",
    cityLabelHalo: "rgba(240, 242, 245, 0.96)",
  },
};

/** City labels appear tier by tier so the world view stays readable. */
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
] as const;

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sat = s / 100;
  const lig = l / 100;
  const chroma = (1 - Math.abs(2 * lig - 1)) * sat;
  const hue = h / 60;
  const x = chroma * (1 - Math.abs((hue % 2) - 1));
  const [r, g, b] = (
    hue < 1
      ? [chroma, x, 0]
      : hue < 2
        ? [x, chroma, 0]
        : hue < 3
          ? [0, chroma, x]
          : hue < 4
            ? [0, x, chroma]
            : hue < 5
              ? [x, 0, chroma]
              : [chroma, 0, x]
  ) as [number, number, number];
  const m = lig - chroma / 2;
  return [r, g, b].map((c) => Math.round((c + m) * 255)) as [
    number,
    number,
    number,
  ];
}

/**
 * Alpha-composite a country's translucent `hsla(…)` fill over the land tone.
 * Translucent GeoJSON fills leak their internal tile seams as faint hairlines,
 * and opaque tones read cleaner in dark mode.
 *
 * @param {string} hsla - A Country `fillColor`, e.g. `hsla(210, 60%, 50%, 0.6)`
 * @param {string} baseHex - The land colour to composite over, e.g. `#181a26`
 * @returns {string} An opaque `rgb(…)` string
 */
export function toOpaqueFill(hsla: string, baseHex: string): string {
  const [h, s, l, a = 1] = hsla
    .replace(/hsla?\(|\)|%/g, "")
    .split(",")
    .map(Number);
  const [fr, fg, fb] = hslToRgb(h, s, l);
  const [br, bg, bb] = hexToRgb(baseHex);
  const mix = (fore: number, back: number) =>
    Math.round(fore * a + back * (1 - a));
  return `rgb(${mix(fr, br)}, ${mix(fg, bg)}, ${mix(fb, bb)})`;
}

const countriesTopology = countriesTopologyJson as unknown as Topology<{
  countries: GeometryCollection;
}>;

const rawCountries = feature(
  countriesTopology,
  countriesTopology.objects.countries,
) as FeatureCollection<Geometry, { name: string }>;

export const countriesGeoJson: FeatureCollection<Geometry, { name: string }> = {
  ...rawCountries,
  features: rawCountries.features.map((country) => ({
    ...country,
    geometry: splitGeometryAtAntimeridian(country.geometry),
  })),
};

/** One label point per country, placed on its biggest landmass. */
export const countryLabelsGeoJson: FeatureCollection<
  GeoJSON.Point,
  { name: string }
> = {
  type: "FeatureCollection",
  features: countriesGeoJson.features.flatMap((country) => {
    const geometry = country.geometry;
    const rings =
      geometry.type === "MultiPolygon"
        ? geometry.coordinates.flatMap((polygon) => polygon)
        : [];
    const name = country.properties?.name;
    if (!name || rings.length === 0) return [];

    const largest = rings.toSorted(
      (a, b) => Math.abs(ringArea(b)) - Math.abs(ringArea(a)),
    )[0];
    return [
      {
        type: "Feature" as const,
        properties: { name },
        geometry: {
          type: "Point" as const,
          coordinates: ringCentroid(largest),
        },
      },
    ];
  }),
};

export const cityLabelsGeoJson: FeatureCollection<
  GeoJSON.Point,
  { name: string; population: number }
> = {
  type: "FeatureCollection",
  features: Array.from(
    new Map(
      [...visitedCities, ...futureCities, ...livedCities].map((city) => [
        city.name,
        city,
      ]),
    ).values(),
    (city) => ({
      type: "Feature",
      properties: { name: city.name, population: city.population ?? 0 },
      geometry: { type: "Point", coordinates: city.coordinates },
    }),
  ),
};
